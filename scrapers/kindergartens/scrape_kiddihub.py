"""
KiddiHub Scraper - No API keys required!

Scrapes school/kindergarten data from kiddihub.com by extracting
the server-side rendered Nuxt.js state embedded in each page's HTML.

How it works:
  kiddihub.com is a Nuxt.js SSR site. Every listing page embeds the full
  dataset in a <script id="__NUXT_DATA__"> tag as a dehydrated JSON array.
  We fetch each page, parse that JSON, resolve the pointer references,
  and extract clean school records — no API keys, no browser automation.

Discovered via browser DevTools:
  - Listing URL:  https://kiddihub.com/tim-kiem/{province}?page={N}
  - Per page:     25 records
  - Total HCM:    ~3,100 kindergartens across 125 pages

Usage:
  pip install -r requirements.txt

  # Test with first 2 pages only
  python scrape_kiddihub.py --pages 2

  # Full HCM kindergarten scrape (~125 pages, ~3100 records)
  python scrape_kiddihub.py

  # Other categories / provinces
  python scrape_kiddihub.py --province ha-noi
  python scrape_kiddihub.py --category trung-tam-tieng-anh --province ho-chi-minh

  # Dry run (fetch page 1 only and print JSON)
  python scrape_kiddihub.py --dry-run

Categories available on kiddihub:
  mam-non (default)          - Kindergarten
  tieu-hoc                   - Elementary school
  thcs                       - Middle school
  thpt                       - High school
  trung-tam-tieng-anh        - English language center
  trung-tam-day-nhac         - Music center
  ... and many more
"""

import os
import re
import json
import time
import argparse
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Tuple, Dict, Any

# ─── Config ──────────────────────────────────────────────────────────────────

BASE_URL = "https://kiddihub.com"
OUTPUT_DIR = Path("output")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
}

# Province → display name mapping
PROVINCE_NAMES = {
    "ho-chi-minh": "Hồ Chí Minh",
    "ha-noi": "Hà Nội",
    "da-nang": "Đà Nẵng",
    "binh-duong": "Bình Dương",
    "dong-nai": "Đồng Nai",
    "can-tho": "Cần Thơ",
    "hai-phong": "Hải Phòng",
}

# Category → URL slug mapping (used in ?category= param or sub-path)
CATEGORY_URLS = {
    "mam-non": "",                              # default: /tim-kiem/{province}
    "tieu-hoc": "/tim-kiem/tieu-hoc",
    "thcs": "/tim-kiem/thcs",
    "thpt": "/tim-kiem/thpt",
    "trung-tam-tieng-anh": "/tim-kiem/trung-tam-tieng-anh",
}


# ─── Nuxt dehydrated state resolver ──────────────────────────────────────────

def build_resolver(data: List):
    """
    Returns a resolve() function with a memoisation cache over the data array.
    This avoids re-resolving the same index multiple times and prevents exponential blowup.
    """
    cache: Dict[int, Any] = {}
    in_progress: set = set()   # cycle detection

    def _r(v: Any, depth: int = 0) -> Any:
        if not isinstance(v, int) or v < 0 or v >= len(data):
            return v
        if v in in_progress or depth > 20:
            return None
        if v in cache:
            return cache[v]

        in_progress.add(v)
        item = data[v]

        if isinstance(item, (str, float, bool, type(None))):
            result = item
        elif isinstance(item, int):
            # An integer stored directly in the array IS the literal value.
            # Only integers inside dicts/lists are pointers (handled below).
            result = item
        elif isinstance(item, list):
            if len(item) == 2 and item[0] in ("ShallowReactive", "Reactive", "ShallowRef"):
                result = _r(item[1], depth + 1)
            else:
                result = [_r(x, depth + 1) if isinstance(x, int) else x for x in item]
        elif isinstance(item, dict):
            result = {
                k: (_r(val, depth + 1) if isinstance(val, int) else val)
                for k, val in item.items()
            }
        else:
            result = item

        in_progress.discard(v)
        cache[v] = result
        return result

    return _r


def get_school_list_fast(raw: List) -> Optional[Dict]:
    """
    Directly navigate the Nuxt dehydration structure to get the school records.
    Index 200 = the page data ({records, total, pageCount}).
    Uses a memoised resolver for performance.
    """
    _r = build_resolver(raw)
    result = _r(200)
    if isinstance(result, dict) and "records" in result:
        return result
    return None


def extract_nuxt_data(html: str) -> Optional[List]:
    """Extract and parse the __NUXT_DATA__ JSON from page HTML."""
    m = re.search(r'id="__NUXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
    if not m:
        return None
    try:
        return json.loads(m.group(1).strip())
    except json.JSONDecodeError:
        return None


def get_school_list(raw: List) -> Optional[Dict]:
    """Resolve index 200 from the Nuxt data array → {records, total, pageCount}."""
    return get_school_list_fast(raw)


# ─── Data extraction ──────────────────────────────────────────────────────────

def clean_record(r: Dict, province: str, category: str, page: int) -> Dict:
    """Flatten and clean a raw school record."""
    # Extract image URLs
    banners = r.get("banners") or {}
    picture = r.get("picture") or {}

    return {
        # Identity
        "kiddihub_id": r.get("id"),
        "slug": r.get("slug_name", ""),
        "kiddihub_url": f"{BASE_URL}/truong/{r.get('slug_name', '')}",
        "name": r.get("name", ""),
        "short_name": r.get("short_name", ""),

        # Location
        "address": r.get("address", ""),
        "province": PROVINCE_NAMES.get(province, province),
        "province_slug": province,

        # School info
        "school_type": r.get("type"),           # 1=private, 3=bilingual, 4=international
        "category": category,
        "age_from_months": r.get("children_from"),
        "age_to_months": r.get("children_to"),
        "age_range": r.get("age_children", ""),
        "status": r.get("status"),              # 1=active

        # Tuition
        "tuition_min": r.get("min_tuition"),
        "tuition_max": r.get("max_tuition"),
        "tuition_unit": r.get("tuition_unit", "tháng"),  # month/year

        # Quality signals
        "rating": r.get("average_star"),
        "review_count": r.get("review_count"),
        "recommend_count": r.get("recommend"),
        "advice_request_count": r.get("advice_request_count"),
        "verified": bool(r.get("verify")),
        "member": bool(r.get("member")),
        "refund_commitment": bool(r.get("refund_commitment")),

        # Images
        "banner_lg": banners.get("lg", ""),
        "banner_md": banners.get("md", ""),
        "banner_xs": banners.get("xs", ""),
        "avatar_origin": picture.get("origin", ""),
        "avatar_lg": picture.get("lg", ""),

        # Criteria/programs (list of IDs like Montessori, Bilingual, etc.)
        "criteria_ids": r.get("criterias", []),

        # Meta
        "has_promotions": len(r.get("promotions") or []) > 0,
        "source": "kiddihub",
        "scraped_at": datetime.utcnow().isoformat(),
        "scrape_page": page,
    }


# ─── HTTP ─────────────────────────────────────────────────────────────────────

def fetch_page(province: str, page: int, delay: float = 1.5) -> Optional[Tuple]:
    """Fetch one listing page and return its school records."""
    url = f"{BASE_URL}/tim-kiem/{province}?page={page}"

    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"  ✗ Request error page {page}: {e}")
        return None

    raw = extract_nuxt_data(resp.text)
    if raw is None:
        print(f"  ✗ No __NUXT_DATA__ found on page {page}")
        return None

    result = get_school_list(raw)
    if result is None:
        print(f"  ✗ No school records at index 200 on page {page}")
        return None

    records = result.get("records", [])
    total = result.get("total", 0)
    page_count = result.get("pageCount", 0)

    time.sleep(delay)
    return records, total, page_count


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Scrape kiddihub.com school listings")
    parser.add_argument("--province", default="ho-chi-minh",
                        help="Province slug (default: ho-chi-minh)")
    parser.add_argument("--category", default="mam-non",
                        help="Category slug (default: mam-non)")
    parser.add_argument("--pages", type=int, default=0,
                        help="Max pages to scrape (0 = all)")
    parser.add_argument("--delay", type=float, default=1.5,
                        help="Seconds between requests (default: 1.5)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Fetch page 1 only and print results")
    parser.add_argument("--output", type=str, default="",
                        help="Output JSON filename (auto-named if not set)")
    args = parser.parse_args()

    province = args.province
    category = args.category

    print(f"🏫 KiddiHub Scraper")
    print(f"   Province : {PROVINCE_NAMES.get(province, province)}")
    print(f"   Category : {category}")
    print(f"   Delay    : {args.delay}s between requests")

    # Fetch page 1 to get totals
    print(f"\n📡 Fetching page 1...")
    result = fetch_page(province, 1, delay=0)
    if result is None:
        print("❌ Failed to fetch page 1. Aborting.")
        return

    records_p1, total, page_count = result
    print(f"   Total records : {total}")
    print(f"   Total pages   : {page_count}")
    print(f"   Per page      : {len(records_p1)}")

    if args.dry_run:
        clean = [clean_record(r, province, category, 1) for r in records_p1[:3]]
        print(f"\n🔍 DRY RUN — first 3 records:")
        print(json.dumps(clean, ensure_ascii=False, indent=2))
        return

    max_pages = args.pages if args.pages > 0 else page_count
    all_records = [clean_record(r, province, category, 1) for r in records_p1]

    print(f"   Scraping      : {max_pages} pages")
    print()

    for page in range(2, max_pages + 1):
        result = fetch_page(province, page, delay=args.delay)
        if result is None:
            print(f"  ⚠ Skipping page {page}")
            continue

        records, _, _ = result
        cleaned = [clean_record(r, province, category, page) for r in records]
        all_records.extend(cleaned)

        pct = (page / max_pages) * 100
        print(f"  [{pct:5.1f}%] Page {page}/{max_pages} → {len(all_records)} records total")

    # Deduplicate by kiddihub_id
    seen = {}
    for r in all_records:
        kid = r["kiddihub_id"]
        if kid not in seen:
            seen[kid] = r
    all_records = list(seen.values())

    print(f"\n✅ Scraped {len(all_records)} unique records")

    # Save output
    OUTPUT_DIR.mkdir(exist_ok=True)
    filename = args.output or f"kiddihub_{province}_{category}_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
    out_path = OUTPUT_DIR / filename

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(all_records, f, ensure_ascii=False, indent=2)

    print(f"💾 Saved to {out_path}")
    print(f"\n📊 Summary:")
    print(f"   Records : {len(all_records)}")
    print(f"   Verified: {sum(1 for r in all_records if r['verified'])}")
    print(f"   With ratings: {sum(1 for r in all_records if r['rating'])}")


if __name__ == "__main__":
    main()
