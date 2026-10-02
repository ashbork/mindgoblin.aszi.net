#!/usr/bin/env python3
"""Regenerate src/sheets.json from Scryfall's Unfinity sticker sheets.

Images stay on Scryfall's CDN and are cached by the service worker as the app
loads them, so the card art is not stored in this repo.
"""
import json
import pathlib
import time
import urllib.request

URL = "https://api.scryfall.com/cards/search?q=t%3Astickers&unique=cards&order=name"
HEADERS = {"User-Agent": "mtg-sticker-roller/1.0", "Accept": "application/json"}
MULTI_WORD_STICKERS = ["Hot Dog"]

ROOT = pathlib.Path(__file__).resolve().parent.parent


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS)).read()


def search(url):
    cards = []
    while url:
        page = json.loads(get(url))
        cards.extend(page["data"])
        url = page.get("next_page") if page.get("has_more") else None
        if url:
            time.sleep(0.1)
    return cards


def name_stickers(sheet_name):
    for sticker in MULTI_WORD_STICKERS:
        if sticker in sheet_name:
            rest = sheet_name.replace(sticker, "\0").split()
            return [sticker if w == "\0" else w for w in rest]
    return sheet_name.split()


def main():
    sheets = [
        {
            "name": card["name"],
            "stickers": name_stickers(card["name"]),
            "image": card["image_uris"]["normal"],
            "url": card["scryfall_uri"].split("?")[0],
        }
        for card in search(URL)
    ]
    assert len(sheets) == 48 and all(len(s["stickers"]) == 3 for s in sheets)
    (ROOT / "src" / "sheets.json").write_text(json.dumps(sheets, indent=2) + "\n")
    print(f"Wrote {len(sheets)} sheets to {ROOT / 'src' / 'sheets.json'}")


if __name__ == "__main__":
    main()
