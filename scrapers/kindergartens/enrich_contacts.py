#!/usr/bin/env python3
"""
enrich_contacts.py — Find phone, email, website for schools using Google Maps.

Uses Playwright (headless Chromium) to search Google Maps for each school,
click the best matching result, and extract the phone number + website
from the fully rendered Knowledge Panel.

Usage:
  python3 enrich_contacts.py                  # all rows missing contact
  python3 enrich_contacts.py --limit 100      # first 100 missing
  python3 enrich_contacts.py --dry-run        # preview, no save
  python3 enrich_contacts.py --start 200      # skip first 200 todo rows
"""

import csv
import re
import time
import argparse
import sys
import urllib.parse
from pathlib import Path
from difflib import SequenceMatcher
from playwright.sync_api import sync_playwright, Page

sys.stdout.reconfigure(line_buffering=True)

# ── Config ────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
CSV_PATH   = SCRIPT_DIR / "schools_export.csv"
OUT_PATH   = SCRIPT_DIR / "schools_export.csv"

MAPS_WAIT    = 4_000   # ms to wait for Google Maps to render
NAV_TIMEOUT  = 15_000
DELAY_SCHOOL = 1.5     # seconds between schools
SAVE_EVERY   = 20
MIN_SCORE    = 0.35    # minimum name similarity to accept a result

# ── Regexes ───────────────────────────────────────────────────────────────────

PHONE_RE = re.compile(
    r'(?<!\d)'
    r'(?:\+84[\s.\-]?|0)'
    r'[235789]\d'
    r'(?:[\s.\-]?\d){7,8}'
    r'(?!\d)'
)
EMAIL_RE = re.compile(
    r'\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b'
)
JUNK_EMAIL = re.compile(r'@(google|bing|duckduckgo|yahoo|example|test|schema|sentry)\.')

# ── Helpers ───────────────────────────────────────────────────────────────────

def normalize_phone(raw: str) -> str:
    digits = re.sub(r"[^\d+]", "", raw)
    if digits.startswith("+84"):
        digits = "0" + digits[3:]
    if re.fullmatch(r"0[2-9]\d{8,9}", digits):
        return digits
    return ""

def name_similarity(a: str, b: str) -> float:
    def clean(s):
        s = s.lower()
        # Remove common Vietnamese school prefixes that differ between sources
        for p in ["trường ", "trung tâm ", "mầm non ", "school", "international", " - "]:
            s = s.replace(p, " ")
        return re.sub(r"\s+", " ", s).strip()
    return SequenceMatcher(None, clean(a), clean(b)).ratio()

# ── Google Maps search ────────────────────────────────────────────────────────

def search_google_maps(page: Page, name: str, address: str) -> dict:
    """
    Search Google Maps for the school, click the best result,
    and return {phone, email, website} from the detail panel.
    """
    q = urllib.parse.quote(f"{name} {address}")
    url = f"https://www.google.com/maps/search/{q}/@10.78,106.69,12z?hl=vi"

    try:
        page.goto(url, timeout=NAV_TIMEOUT, wait_until="domcontentloaded")
        try:
            page.wait_for_load_state("networkidle", timeout=MAPS_WAIT)
        except Exception:
            page.wait_for_timeout(MAPS_WAIT)
    except Exception:
        return {}

    # ── Try clicking the best matching result ──────────────────────────────
    result_clicked = False
    try:
        # Result cards in the left panel
        cards = page.query_selector_all("a[href*='/maps/place/']")
        best_score = 0.0
        best_card = None

        for card in cards[:8]:
            card_text = (card.get_attribute("aria-label") or
                         card.inner_text() or "").strip()
            score = name_similarity(name, card_text)
            if score > best_score:
                best_score = score
                best_card = card

        if best_card and best_score >= MIN_SCORE:
            best_card.click()
            try:
                page.wait_for_load_state("networkidle", timeout=MAPS_WAIT)
            except Exception:
                page.wait_for_timeout(MAPS_WAIT)
            result_clicked = True
    except Exception:
        pass

    # ── Extract text from the panel ────────────────────────────────────────
    text = page.evaluate("() => document.body.innerText") or ""

    phones = []
    for m in PHONE_RE.findall(text):
        p = normalize_phone(m)
        if p and p not in phones:
            phones.append(p)

    emails = [e for e in EMAIL_RE.findall(text)
              if not JUNK_EMAIL.search(e)]

    # ── Extract website from panel buttons ────────────────────────────────
    website = ""
    try:
        # "Trang web" or "Website" button on Google Maps detail panel
        for sel in ['a[data-item-id="authority"]', 'a[href*="http"]:has-text("Trang web")',
                    'a[aria-label*="Trang web"]', 'button[aria-label*="Trang web"]']:
            el = page.query_selector(sel)
            if el:
                href = el.get_attribute("href") or ""
                if href.startswith("http"):
                    website = href
                    break
    except Exception:
        pass

    return {
        "phone":   phones[0] if phones else "",
        "email":   emails[0] if emails else "",
        "website": website,
        "_clicked": result_clicked,
    }

# ── CSV helpers ────────────────────────────────────────────────────────────────

def load_csv(path: Path):
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = list(reader.fieldnames or [])
    return rows, fieldnames

def save_csv(path: Path, rows: list, fieldnames: list) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit",   type=int, default=0)
    parser.add_argument("--start",   type=int, default=0)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    rows, fieldnames = load_csv(CSV_PATH)

    todo = [
        (i, r) for i, r in enumerate(rows)
        if not (r.get("phone") or r.get("email") or r.get("website"))
    ]
    if args.start:
        todo = todo[args.start:]
    if args.limit:
        todo = todo[:args.limit]

    total_missing = len([r for _, r in enumerate(rows)
                         if not (r.get("phone") or r.get("email") or r.get("website"))])

    print(f"\n🏫 School Contact Enricher — Google Maps")
    print(f"   Total missing: {total_missing}  |  This run: {len(todo)}  |  dry-run: {args.dry_run}\n")

    found_full    = 0
    found_website = 0

    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            headless=True,
            args=[
                "--lang=vi-VN",
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
            ]
        )
        context = browser.new_context(
            locale="vi-VN",
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1440, "height": 900},
        )
        page = context.new_page()

        for idx, (row_idx, row) in enumerate(todo):
            name    = row["name"]
            address = row["address"] or row.get("province") or "Hồ Chí Minh"
            label   = (name[:55] + "…") if len(name) > 55 else name

            print(f"[{idx+1}/{len(todo)}] {label}")

            result = search_google_maps(page, name, address)

            phone   = result.get("phone", "")
            email   = result.get("email", "")
            website = result.get("website", "")
            clicked = result.get("_clicked", False)

            if phone or email:
                print(f"    ✓ Maps {'↪' if clicked else '·'}  📞 {phone}"
                      + (f"  ✉  {email}" if email else "")
                      + (f"  🌐 {website[:40]}" if website else ""))
                found_full += 1
            elif website:
                print(f"    ~ Website → {website[:60]}")
                found_website += 1
            else:
                print(f"    ✗ Nothing found")

            if not args.dry_run:
                rows[row_idx]["phone"]   = phone   or row.get("phone", "")
                rows[row_idx]["email"]   = email   or row.get("email", "")
                rows[row_idx]["website"] = website or row.get("website", "")

            if not args.dry_run and (idx + 1) % SAVE_EVERY == 0:
                save_csv(OUT_PATH, rows, fieldnames)
                print(f"    💾 Saved progress ({idx+1}/{len(todo)})")

            time.sleep(DELAY_SCHOOL)

        browser.close()

    if not args.dry_run:
        save_csv(OUT_PATH, rows, fieldnames)

    nothing = len(todo) - found_full - found_website
    print(f"\n{'='*52}")
    print(f"✅ Phone/email found : {found_full}")
    print(f"🌐 Website only      : {found_website}")
    print(f"❌ Nothing found     : {nothing}")
    print(f"📊 Hit rate          : {(found_full+found_website)/max(len(todo),1)*100:.1f}%")
    if not args.dry_run:
        print(f"💾 Saved             : {OUT_PATH}")

if __name__ == "__main__":
    main()
