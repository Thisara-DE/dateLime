# Critique by Analyst B ("Couch-Proof") of Analyst A ("Limelight")

*Round 2. The contrast ratios come from `contrast.py`, and A's key pairs reproduce
exactly. Byte sizes come from `02a-moderator-facts.md`.*

## 1. Adopt

A's proposal is the stronger brand, and several of its choices beat mine even by my
own criteria.

- **Zest and velvet, with "Lit = inverse + lime" in both themes.** See Q1 and Q2.
- **The poster grid plus a movie sheet** (an `<h3><button>` with a stretched `::after`).
  A's filters already guarantee the rating cap, the runtime and "on your services", so
  the TMDB details call waits until a sheet opens. Mine fired once per visible card.
  Fewer requests was my principle, and A does it better.
- **Honest badges.** "On your services" appears only when the query guarantees it.
- **The run of show on the ticket**, labeled "your estimate". It replaces my Night Plan.
- **A keywords tier** (free in the same call) and **curated drinks per rule**.
- **House Rules as set-once preferences.** This is better information architecture than
  repeating filters at every step.
- **Small wins:**
  - no API call above the fold
  - "Show popular picks" when nothing is selected
  - Undo instead of confirm dialogs
  - hold toggles in Spin the Lime
- **Diary export/import.** It fixes the Safari 7-day storage eviction I flagged.
- **The three-act step names.** A screen reader still hears them plainly: "Act 2 of 3,
  the menu".

## 2. Contest

### The eight collisions

| # | Question | Position | Evidence |
|---|---|---|---|
| 1 | Lime `#23D160` vs `#9FE143` | **Zest `#9FE143`.** I concede, pending the owner's sign-off. `#23D160` stays as the measured fallback (9.31 on velvet). | `#23D160` is exactly Bulma 0.7's default `$green`, hsl(141 71% 48%), which the old `hero is-success` rendered. It's a framework default in the generic "success" hue, not a brand choice, while Zest is lime's yellow-green. **Primary label:** velvet on Zest measures **11.97**, against 8.25 for my ink on `#23D160`. **Light theme:** both fail as text on white (1.58 / 2.03), so the strategy doesn't change. |
| 2 | Velvet `#140F1A` vs green-black `#0F1411` | **Velvet.** I concede. | Plum (267°) is near-complementary to Zest (85°), so the lime reads as light. A green-tinted page is analogous and flattens it. Warm darks also flatter food, whereas green casts don't. **Accessibility is a wash:** Zest measures 11.97 vs 11.81, and body text 16.92 vs 16.40. |
| 3 | Type stack | **SVG wordmark + RC 700 static (21.1 KB) + Fraunces, wght axis only, upright (36.6 KB) + Atkinson Next 400/600 static (24.8 KB) = 82.5 KB**, vs A's ~220 KB. | **Budget:** A's stack breaks A's own 150 KB cap. **Wordmark:** outlining it as SVG drops the RC variable font (51.4 → 21.1 KB) and removes the font swap on a 144 px hero. **Fraunces italic** costs 45.7–81.5 KB for about three accent words, so tint those Zest instead. **Loading:** Fraunces uses `font-display: optional` with a metric-matched Georgia fallback, so the largest element on screen (the H1) never swaps. **Body:** Atkinson costs 4.6 KB more than Figtree and buys unambiguous Il1/0O in free-text measures ("1 l", "1/2 tsp"). Preload only Atkinson 400 (12.1 KB). |
| 4 | Match Night vs Shortlist + You pick | **Match Night, merged with You pick. SHOULD.** | **Fairness:** both people vote, which beats my one-sided shortlist. **Access:** buttons and ←/→ come first, with swipe on top (2.5.1, 2.5.7). There's no timer (2.2.1), and "Movie 3 of 10" is announced (4.1.3). **No-match is common:** P(no overlap) = (1−p²)¹⁰, which is **39 % at p = 0.3 and 17 % at 0.4**. So "Deal 10 more / Spin" is core, and "You pick" breaks ties when there are two or more matches. **Not MUST**, because it depends on the core loop and has the largest accessibility test surface. |
| 5 | Mood Dial vs genre chips | **Moods, modified.** | **Markup:** one native radio group whose labels name the genres ("Swoony, Romance"). **"One each":** two radio groups ("Your mood", "Their mood, optional") instead of a checkbox group capped at two, which would need disabled states. **Fallback:** exact genres live in a `<details>`. **Name:** "Mood", not "Dial", because a real dial needs the slider pattern and a non-drag alternative. |
| 6 | Canvas image vs link + text | **Link + complete text is the MUST contract.** The image is a COULD: typographic only, and a separate action. | **CORS:** both image hosts are unverified, and a PNG with no photos avoids the problem. **Dropped links:** some share targets discard `text`/`url` when `files` are attached, which we can't test here. Bundling risks losing the link, and the link is the invite. **Alt text:** a chat image has none, so the text must carry the movie, dish, time and link anyway. |
| 7 | Circle vs square food | **Circles.** I concede, for thumbnails up to 160 px. The recipe sheet shows the full square. | **Shape as a cue:** "plate vs screen" separates the two categories without relying on color (the spirit of 1.4.1). **Crop cost:** a circle loses 1 − π/4 ≈ 21.5 % of the image, all from the corners around a centered dish. **Alt text:** use `alt=""` next to the title, because "{meal}, plated" repeats it. |
| 8 | Dark-first vs follow-OS | **Dark-first. I hold it**, with conditions. | **Harm asymmetry:** a phone still on its factory light setting gets comfort at night, while a user who needs light pays one tap, once. **Conditions:** the Lights up/down toggle sits **in the mobile header** (not in A's ≡ popover), applies before first paint, and sits alongside a "Match system" option. `forced-colors` and `prefers-contrast` are respected. |

### Other contests

- **Paper ticket in Late Show.** The paper edge measures **16.66:1** against velvet, so
  at night it's a white screen: the very glare A's case for a dark default rejects.
  Instead, use raised velvet (text 15.62) with a Zest stub (ink 11.97). Keep paper for
  Matinee, print and the share image.
- **"No pork/beef" by subtracting categories isn't exact.** Each meal has exactly one
  `strCategory`, so a Pasta dish with bacon passes. Scan ingredients on lookup and label
  it "best effort". The Vegetarian/Vegan intersections are fine as they are.
- **Ingredient counts need lookups.** "9 ingredients" and "≤8 ingr" need a `lookup.php`
  call for every card, because `filter.php` returns only name, thumbnail and id. That
  contradicts "lookups only for opened cards". Fix it with lazy lookups for visible cards
  (up to 12, 4 in parallel, cached), or drop the counts.
- **Motion cost.** 650 ms scene transitions slow repeat navigation. Cap them at 300 ms,
  and keep 650 ms only for the one-time ticket print. A `blur(40px)` backdrop is heavy on
  mid-range GPUs, but upscaling the `w92` image blurs it for free.
- **Size and focus.**
  - Micro text at 0.75rem is too small at arm's length; set the floor at 0.875rem.
  - Make the focus ring 3 px. It measures 1.28 against Zest, so the offset gap is
    mandatory.
- **URL format.** Use the architect's readable `#/date?m=&r=&d=&at=&note=`, not an opaque
  base64 `#t=`. The note is plain text, at most 80 characters, rendered with
  `textContent`.

## 3. Verdicts on A's features

| A's feature | Verdict | Reason |
|---|---|---|
| Vibe Pairing | **Keep** (merge my F4) | A's three tiers, plus my `idMeal` intersection, an announced staged fallback and a "Match the movie" off switch |
| Admit Two | **Merge** with my Date Ticket and Night Plan | A's ticket and run of show, plus my readable URL, the full share text and `storage.persist()`. Export/import moves here |
| Match Night | **Modify** | Buttons first and pass-the-phone first, with "You pick" breaking ties. The two-phone relay waits |
| House Rules | **Keep** (absorbs my services filter, diet chips and avoid list) | Fix meat exclusion with an ingredient scan; keep the `without_genres` vetoes |
| Mood Dial | **Modify** | Radio groups with genre labels, the blend as two groups, and exact genres behind a disclosure |
| Showtime Mode | **Merge** with Cook Mode as "Cook-along" | My step splitter, checklist and 64 px controls, plus A's "Lights down" countdown and offline cache |
| Spin the Lime | **Keep** (merge "Surprise us") | Holds use `aria-pressed`, with one summary announcement instead of three live `<output>`s |
| Afterglow | **Modify → COULD** | Export/import ships inside Admit Two. Ratings (a native 1–5 radio group), notes and "one year ago" come later |

## 4. Concessions

1. **Brand lime:** Zest replaces `#23D160`. The old green is kept only as the fallback
   if the owner vetoes.
2. **Page:** velvet replaces green-black.
3. **Food images:** circle thumbnails.
4. **Movie browsing:** A's poster grid and sheet, with details loaded on open. I withdraw
   my per-card details calls and the "Pick" button inside the card.
5. **Swipe:** I withdraw my "no swipe" veto for Match Night. It now has button and key
   parity and is optional.
6. **Genres:** moods replace bare genre chips as the default.
7. **Display serif:** I accept Fraunces (upright only), within budget.
8. **Night Plan:** it becomes the ticket's run of show.

## 5. Merged proposal

**Brand**
- **Dark:** Zest `#9FE143` fill with a velvet label (11.97).
- **Light:** an ink `#1A1420` pill with a `#BDEB74` label (13.13).
- **Brand text on paper:** `#446F12` (5.58).
- **Focus:** `#D6F2A3` (15.35 on the page, 12.53 on overlays), with a 2 px offset.

**Surfaces**
- **Late Show (default):** `#140F1A` page, `#1E1726` raised, `#2A2133` overlay.
  - Primary text `#F6F2EC`: 16.92 / 15.62 / 13.81 on those three.
  - Secondary text `#D2C8DC`.
  - Muted text `#A89CB6`: at least 5.94 on every surface.
  - Borders `#7A6E88`: at least 3.24.
- **Matinee:** paper `#FBF7F1` and white, with `#8A7F94` borders (3.55).
- **The ticket follows the theme.**

**Type (82.5 KB)**

| Role | Face | Size |
|---|---|---|
| Wordmark | RC 800, outlined to SVG | 0 KB |
| Labels and ticket fields | RC 700 | 21.1 KB |
| H1 and H2 | Fraunces, wght axis, upright, `font-display: optional` | 36.6 KB |
| Body and UI | Atkinson Next 400/600 | 24.8 KB |

If we're over budget, Fraunces is cut first.

**Shape**
- **Rectangles are screens:** 2:3 posters with a 12 px radius.
- **Circles are plates.**
- **Pills are actions:** 48 or 56 px tall.
- **The ticket is the only notched object:** 28 px radius.
- Radii follow 4, 8, 12, 20, 28 and pill, on a 4-point spacing grid.

| Rank | Feature | Tag | Contents |
|---|---|---|---|
| 1 | **Admit Two** | **MUST** | Ticket; save and share (link + text); `.ics`; run of show; diary export/import |
| 2 | **Vibe Pairing** | **MUST** | Three tiers, a "why" line, a drink |
| 3 | **House Rules** | **MUST** | Services, rating cap, vetoes, Vegetarian/Vegan, zero-proof, best-effort avoid list |
| 4 | **Cook-along** | **MUST** | Wake Lock, step cards, detected timers, checklist, Lights down |
| 5 | **Spin the Lime** | **MUST** | The "Surprise us" path with holds (small effort) |
| 6 | Mood picker | SHOULD | Radio groups, the blend, exact-genre fallback |
| 7 | Match Night (pass the phone) | SHOULD | Buttons first; "You pick" breaks ties |
| 8 | Typographic share image | COULD | A separate action, with no photos |
| 9 | Afterglow | COULD | Ratings, notes, anniversaries, hiding watched movies |
| 10 | Two-phone Match relay | WON'T (v1) | Votes can be peeked, two round trips, needs an explainer |
