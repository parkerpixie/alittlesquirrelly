# A Little Squirrelly 🐿️

**Big feelings. Little victories.**

A mobile-first, gently irreverent little place for Michelle to notice her feelings, record gratitude, find a useful grounding skill, and remember what mattered.

## What is here

- **Today:** Morning and evening gratitude (no streaks), today's check-ins, a single-tap AA meeting link, and optional oracle-card draw.
- **Feelings:** Spin or tap a six-part wheel, select specific emotions, then save or see one tiny next move.
- **Tools:** Brief, usable DBT-informed and mindfulness exercises: STOP, HALT, RAIN, Check the Facts, TIPP, Self Soothe, Wise Mind, grounding.
- **My Days:** Calendar and day-by-day reflections, feelings, gratitude and practices.
- **Oracle:** All 56 animal cards from Parker's public GrizzlyJohn repository, with one reveal per day, no gallery, and the drawn card stored in My Days.

## Design
An urban, hand-drawn squirrel with an adult, creative personality. Plum, berry, teal, ink and warm paper. The app icon includes a lightweight crop of the approved illustrated Chicago squirrel, embedded in `assets/brand-icon.svg`. The complete original artwork can be added later for splash screens, store listings, or a fuller brand system. The oracle deck artwork is automatically imported by a GitHub workflow on push; the initial import successfully completed.

## Data & privacy
Everything entered by Michelle stays in **this browser's local storage**. No account, ad tracking, analytics or hosted private database. To move devices or protect entries, use **Settings → Export backup**, and use **Import backup** to restore. Because local data can disappear when browser storage is cleared, exporting a backup matters. No private GrizzlyJohn entries are copied.

The Sunrisers AA Zoom meeting link and publicly listed passcode (54321) are preloaded from Fitchburg Serenity Club's public meeting schedule. The Join button opens Zoom and attempts to copy the passcode for pasting if Zoom requests it. Both can be overridden in Settings. Browser reminders when the app is closed are **not implemented**; the home view contains AM/PM gratitude instead.

## Run
Open `index.html` in a browser, or publish the repository as a static site in Netlify (`publish = "."`). Install from the phone browser via Add to Home Screen.

## Oracle art
The full card inventory is in `assets/oracle/cards.json`. `scripts/sync-oracle.py` downloads the 56 public PNG assets from `parkerpixie/GrizzlyJohn` into this repo without touching John's saved data. A GitHub Actions workflow is configured to import them automatically when this repository receives the initial app code. The 56 card PNGs are now copied into `assets/oracle/` and loaded locally.

Original ideas adapted from SideQuest, Porter Daily Hub, Open Chair and GrizzlyJohn, with a stripped-down experience for Michelle.
