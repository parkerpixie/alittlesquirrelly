# A Little Squirrelly 🐿️

**Big feelings. Little victories.**

A mobile-first, gently irreverent little place for Michelle to notice her feelings, record gratitude, find a useful grounding skill, and remember what mattered.

## What is here

- **Today:** Morning and evening gratitude (no streaks), today's check-ins, a single-tap AA meeting link, and optional oracle-card draw.
- **Feelings:** Spin or tap a six-part wheel, select specific emotions, then save or see one tiny next move.
- **Tools:** Brief, usable DBT-informed and mindfulness exercises: STOP, HALT, RAIN, Check the Facts, TIPP, Self Soothe, Wise Mind, grounding.
- **My Days:** Calendar and day-by-day reflections, feelings, gratitude and practices.
- **Oracle:** All 56 animal cards from Parker's public GrizzlyJohn repository, with full gallery, draw-one-per-day and image viewer.

## Design
An urban, hand-drawn squirrel with an adult, creative personality. Plum, berry, teal, ink and warm paper. The full approved artwork belongs to this project but **must be uploaded** under `assets/brand-art.jpg` and `assets/icons/` if not included by deployment; the interface falls back gracefully. The oracle deck artwork is automatically imported by a GitHub workflow on push.

## Data & privacy
Everything entered by Michelle stays in **this browser's local storage**. No account, ad tracking, analytics or hosted private database. To move devices or protect entries, use **Settings → Export backup**, and use **Import backup** to restore. Because local data can disappear when browser storage is cleared, exporting a backup matters. No private GrizzlyJohn entries are copied.

Meeting URL is optional and entered in Settings. Browser reminders when the app is closed are **not implemented**; the home view contains AM/PM gratitude instead.

## Run
Open `index.html` in a browser, or publish the repository as a static site in Netlify (`publish = "."`). Install from the phone browser via Add to Home Screen.

## Oracle art
The full card inventory is in `assets/oracle/cards.json`. `scripts/sync-oracle.py` downloads the 56 public PNG assets from `parkerpixie/GrizzlyJohn` into this repo without touching John's saved data. A GitHub Actions workflow is configured to import them automatically when this repository receives the initial app code. Until they are locally available, cards fall back to public GrizzlyJohn image URLs.

Original ideas adapted from SideQuest, Porter Daily Hub, Open Chair and GrizzlyJohn, with a stripped-down experience for Michelle.
