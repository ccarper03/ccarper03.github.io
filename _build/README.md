# Building charlescarper.com

Run from the repo root:

    python3 _build/build.py

## What it builds (2026 rebuild)

- `ccsite.py`: the shared head, top strip, header, footer, mobile bar and disclosures, plus the components
  (photo slots, home cards, tiles, tool cards, the Monday sign-up). Change the nav or the footer disclosure here
  and every page picks it up on the next build.
- `pages_core.py`: home, move-in ready, Book a visit, Collins Ridge (overview, floor plans, FAQ), Plan your move,
  About, For agents, Privacy, Disclosures, 404 and the unlisted team tools page.
- `pages_situations.py`: the 8 situation pages under `/buyers/`.
- `pages_tools.py`: the tool pages under `/plan/`.
- Guides: the live HTML in `/guides/` is still the source for each guide's body. The build keeps each guide's
  `<main>`, swaps in the new chrome, and applies the wording and link fixes listed in `ccsite.py` (`TEXT_FIXES`,
  `LINK_MAP`). It's safe to run again.
- Redirect stubs for retired URLs (`/book`, `/moving-plan`, `/floor-plans`, `/match`, `/faq`, `/realtors`) and
  `sitemap.xml`.

The copy comes from the Page map and copy tab of the lead strategy doc. Edit the copy in these files, then rebuild.

## Data

`data/move-in-ready.json` feeds the home cards on the home page and the move-in ready list. The Monday refresh
replaces it: finished and almost-finished (M9+) homes from the public drhorton.com Raleigh-Durham inventory page,
plus every Collins Ridge home, each price with its date. Set `"sample": false` once it's real data.

## Photos

Photo slots show a numbered stand-in with the shot direction until the shoot is in. When the real photos land,
swap each slot's image in the page file and set `SHOW_PLACEHOLDERS = False` in `ccsite.py`.

## Scripts

- `site.js`: header, menu, Ask Charles text panel, agent registration, click tracking.
- `js/forms.js`: HubSpot submit, the Monday list sign-up, and `ccGate`, the unlock every tool uses.
- `plan-tools.js`: the Sell & Buy Planner questions and paths, and Floor Plan Match.
- `js/sell-buy-calc.js`: the four-slider calculator (ported from the home-to-sell-planner repo).
- `js/money-tools.js`: Two-Mortgage Check, Buying Power Estimate, Lease-to-Keys Planner. The debt-to-income
  bands at the top need Laura Hall's sign-off before launch.
- `js/homes.js`, `js/visit.js`: move-in ready filters, and the two-step visit booking.

## Older guide sources

The Markdown in `_build/guides/` and `build_guides.py` are older than the live guide pages. Don't regenerate the
guides from them without syncing first.

Evergreen rule for any new content: keep what only changes if something big happens. Anything that changes on a
schedule or by someone's decision (stats, prices, program amounts, build times, features lists, HOA rules) gets a
high-level answer plus where to get the current one.
