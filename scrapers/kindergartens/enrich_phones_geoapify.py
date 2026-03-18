"""
Phone Number Enrichment Script - Geoapify Places API

Fetches phone numbers for kiddihub_schools records by:
1. Geocoding each school's address → lat/lng
2. Searching Geoapify Places near those coordinates for matching school
3. Extracting phone number from best match
4. Updating kiddihub_schools in Supabase

Usage:
  pip install requests python-dotenv
  python enrich_phones_geoapify.py               # process all schools
  python enrich_phones_geoapify.py --limit 20    # test with 20 schools
  python enrich_phones_geoapify.py --dry-run      # show matches without saving

Free tier: 3,000 requests/day — enough for ~500 schools (2 requests each)
"""

import os
import re
import json
import time
import argparse
import requests
from pathlib import Path
from difflib import SequenceMatcher
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
GEOAPIFY_KEY = os.environ.get("GEOAPIFY_API_KEY", "76253b5951f84f66b88d2a70940bb8e2")

SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

GEOAPIFY_BASE = "https://api.geoapify.com"


def name_similarity(a: str, b: str) -> float:
    """Return 0-1 similarity between two school names."""
    a = re.sub(r'[^\w\s]', '', a.lower())
    b = re.sub(r'[^\w\s]', '', b.lower())
    return SequenceMatcher(None, a, b).ratio()


def geocode_address(address: str) -> tuple:
    """Convert address string to (lat, lon). Returns (None, None) on failure."""
    url = f"{GEOAPIFY_BASE}/v1/geocode/search"
    params = {
        "text": address + ", Ho Chi Minh City, Vietnam",
        "countrycodes": "vn",
        "limit": 1,
        "apiKey": GEOAPIFY_KEY,
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        features = resp.json().get("features", [])
        if features:
            coords = features[0]["geometry"]["coordinates"]
            return coords[1], coords[0]  # lat, lon
    except Exception as e:
        print(f"    Geocode error: {e}")
    return None, None


def search_places_near(lat: float, lon: float, school_name: str) -> dict:
    """Search for a school near lat/lon, return best matching place dict."""
    url = f"{GEOAPIFY_BASE}/v2/places"
    params = {
        "categories": "education",
        "filter": f"circle:{lon},{lat},500",  # 500m radius
        "limit": 10,
        "apiKey": GEOAPIFY_KEY,
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        features = resp.json().get("features", [])
    except Exception as e:
        print(f"    Places search error: {e}")
        return {}

    best_match = None
    best_score = 0.0

    for f in features:
        props = f.get("properties", {})
        name = props.get("name", "")
        if not name:
            continue
        score = name_similarity(school_name, name)
        if score > best_score:
            best_score = score
            best_match = props

    if best_match and best_score >= 0.25:
        return {"place": best_match, "score": best_score}
    return {}


def extract_phone(place: dict) -> str:
    """Extract phone number from a Geoapify place properties dict."""
    # Try contact.phone first
    contact = place.get("contact", {}) or {}
    phone = contact.get("phone") or contact.get("telephone")
    if phone:
        return phone.strip()

    # Try top-level fields
    for key in ("phone", "telephone", "tel"):
        val = place.get(key)
        if val:
            return str(val).strip()

    return ""


def get_schools(limit: int = 0, offset: int = 0) -> list:
    """Fetch schools from Supabase that don't have phone numbers yet."""
    url = f"{SUPABASE_URL}/rest/v1/kiddihub_schools"
    params = {
        "select": "id,name,address,slug,phone",
        "published": "eq.true",
        "phone": "is.null",
        "order": "id",
        "limit": str(limit if limit > 0 else 500),
        "offset": str(offset),
    }
    resp = requests.get(url, headers=SUPABASE_HEADERS, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


def update_school_phone(school_id: str, phone: str, website: str = None) -> bool:
    """Update a school record with phone (and optionally website)."""
    url = f"{SUPABASE_URL}/rest/v1/kiddihub_schools?id=eq.{school_id}"
    payload = {"phone": phone}
    if website:
        payload["website"] = website
    resp = requests.patch(url, headers=SUPABASE_HEADERS, json=payload, timeout=10)
    return resp.status_code in (200, 204)


def main():
    parser = argparse.ArgumentParser(description="Enrich kiddihub_schools with phone numbers via Geoapify")
    parser.add_argument("--limit", type=int, default=0, help="Max schools to process (0 = all)")
    parser.add_argument("--dry-run", action="store_true", help="Print matches without saving to DB")
    parser.add_argument("--delay", type=float, default=0.5, help="Seconds between API calls (default: 0.5)")
    args = parser.parse_args()

    print("📞 Phone Enrichment via Geoapify")
    print(f"   Mode    : {'DRY RUN' if args.dry_run else 'LIVE'}")
    print(f"   Limit   : {args.limit or 'all'}")
    print(f"   Delay   : {args.delay}s\n")

    schools = get_schools(limit=args.limit)
    print(f"📋 Schools to process: {len(schools)}\n")

    found = 0
    not_found = 0
    errors = 0

    for i, school in enumerate(schools, 1):
        name = school["name"]
        address = school.get("address", "")
        school_id = school["id"]

        print(f"[{i}/{len(schools)}] {name[:60]}")

        if not address:
            print(f"    ⚠ No address — skipping")
            not_found += 1
            continue

        # Step 1: Geocode
        lat, lon = geocode_address(address)
        time.sleep(args.delay)

        if not lat:
            print(f"    ✗ Could not geocode: {address[:50]}")
            not_found += 1
            continue

        print(f"    📍 {lat:.4f}, {lon:.4f}")

        # Step 2: Search nearby
        result = search_places_near(lat, lon, name)
        time.sleep(args.delay)

        if not result:
            print(f"    ✗ No match found nearby")
            not_found += 1
            continue

        place = result["place"]
        score = result["score"]
        matched_name = place.get("name", "?")
        phone = extract_phone(place)
        website = place.get("website") or place.get("contact", {}).get("website")

        if not phone:
            print(f"    ~ Match: {matched_name[:50]} (score={score:.2f}) — no phone")
            not_found += 1
            continue

        print(f"    ✓ Match: {matched_name[:50]} (score={score:.2f})")
        print(f"    📞 Phone: {phone}")
        if website:
            print(f"    🌐 Website: {website}")

        if not args.dry_run:
            ok = update_school_phone(school_id, phone, website)
            if ok:
                print(f"    💾 Saved!")
                found += 1
            else:
                print(f"    ✗ Save failed")
                errors += 1
        else:
            found += 1

        print()

    print(f"\n{'='*50}")
    print(f"✅ Found phone   : {found}")
    print(f"❌ Not found     : {not_found}")
    print(f"⚠  Errors        : {errors}")
    print(f"📊 Success rate  : {found/(len(schools) or 1)*100:.1f}%")


if __name__ == "__main__":
    main()
