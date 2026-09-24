# Round 3: open items after the cross-critique

*Moderator (architect), after reading `03-critique-by-a.md` and `04-critique-by-b.md`.*

## What happened in round 2

The two analysts persuaded each other so completely that they **swapped positions** on six questions. Neither can simply "win" those items now. They have to meet in the middle.

## Converged (both analysts now agree, so these are decided)

- **Page and surfaces:** velvet dark page **#140F1A**, raised #1E1726, overlay #2A2133, with the round-1 Late Show text tokens. The Matinee light theme is paper #FBF7F1 and white.
- **Sharing:**
  - The **link plus complete text** is the MUST, using the readable URL `#/date?m=&r=&d=&at=&note=`.
  - The note is plain text of 80 characters or fewer, set with `textContent`.
  - A **typographic share image with no third-party pixels** is a COULD, offered as a separate action.
- **Type core:**
  - The wordmark is **outlined SVG** at 0 KB. The architect has already generated it from Roboto Condensed 800.
  - **Roboto Condensed 700 static** (21.1 KB) is for labels and ticket fields.
  - **Atkinson Hyperlegible Next** is for body and UI text.
- **Uppercase:** only via `text-transform`, for labels of three words or fewer at 1rem or larger.
- **Focus rings:** 3 px with a 2 px offset.
- **Text floor:** 0.875rem.
- **Four MUSTs:**
  1. **Date Ticket / Admit Two:** save, share as link plus text, an `.ics` file with a VALARM, the run of show with cook-time chips (30, 45, 60 or 90 minutes), and a "you've been sent a date" banner.
  2. **Vibe Pairing:** origin, then keywords, then genre, with an `idMeal` intersection, a staged and announced fallback, a "why" line, a "Match the movie" switch, and a drink chosen on the ticket that defaults to zero-proof.
  3. **House Rules:** streaming services and region, rating cap, Vegetarian and Vegan by category, and zero-proof, all remembered, with JustWatch credit.
  4. **Cook-along:**
     - Wake Lock with a visible off switch.
     - Step cards, "All steps" and an ingredient checklist.
     - Timers based on timestamps, 64 px Back and Next buttons.
     - A countdown to "Press play" and an offline cache for saved dates.
- **Afterglow ratings and notes** are a COULD.
- **Diary export and import (JSON)** ships inside the Date Ticket.
- **Meat exclusions** ("no pork" or "no beef") can't be done exactly by category subtraction. They become a best-effort ingredient scan labelled that way, or they're dropped.
- **Motion:**
  - Step transitions are 300 ms or less.
  - One 650 ms "ticket print" plays when the ticket first appears.
  - Everything is removed or reduced to a crossfade under reduced motion.
  - No animated `box-shadow` and no 40 px blur.

## Still open: current positions (note the swaps)

| # | Item | A now says | B now says |
|---|---|---|---|
| 1 | **Brand lime** | Heritage **#23D160** (the owner named it; moving the hue 56° is a rebrand) | Citrus **#9FE143** (#23D160 is Bulma's default `$green`; Zest is what a lime actually looks like) |
| 2 | **Display serif** | **No Fraunces.** A cinema ticket speaks in condensed sans. 55.1 KB total | **Fraunces upright, wght axis only** (36.6 KB, `font-display: optional`) for H1 and H2. 82.5 KB total |
| 3 | **Deciding together** | **Shortlist + "You pick"** as a **MUST**, with an "It's a date" moment | **Match Night, pass the phone,** buttons first, with "You pick" breaking ties, as a **SHOULD** |
| 4 | **The fifth MUST** | Shortlist + You pick | **Spin the Lime / Surprise us** with holds |
| 5 | **Movie step** | **Genre chips** plus 2–3 blend chips (Rom-com and so on), with "What's the mood tonight?" as the H1 | A **Mood** radio group with the genres in the labels, "their mood" as an optional second group, and exact genres behind `<details>` |
| 6 | **Movie results** | B's round-1 **horizontal card with Pick** and lazy details (4 at a time, so the real certification shows on the card) | A's round-1 **poster grid, with a sheet on tap**. Details are fetched only when the sheet opens |
| 7 | **Food thumbnails** | **Squares** in lists and a **circle only on the ticket** | **Circles** up to 160 px, and the full square in the recipe sheet |
| 8 | **First visit** | **Follow the OS**, with a remembered toggle | **Dark-first** (the harms aren't symmetric), with the toggle in the mobile header and "Match system" offered |
| 9 | **The ticket in dark mode** | **Paper** #F7F0E4, which inverts the theme | **Raised velvet with a Zest stub**, because paper measures 16.66:1 against the page and glares at night |
| 10 | **Light-theme primary button** | **Lime fill with a #0C5A27 edge** | **Ink pill with a lime label**. This depends on item 1, because Zest can't be a fill on white without an edge |

## How round 3 works

1. **A goes first.** For each of the 10 items A writes a **proposed resolution**, which may be a compromise, with one or two lines of reasoning.
2. **B replies** to each item with **ACCEPT** or **COUNTER**, plus a counter-proposal and a reason.
3. **A replies** to each COUNTER with **ACCEPT** or **FINAL HOLD**.
4. Any item still split after step 3 goes to the **architect's ruling**, which is final and gets recorded with its reasoning.

Everything happens in `05-resolution.md`, and each analyst edits only their own column or section.
