# Analyst B proposal: "Couch-Proof"

> Analyst B covers product strategy, accessibility and feasibility. Every contrast
> ratio below was measured with the brief's `contrast.py`, not estimated. Tags F1–F8
> refer to §8.

## 1. Direction: Couch-Proof ("lights down, lime up")

dateLime gets used in the evening, on a sofa, on a mid-range phone. Usually two people
share one screen, and by the cooking step someone has sticky fingers. **Couch-Proof**
is designed for that moment.

- **Canvas.** A calm, green-tinted near-black, like a room with the lights down.
- **Lime.** The brand lime is the only light source. It's the one vivid thing on
  screen, and it always means "this is the choice" or "tap here".
- **Flow.** Each screen asks for one decision, and you can submit any screen without
  choosing anything. Every failure offers a way forward.
- **Data.** Nothing on screen claims more than TMDB, TheMealDB and TheCocktailDB
  actually return.
- **Personality.** It comes from the wordmark, the copy, and the film and food
  imagery, not from decoration. That keeps it fast on a four-year-old Android and easy
  to use with a screen reader.

## 2. Principles, voice and tone

1. **Defaults, not dead ends.** Every form can be submitted as it is, because "Any" is
   pre-selected. Empty results offer one-tap relaxations, and every error has a retry.
   This fixes the old TypeError and blank-page failures by design.
2. **Couch ergonomics.** The primary action sits in a sticky bottom bar within thumb
   reach. Targets are at least 48×48 px, twice WCAG 2.2's 24 px. Text is readable at
   arm's length, the theme is dark by default, and the screen stays awake while you
   cook.
3. **Honest data.** Show only what the APIs return and label heuristics as heuristics.
   Never invent cook times, difficulty or "allergy-safe" claims. Missing data degrades
   visibly.
4. **Accessible by construction.** Native elements come first (`button`, `fieldset`
   with radios, `dialog`, `details`). Focus is always visible, and color is never the
   only signal. Layouts reflow at 320 px and 200 % zoom, and nothing has a fixed
   height.
5. **Light on the phone.** No framework, two font files, one API call before the
   first results, lazy images, and every response cached.

**Voice.** A friend who's good at planning: warm, brief and lightly playful, never
smug.

- Use plain words, put verbs on buttons, and use at most one "!" per screen.
- Always say "your date". No gendered roles, and no assumptions about drinking, diet
  or who is dating whom.
- When we don't know something, say so.

| Moment | Microcopy |
|---|---|
| Landing hero | H1 = wordmark, then "Pick a movie. We'll find the dinner to match." Buttons: **Plan a date night** · **Surprise us** (F7) |
| Loading | "Finding movies that fit…" / "Raiding the recipe box…" (the status region says "Loading movies") |
| Empty state | "No Horror rated G. Those two rarely meet." **Allow PG-13** · **Any genre** |
| API error | "TMDB isn't answering right now. Your choices are safe, so try again in a moment." **Try again** |
| Offline | "You're offline. Saved dates and Cook Mode still work." |
| Date saved | Toast: "Saved to Your dates." **Undo** |
| Date shared | After Web Share: "Date sent. See you on the couch." Clipboard fallback: "Link copied. Paste it to your date." |

## 3. Color theme

**Default: dark**, for four reasons.

1. **Context.** People use it at night next to a TV, where a white screen glares.
2. **Brand physics.** `#23D160` measures 2.03:1 on white and 9.18:1 on our page, so
   only on dark can lime be text, icon, indicator *and* fill. On light it needs a dark
   edge, and lime text has to darken to forest green.
3. **Battery.** Cook Mode holds a Wake Lock for 30–90 minutes, and dark pixels use less
   power on OLED.
4. **Imagery.** Posters and food photos read better on dark.

*Trade-off:* a first visit ignores an OS set to light. We soften that in four ways:

- A theme button in the header, with the choice persisted.
- Dark / Light / Match system options in the footer.
- A light theme that's fully verified to AA.
- No pure black or pure white, which reduces halation for readers with astigmatism.

Two user preferences are honored as well. `prefers-contrast: more` promotes secondary
and muted text to primary. `forced-colors: active` maps everything to system colors,
so focus uses a real `outline` and the wordmark uses `currentColor`.

**Lime scale** (hue 141°, with the original color as lime-500):
`50 #EEFCF3 · 100 #D8F9E3 · 200 #A6F2C1 · 300 #6AE796 · 400 #40DD77 · 500 #23D160 · 600 #1AA84C · 700 #117835 · 800 #0C5A27 · 900 #093F1C · 950 #062310`

| Token | Dark (default) | Light | Notes |
|---|---|---|---|
| `--bg-page` | `#0F1411` | `#F4F7F5` | |
| `--bg-raised` | `#18201B` | `#FFFFFF` | cards, chips |
| `--bg-overlay` | `#1F2922` | `#FFFFFF` + shadow | dialogs, sheets, toasts, sticky bar |
| `--text-primary` | `#ECF2EE` | `#121A15` | |
| `--text-secondary` | `#B3C0B7` | `#3D4A42` | metadata |
| `--text-muted` | `#8D9B92` | `#56645B` | hints; still AA |
| `--text-on-brand` | `#062310` (lime-950) | `#062310` | on any lime fill |
| `--text-link` | `#40DD77` (400) | `#117835` (700) | underlined in running text |
| `--brand-fill` / hover / pressed | `#23D160` / `#40DD77` / `#1AA84C` | same | buttons, selected chips |
| `--brand-edge` | none | `#0C5A27` (800) | 1 px edge on every lime fill in light |
| `--indicator` | `#23D160` | `#0C5A27` | current step, current nav item |
| `--border-subtle` | `#2A352E` | `#DCE3DE` | decorative dividers and skeletons only |
| `--border-strong` | `#738379` | `#75837A` | control outlines |
| `--focus` | `#A6F2C1` (200) | `#0C5A27` (800) | 3 px outline, 2 px offset |
| success / bg | `#6AE796` / `#102A19` | `#117835` / `#E7F7EC` | |
| warning / bg | `#F2B84B` / `#2E2410` | `#8A5300` / `#FDF1D8` | |
| danger / bg | `#FF8A80` / `#3A1614` | `#B42318` / `#FDECEA` | |
| info / bg | `#7AB8FF` / `#0F2238` | `#175CD3` / `#E9F1FD` | |

**Rules:**

- No light text on lime: `#ECF2EE` on `#23D160` is 1.79:1.
- In light mode, lime is never text, and every lime fill gets `--brand-edge`.
- Tinted banners carry only `--text-primary` plus their status color.
- Status is always shown as an icon plus words.

**Measured contrast, dark theme** (page `#0F1411` / raised `#18201B` / overlay
`#1F2922`)

| Pairing | Ratio | Needs |
|---|---|---|
| text-primary `#ECF2EE` on page / raised / overlay | 16.40 / 14.67 / 13.23 | 4.5 |
| text-secondary `#B3C0B7` on page / raised / overlay | 9.87 / 8.83 / 7.97 | 4.5 |
| text-muted `#8D9B92` on page / raised / overlay | 6.41 / 5.74 / 5.17 | 4.5 |
| link `#40DD77` on page / raised / overlay | 10.48 / 9.38 / 8.46 | 4.5 |
| wordmark "Lime" `#23D160` on page | 9.18 | logo (exempt, but passes) |
| on-brand `#062310` on lime-500 / hover 400 / pressed 600 | 8.25 / 9.42 / 5.38 | 4.5 |
| lime-500 fill and indicator vs page / raised / overlay | 9.18 / 8.21 / 7.41 | 3 (UI) |
| border-strong `#738379` vs page / raised / overlay | 4.65 / 4.16 / 3.76 | 3 (UI) |
| focus `#A6F2C1` vs page / raised / overlay | 14.26 / 12.76 / 11.51 | 3 (UI) |
| focus `#A6F2C1` vs lime-500 | **1.55 ✗** | so the 2 px offset gap is mandatory in dark |
| success `#6AE796` on page / overlay / own bg | 11.95 / 9.64 / 9.86 | 4.5 |
| warning `#F2B84B` on page / overlay / own bg | 10.40 / 8.39 / 8.53 | 4.5 |
| danger `#FF8A80` on page / overlay / own bg | 8.15 / 6.58 / 7.05 | 4.5 |
| info `#7AB8FF` on page / overlay / own bg | 8.97 / 7.24 / 7.75 | 4.5 |
| text-primary on success / warning / danger / info bg | 13.53 / 13.45 / 14.18 / 14.16 | 4.5 |
| border-subtle `#2A352E` vs page / raised | 1.46 / 1.31 | decorative only |

**Measured contrast, light theme** (page `#F4F7F5` / raised and overlay `#FFFFFF`)

| Pairing | Ratio | Needs |
|---|---|---|
| text-primary `#121A15` on page / raised | 16.44 / 17.73 | 4.5 |
| text-secondary `#3D4A42` on page / raised | 8.63 / 9.31 | 4.5 |
| text-muted `#56645B` on page / raised | 5.78 / 6.23 | 4.5 |
| link / success / header "Lime" `#117835` on page / raised / success bg | 5.18 / 5.58 / 5.03 | 4.5 |
| on-brand `#062310` on lime-500 / 400 / 600 | 8.25 / 9.42 / 5.38 | 4.5 |
| lime-500 vs page / raised; lime-400 vs page | **1.88 / 2.03 / 1.65 ✗** | hence the edge |
| edge / focus / indicator `#0C5A27` vs page / raised / lime-500 / lime-400 | 7.76 / 8.38 / 4.13 / 4.72 | 3 (UI) |
| border-strong `#75837A` vs page / raised | 3.68 / 3.97 | 3 (UI) |
| hero panel: `#062310` on `#23D160` | 8.25 | wordmark, tagline |
| inverse button `#EEFCF3` on `#062310` / hover `#093F1C` | 15.81 / 11.41 | 4.5 |
| inverse fill `#062310` / `#093F1C` vs panel `#23D160` | 8.25 / 5.96 | 3 (UI) |
| warning `#8A5300` on page / raised / own bg | 5.87 / 6.33 / 5.65 | 4.5 |
| danger `#B42318` on page / raised / own bg | 6.10 / 6.57 / 5.75 | 4.5 |
| info `#175CD3` on page / raised / own bg | 5.55 / 5.99 / 5.26 | 4.5 |
| text-primary on success / warning / danger / info bg | 15.97 / 15.83 / 15.51 / 15.59 | 4.5 |
| border-subtle `#DCE3DE` vs page / raised | 1.21 / 1.31 | decorative only |

For comparison, the legacy white on `#23D160` measures 2.03 and fails. Its
replacement, `#062310` on `#23D160`, measures 8.25.

## 4. Typography

| Role | Family | Weights | Delivery |
|---|---|---|---|
| Wordmark | Roboto Condensed ExtraBold | 800 | Outlined inline SVG, so zero font bytes and no FOUT or layout shift at 160 px |
| Headings (h1–h3, card titles) | Roboto Condensed | 700 | Self-hosted WOFF2 (Latin, with Latin-Ext via `unicode-range`), `font-display: swap` |
| Body and UI | Atkinson Hyperlegible Next | Variable 400–700 (uses 400/600/700) | Self-hosted WOFF2, preloaded |

**Why these faces.** Atkinson was designed by the Braille Institute for low-vision
readers, and its 1/l/I and 0/O are unambiguous. That matters because TheMealDB
measures are free text ("1 l", "1/2 tsp", "10 g") read from arm's length. Roboto
Condensed continues the logo and keeps long titles to two lines at 390 px.

**Budget.** At most 80 KB of WOFF2 in total. My estimate is about 20 KB for Roboto
Condensed and 35–45 KB for Atkinson; confirm both when downloading.

- **Fallbacks:** `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` for text,
  and `"Arial Narrow", sans-serif-condensed, system-ui` for headings.
- **Layout shift:** a local fallback with `size-adjust` keeps CLS under 0.1.
- **Plan B:** the original Atkinson Hyperlegible (400/700).

**Scale.** All sizes are in rem, and the root size stays at the browser default.

| Token | Size | LH | Face | Use |
|---|---|---|---|---|
| display | `clamp(4rem, 1.5rem + 11vw, 10rem)` | 0.9 | wordmark SVG | landing only |
| h1 | `clamp(2rem, 1.6rem + 1.8vw, 3rem)` | 1.1 | RC 700 | screen titles |
| h2 | `clamp(1.5rem, 1.35rem + 0.6vw, 1.875rem)` | 1.2 | RC 700 | sections, ticket rows |
| h3 | 1.25rem | 1.25 | RC 700 | card titles |
| lead | 1.125rem | 1.55 | AHN 400 | intros, plot on the ticket |
| body | 1rem | 1.5 | AHN 400 | default |
| label | 1rem | 1.25 | AHN 600 | buttons, chips, legends |
| small | 0.875rem | 1.45 | AHN 400/600 | metadata, attributions (the floor) |
| cook | `clamp(1.375rem, 1.1rem + 1.2vw, 1.75rem)` | 1.5 | AHN 400 | Cook Mode steps |
| timer | 3rem | 1 | AHN 700, `tabular-nums` | Cook Mode timers |

**Rules:**

- Paragraphs are at most 65ch wide.
- No all-caps text, except certification badges.
- Roboto Condensed only at 1.25rem or larger.
- Every clamped block has an expand control.
- Text-spacing overrides (WCAG 1.4.12) never clip.

**Wordmark.** "dateLime" (lowercase d, capital L) is set in Roboto Condensed 800 with
−1 % tracking. It's outlined to SVG as two path groups so each half can take its own
color.

| Context | "date" | "Lime" | Contrast |
|---|---|---|---|
| Dark | `#ECF2EE` | `#23D160` | 9.18:1 |
| Light header | `#121A15` | `#117835` | 5.18:1 |
| Light landing hero | `#062310` | `#062310` | 8.25:1 on a full-bleed `#23D160` panel, the original lime field now passing |

- **Size.** The header mark is 1.75rem tall (2rem on desktop). It's sized in `em` so it
  follows text zoom. Minimum height is 20 px, and clear space equals the bowl of the
  "a".
- **Markup.** On the landing page:
  `<h1><span class="visually-hidden">dateLime</span><svg aria-hidden="true">`. In the
  header, a home link named "dateLime, home".
- **Lime-slice glyph.** A lime-500 disc with a lime-200 pith and seven segments. It's
  used for the favicon, the maskable PWA icon and a landing accent. It never replaces
  the wordmark and never spins.
- **Never:** white on lime, outlines, gradients, shadows or stretching.

## 5. Shape, spacing, elevation, motion, icons, imagery

- **Spacing.** A 4 px base: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64` (`--space-1…8`).
  - Side gutters: 16 px below 600 px, 24 px from 600 px, 32 px from 1024 px.
  - Content is at most 72rem wide, and the reading column is 40rem.
  - Targets are at least 48×48 px, with at least 8 px between them.
- **Radius.**
  - 6 px for badges and inputs.
  - 12 px for cards, and 8 px for images inside them.
  - 20 px for sheets, dialogs and the ticket.
  - 999 px for buttons and chips, keeping the original's pill shapes.
- **Elevation.**
  - Level 0 is the page.
  - Level 1 (cards) is the raised surface plus a 1 px `--border-subtle`. Light adds
    `0 1px 2px rgb(18 26 21/.06), 0 2px 8px rgb(18 26 21/.06)`. Dark has no shadow.
  - Level 2 (overlays) adds `0 12px 32px` at `rgb(0 0 0/.5)` in dark or
    `rgb(18 26 21/.16)` in light.
  - `::backdrop` is `rgb(0 0 0/.6)` in dark and `rgb(18 26 21/.4)` in light.
  - No `backdrop-filter` blur anywhere, because it taxes mid-range GPUs.
- **Motion.**
  - Durations are 120 ms for presses and chips, 200 ms for toasts and disclosures, and
    320 ms for sheets and page changes.
  - Elements enter with `cubic-bezier(.2,0,0,1)` and exit with
    `cubic-bezier(.4,0,1,1)`.
  - Cross-document View Transitions (`@view-transition {navigation: auto}`) give a
    200 ms crossfade, and the poster morphs into the ticket via
    `view-transition-name`.
  - Under `prefers-reduced-motion: reduce`: no transitions, slides or scaling; static
    skeletons; text instead of spinners. Only opacity fades of 120 ms or less remain.
  - Nothing autoplays.
- **Icons.** About 22 Lucide icons (ISC licence) in one inline SVG sprite of about
  6 KB, on a 24 px grid with 2 px strokes and `currentColor`.
  - Every icon is labelled, except Close and the theme toggle, which use `aria-label`.
  - Decorative icons are `aria-hidden`.
  - No emoji are used as icons.
- **Imagery.** The content is the imagery. There are no stock "couple" photos, which
  would define who counts as a couple.
  - **Posters:** `aspect-ratio: 2/3`, an explicit size and a w185/w342/w500 `srcset`.
    They're lazy-loaded except the first two, and the first gets
    `fetchpriority="high"`. They use `alt=""` because the title is the adjacent
    heading.
  - **Missing posters:** a null `poster_path` becomes a CSS typographic poster with the
    title in RC 700, the year and a film icon, and it costs zero requests. Discover's
    `vote_count.gte=150` makes this rare.
  - **Dishes and drinks:** 1:1, using the hosts' smaller size suffix (`/small` or
    `/medium`; older docs say `/preview`, so verify), lazy-loaded.
  - **Backdrops:** only on the desktop ticket, under a solid scrim, and never behind
    text.
  - **Data saver:** when `saveData` is on, use w185 only.
  - **Offscreen cards:** `content-visibility: auto`.

## 6. Core components

**Buttons.** Use `<button>` for actions and `<a>` for navigation, never a `<div>`.

- **Height:** 48 px. The sticky-bar CTA is 56 px and full width on mobile.
- **Focus (every variant):** `outline: 3px solid var(--focus); outline-offset: 2px`,
  plus a 2 px page-colored halo when the button sits over imagery.

| Variant | Rest | Hover | Pressed | Use |
|---|---|---|---|---|
| Primary | lime-500 fill, `#062310` label, `--brand-edge` in light | lime-400 | lime-600, 1 px press (none under reduced motion) | one per screen |
| Secondary | transparent, 1 px border-strong, text-primary | raised/overlay fill | overlay | alternatives |
| Tertiary | link color, underlined | thicker underline | – | inline actions |
| Inverse | `#062310` fill, `#EEFCF3` label | `#093F1C` | – | light-theme hero panel only |
| Danger | danger text + 1 px border | danger-bg | – | "Delete date" (Undo toast, no confirm dialog) |

- **Loading:** the label changes ("Finding movies…") and a 16 px spinner appears, or
  text only under reduced motion. The width stays locked. `aria-disabled="true"`
  blocks double submits, and the region being loaded is `aria-busy`.
- **Disabled:** avoided by always having defaults. Where it's unavoidable, use
  `aria-disabled` plus an `aria-describedby` that gives the reason.
- **Toggles:** Save and Shortlist use `aria-pressed`.
- **Repeated buttons** include their item's name:
  `Pick<span class="vh"> Paddington 2</span>`.

**Choice chips**

- **Markup:** a `<fieldset><legend>` wraps native radios or checkboxes. Each input is
  visually hidden inside a `<label>` pill, and focus shows on the pill via
  `:has(:focus-visible)`.
- **Layout:** chips are 48 px tall with 8 px gaps, and they wrap instead of scrolling
  sideways. Groups with more than 8 options put the rest behind a "More…" `<details>`.
- **State glyph:** a fixed 20 px slot keeps widths stable and encodes the input type:
  ○/● for radios, ☐/☑ for checkboxes.
- **Selected:** lime fill, ink label, filled glyph, plus the edge in light mode, so
  selection never depends on color alone.
- **Forms:** `method="get"`, so the URL *is* the state. Back, reload and share all work
  without JS. Results update only on submit (WCAG 3.2.2).

**Movie card**
```
┌─────────────────────────────────────┐
│ ┌───────┐ Paddington 2          (h3)│
│ │poster │ 2017 · PG · 1h 44m        │
│ │ 2:3   │ ★ 7.6 · On Netflix        │
│ │ 104px │ Comedy · Family           │
│ └───────┘                           │
│ A young bear's quest for the perfect│
│ birthday gift…   (3 lines) [More ▾] │
│ [ Pick ]  [▶ Trailer]  [♡ Shortlist]│
└─────────────────────────────────────┘
```

- **Markup:** an `<article aria-labelledby>` inside `<ul aria-label="Movies">`, using
  TMDB's `title` (not `original_title`).
- **Instant data:** Discover gives year, genres and score.
- **Lazy details:** US certification, runtime, providers and trailer come from one
  details call (`append_to_response=release_dates,watch/providers,videos`). It runs as
  the card nears the viewport, at most 4 at a time, and is cached. Two metadata lines
  are reserved so nothing shifts.
- **Missing data:** "Not rated" and "No summary on TMDB yet."
- **Screen reader:** the score reads as "TMDB score 7.6 out of 10".
- **More:** uses `aria-expanded` and shows the full plot.
- **Selecting:** only **Pick** selects. The card itself isn't clickable, which fixes
  the old document-wide click bug.
- **Trailer:** a facade. It loads a `youtube-nocookie.com` iframe into a `<dialog>` only
  on tap.

**Recipe card**
```
┌─────────────────────────────────────┐
│ ┌──────┐ Shepherd's Pie        (h3) │
│ │thumb │ British · Beef             │
│ │ 1:1  │ 11 ingredients · 7 steps   │
│ └──────┘ Pairs with: British film   │
│ [ Pick ]        [ Preview recipe ]  │
└─────────────────────────────────────┘
```

- **Instant data:** `filter.php` gives only the name, thumbnail and id, so the card
  renders from those.
- **Lazy details:** area, category, ingredient count (non-empty `strIngredientN`) and
  step count arrive from a lazy `lookup.php?i=`.
- **Not shown:** time, difficulty and servings, because those fields don't exist.
- **Preview recipe:** opens a `<dialog>` (a bottom sheet under 600 px) with the full
  ingredients and instructions, plus YouTube and source links. Esc closes it, and
  focus returns to the trigger.

**Step progress**

- **Markup:** `<nav aria-label="Planning steps"><ol>` with Movie, Meal and Date.
- **Done steps:** links with visually hidden "(done)" text, shown as a lime disc with
  an ink check.
- **Current step:** `aria-current="step"` with an `--indicator` ring.
- **Upcoming steps:** plain text with a border-strong ring.
- **Mobile:** "Step 2 of 3 · Meal" with a 3-segment bar.

**Date Ticket**

- **Shape:** an `<article>` styled as a cinema ticket, with a 20 px radius and dashed
  perforations notched by a CSS mask.
- **Rows:** Movie, Meal and Drink, each with an image, an h2, key facts and a
  **Change** link.
- **Plan:** "Tonight's plan" (F5) is an `<ol>` of `<time>` elements.
- **Actions:** Share (primary), Save (`aria-pressed`), Add to calendar, Cook Mode.
- **Shared links:** opening one shows an info banner ("You've been sent a date plan")
  with **Save to my dates**.

**Toasts and live regions**

- **Regions:** `role="status"` (polite) and `role="alert"` (blocking errors only)
  exist from first paint.
- **Toasts:** overlay cards, bottom-center above the sticky bar, one at a time. They
  never take focus.
- **Timing:** info toasts hide after 6 s and pause on hover or focus. Toasts with an
  action (Undo) stay until dismissed, and every toast action is also available
  elsewhere.
- **Focus:** `scroll-padding-bottom` matches the bar height, so the focused element is
  never hidden (SC 2.4.11).

**Skeletons**

- **Shape:** the exact card geometry (a 2:3 box and bars at 70/45/85 %) in
  `--border-subtle`. This is decorative, at 1.31:1.
- **Semantics:** skeletons are `aria-hidden`, and the list is `aria-busy`. One
  announcement goes out at the start ("Loading movies") and one at the end ("12
  movies found").
- **Timing:** they appear after 300 ms, and shimmer only if motion is allowed.

**Empty and error states.** These replace the results: a 48 px icon, an h2, one
sentence on the cause, and one or two recovery buttons.

- **Empty:** the suggestions come from the active filters, such as the next rating up,
  no services filter, or any genre.
- **Offline:** retries automatically on the `online` event.
- **429:** backs off, showing "Busy, retrying in 5 s".
- **5xx:** shows **Try again**.
- **Bad shared ID:** "That recipe left TheMealDB. Pick another; we kept the rest of
  your date."
- **Never** use `alert()`.

## 7. Screen concepts

**Shell (every screen)**

- **Header (56 px):** the wordmark (home link), "Your dates (2)", and the theme button.
  Desktop adds "Team". There's no hamburger, because there are only three
  destinations.
- **Footer:**
  - Team.
  - Dark / Light / Match system.
  - The TMDB logo with "This product uses the TMDB API but is not endorsed or certified
    by TMDB".
  - "Streaming data by JustWatch".
  - TheMealDB and TheCocktailDB credits.
- **Navigation:** a skip link comes first, and every page has a unique `<title>`.
- **Structure:** one HTML file per screen, with state in the URL.

**Landing**
```
390px                                  1280px: centered column, wordmark at 10rem,
┌───────────────────────────────┐      CTAs side by side, the three steps as three
│ dateLime       Your dates   ☾ │      columns, and a "Continue" card beside the
│         (lime slice)          │      CTAs when a date exists. Light theme: the hero
│   dateLime    ← 4rem wordmark │      is a full-bleed lime panel with an ink
│ Pick a movie. We'll find the  │      wordmark and an Inverse CTA.
│ dinner to match.              │
│ [     Plan a date night     ] │ 56px primary
│ [        Surprise us        ] │ secondary (F7)
│ 1 Movie · 2 Meal · 3 Date     │ how it works: icon + label list
│ [Continue: Fri · Paddington 2 →] only if a saved or upcoming date exists
│ Team · Theme · TMDB/JustWatch │
└───────────────────────────────┘
```

**Choose your movie**
```
┌───────────────────────────────┐   1280px: same form in one 40rem centered
│ Step 1 of 3 · Movie  ■■□□□□   │   column (linear reading order), with
│ What are we watching?    (h1) │   Show movies inline at the end.
│ Genre                         │
│ (●Any)(○Rom-com)(○Comedy)     │   Rom-com = with_genres=35,10749 (comma = AND)
│ (○Romance)(○Action)(○Horror)  │
│ (○Drama)(○Animation) More ▾   │
│ Rated up to (US)              │   certification_country=US & certification.lte
│ (●Any)(○G)(○PG)(○PG-13)(○R)   │
│ Length                        │   with_runtime.lte=105 / 135
│ (●Any)(○Under 1h45)(○Under 2h15)│
│ Streaming in US · Change      │   F3; remembered on this device
│ [☐Netflix][☐Prime Video]      │
│ [☐Disney+][☐Max] More ▾       │
│ Streaming data by JustWatch   │
│▓[        Show movies        ]▓│   sticky bar, always enabled
└───────────────────────────────┘
```
*Keyboard:* each radio group is one Tab stop, and the arrow keys move within it.
Enter submits from anywhere, because it's a native form.

**Movie results**
```
┌───────────────────────────────┐  1280px:
│ Comedy · ≤PG-13 · Netflix Edit│  ┌ filters 280px ┬ Pick a movie · 12 of 214 · Sort ▾ ┐
│ Pick a movie (h1)   12 of 214 │  │ same fieldsets│ ┌card─────────┐ ┌card─────────┐   │
│ ┌ movie card ───────────────┐ │  │ (sticky)      │ │ poster 160px│ │             │   │
│ └───────────────────────────┘ │  │ [Update       │ └─────────────┘ └─────────────┘   │
│ ┌ movie card ───────────────┐ │  │  results]     │ 2-col grid of horizontal cards    │
│ └───────────────────────────┘ │  └───────────────┴──────────── [Show 10 more] ──────┘
│ [      Show 10 more       ]   │
│▓ ♡ 2 shortlisted · You pick →▓│  F6 tray, shown only when used
└───────────────────────────────┘
```

- **Paging:** 10 of the 20 results in the first response render first. **Show 10
  more** reveals the rest without a new request, and only then is page 2 fetched.
  Short lists help with choice overload.
- **No infinite scroll:** it keeps keyboard users from ever reaching the footer.
- **Sort:** Popular, or Top rated (`vote_average.desc` with `vote_count.gte=500`).
- **Screen readers:** the status region announces "12 movies found". **Show more**
  moves focus to the first new card's h3 (`tabindex=-1`), and the H key jumps from
  card to card.

**Recipe results**
```
┌───────────────────────────────┐  1280px: filter sidebar as on the movie page,
│ Step 2 of 3 · Meal   ■■■■□□   │  3-column grid of vertical recipe cards
│ [p] With Paddington 2 · Change│  (square image on top; names are short).
│ What are we eating?      (h1) │
│ [☑ Match the movie]  Why? ▾   │  F4: "British family comedy → British comfort food"
│ Diet  [☐Vegetarian][☐Vegan]   │  baseline (category filter)
│ Course (●Any)(○Main)(○Dessert)│
│ Avoid [☐Nuts][☐Shellfish]… ⓘ  │  F8: "We check ingredient lists only"
│ ┌ recipe card ──────────────┐ │
│ └───────────────────────────┘ │
│ [      Show 12 more       ]   │
└───────────────────────────────┘
```
Picking a recipe goes straight to the Date page, where the drink is chosen. That keeps
this screen to a single decision.

**Date package**
```
┌───────────────────────────────┐  1280px:
│ Step 3 of 3 · Date   ■■■■■■   │  ┌ decorative backdrop band + solid scrim ────────────┐
│ Your date night          (h1) │  │ Your date night · Fri 12 Oct · play 8:00 PM  [Edit]│
│ Fri 12 Oct · play 8:00 PM Edit│  ├ ticket (7 of 12 cols) ─────┬ plan (5 cols, sticky)─┤
│ ╭ ticket ───────────────────╮ │  │ movie row        [Change]  │ Cooking time chips    │
│ │[poster] Paddington 2 (h2) │ │  │ - - - - - - - - - - - - -  │ 6:45 Start cooking    │
│ │ PG · 1h 44m · On Netflix  │ │  │ meal row         [Change]  │ 7:30 Eat              │
│ │ [▶ Trailer]     [Change]  │ │  │ - - - - - - - - - - - - -  │ 8:00 Press play       │
│ ◖ - - - - - - - - - - - - - ◗ │  │ drink row + drink radios   │ 9:44 Credits          │
│ │[dish] Shepherd's Pie (h2) │ │  │                            │[Share][Save][Calendar]│
│ │ 11 ingredients [Cook mode]│ │  │                            │ [Start Cook Mode]     │
│ ◖ - - - - - - - - - - - - - ◗ │  └────────────────────────────┴───────────────────────┘
│ │[drink] Lime Rickey   (h2) │ │
│ │(●Zero-proof)(○Cocktail)(○None) [Another]
│ ╰───────────────────────────╯ │
│ Tonight's plan (h2)      F5   │
│ Cooking (○30)(●45)(○60)(○90)  │
│ 6:45 Start cooking · 7:30 Eat │
│ 8:00 Press play · 9:44 Credits│
│ [Add to calendar]             │
│▓ [   Share   ]  [ ♡ Save ]   ▓│
└───────────────────────────────┘
```

- **Drink:** defaults to zero-proof, is remembered, and takes one tap to change. That
  includes people who don't drink at no cost to anyone else.
- **Tab order:** the DOM follows the visual order (h1, ticket h2s, plan, bar), so tab
  order matches what people see.

**Saved dates ("Your dates")**
```
┌───────────────────────────────┐  1280px: "Upcoming" and "Past" h2 sections,
│ Your dates               (h1) │  each a 3-column grid of mini-tickets.
│ Saved on this device only.    │
│ Upcoming (h2)                 │
│ ┌ [poster][dish] Fri 12 Oct ┐ │
│ │ Paddington 2 + Shepherd's │ │
│ │ [Open] [Share] [Delete]   │ │  Delete → Undo toast (no confirm dialog)
│ └───────────────────────────┘ │
│ Past (h2) …                   │
│ Empty: "No saved dates yet.   │
│ Plan one and tap Save."       │
│ [Plan a date night]           │
└───────────────────────────────┘
```

**Team**
```
┌───────────────────────────────┐  1280px: 5 cards in a row (3 + 2 below 1100px).
│ The team                 (h1) │
│ Built in 2022 as a group      │
│ project by five developers.   │
│ ┌ [avatar] Cha Vue          ┐ │  avatar: github.com/{user}.png?size=160, alt=""
│ │ GitHub: @chavue91         │ │  (the name is adjacent); same-tab links
│ └───────────────────────────┘ │
│ … ×5                          │
│ Credits (h2): TMDB · JustWatch│
│ · TheMealDB · TheCocktailDB   │
└───────────────────────────────┘
```

## 8. Innovative feature proposals

**Ranking.** Features are ranked by Value, then Feasibility, with Innovation breaking
ties. One judgment call: F4 ranks above F5 because vibe pairing is the README's
headline promise.

**Baseline.** The Vegetarian and Vegan chips are a free category filter, so they ship
anyway and aren't scored here.

| # | Feature | Pitch | Job to be done | V | I | F | Effort | |
|---|---|---|---|---|---|---|---|---|
| 1 | **Date Ticket** (save and share by link) | The whole date is one URL: save it, text it, reopen it, no account | "Invite my date" · "remember what we planned" | 5 | 3 | 5 | M | **MUST** |
| 2 | **Cook Mode** | Big-type steps, a screen that stays awake, "simmer 20 minutes" becomes a timer | "Cook without a sticky phone going to sleep" · "don't lose my place" | 5 | 4 | 4 | M | **MUST** |
| 3 | **On our services** | Only movies you can actually stream tonight | "Don't fall for a movie we'd have to rent" | 5 | 3 | 4 | S–M | **MUST** |
| 4 | **Explainable vibe pairing** | Recipes start out matched to the movie, with a one-line "why" | "Decide quickly" (and the README's promise) | 4 | 4 | 4 | M | **MUST** |
| 5 | **Night plan and calendar invite** | Count back from "press play" and send an invite | "Don't keep a hungry date waiting" | 4 | 3 | 5 | S–M | |
| 6 | **Shortlist and "You pick"** | Shortlist 3, then pass the phone or send a link | "Decide together without one of us steamrolling" | 4 | 4 | 4 | M | |
| 7 | **Surprise us** | One tap for a complete date; swap any item | "We're too tired to choose" | 3 | 2 | 5 | S | |
| 8 | **Avoid list (best effort)** | Hide recipes with ingredients you don't eat | "Don't show us food we won't eat" | 3 | 2 | 3 | M | |

**F1 · Date Ticket**

- **URL:** the URL is the plan, with IDs only:
  `date.html?m=346648&r=52772&d=11007&at=2026-10-12T20:00&cook=45`.
- **Open:** it rehydrates from TMDB
  `GET /movie/{id}?append_to_response=release_dates,watch/providers,videos`, TheMealDB
  `lookup.php?i=` and TheCocktailDB `lookup.php?i=`.
- **Save:** writes `{url, at, titles, image paths}` to `localStorage` (`dl.dates.v1`),
  so the saved list renders offline. It also calls `navigator.storage.persist()`.
- **Share:** `navigator.share({title, text, url})`. The text names the movie, dish, time
  and an optional note. The fallbacks are `navigator.clipboard.writeText`, then a
  pre-selected field.
- *Risks:*
  - Link previews stay generic because the OG tags are static, so the share text
    carries the detail.
  - Safari may evict storage after 7 idle days. The UI says "saved on this device",
    and the link is the durable copy.

**F2 · Cook Mode** (`cook.html?r=`)

- **Screen:** `navigator.wakeLock.request('screen')`, re-requested on
  `visibilitychange`, with an off switch.
- **Steps:** `strInstructions` is split on line breaks or on "STEP n" / "1." markers.
  If there are none, sentences are grouped into chunks of about 250 characters.
- **Timers:** a regex like
  `(\d+|one…ten)(?:\s*(?:-|to)\s*(\d+))?\s*(min|minutes|hours?)` creates "Start
  20-min timer" buttons.
  - They're based on timestamps, so they survive the tab being backgrounded.
  - When done, they fire a `role="alert"`, a Web Audio chime and `navigator.vibrate`.
- **Checklist:** native checkboxes built from the non-empty
  `strIngredientN`/`strMeasureN` pairs.
- **Controls:** 64 px Back and Next buttons, the ←/→ keys, an "All steps" view, and a
  "Step 3 of 7" announcement.
- *Risks:*
  - Some splits will be odd; the All steps view means nothing is hidden.
  - Wake Lock in iOS home-screen apps needs testing.
  - The system may kill background tabs.
```
┌───────────────────────────────┐
│ ✕ Exit  Shepherd's Pie   3/7  │
│ ☀ Screen stays on      [Off]  │
│ Fry the onions and carrots    │  cook size, 22–28px
│ until soft, about 10 minutes. │
│ [ ⏱ Start 10-min timer ]      │
│ Ingredients ▾      All steps  │
│ ⏱ 07:42 left                  │
│▓[ ← Back ]       [ Next → ]  ▓│  64px targets
└───────────────────────────────┘
```

**F3 · On our services**

- **Chips:** one cached `GET /watch/providers/movie?watch_region={XX}` call, showing the
  top 8 by `display_priorities`.
- **Region:** taken from `navigator.language` and shown with a Change link.
- **Filter:** Discover adds
  `with_watch_providers=8|337&watch_region=US&with_watch_monetization_types=flatrate|free|ads`,
  where `|` means OR. That's still **one request**, and it replaces the old 20–40
  provider calls.
- **Cards:** "On Netflix" comes from the appended `watch/providers`.
- **Attribution:** JustWatch is credited next to the chips and in the footer.
- *Risks:* regional data can be stale, and the region guess can be wrong. The region
  is always visible, and the empty state offers "Include rentals".

**F4 · Explainable vibe pairing.** A hand-written JSON map of about 40 lines.

- **Area:** `original_language` and `origin_country` map to a TheMealDB area:
  it→Italian, ja→Japanese, hi/ta/te→Indian, es+MX→Mexican, GB→British.
- **Category:** genre maps to categories:
  - Comedy → Pasta/Dessert
  - Romance → Seafood/Dessert
  - Horror/Thriller → Starter/Side ("food you can eat without looking")
  - Drama → Lamb/Beef
  - Family → Pasta/Chicken
- **Query:** `filter.php?a=` and `filter.php?c=` run in parallel. Their results, and any
  Diet chip, are **intersected client-side by `idMeal`**. Under 4 hits, the query
  relaxes visibly to area only, then category only.
- **Drink:** `filter.php?a=Non_Alcoholic` or `filter.php?i=Lime`.
- **UI:** a "Why?" disclosure and a "Match the movie" switch.
- *Risks:*
  - It can drift into cliché, so it stays explainable and easy to switch off.
  - Unmapped languages, possibly Korean (check `list.php?a=list`), fall back to genre
    only.
  - Intersections can be tiny, which the staged fallback handles.

**F5 · Night plan and calendar invite**

- **Inputs:** "Press play at" (`<input type="time">`, default 20:00) and cooking-time
  chips for 30, 45, 60 or 90 minutes. The user chooses because TheMealDB has no times,
  and the copy says so.
- **Plan:** TMDB `runtime` gives start cooking → eat → play → credits.
- **Invite:** a browser-built `.ics` VEVENT in floating local time ("8 pm wherever you
  both are").
  - DESCRIPTION holds the ingredients and the date link.
  - A VALARM fires 15 minutes before cooking starts.
  - It's shared via `navigator.canShare({files})`, or downloaded with `a[download]`.
- *Risks:* floating times behave differently across calendars (test iOS, Google and
  Outlook). The cooking time is a guess.

**F6 · Shortlist and "You pick"**

- **Shortlist:** toggles with `aria-pressed` fill a tray that opens
  `pick.html?m=603,27205,550`. The finalists sit side by side, each with a **This one**
  button.
- **Hand-off:** pass the phone, or send the link via Web Share or the clipboard. The
  pick produces a Date Ticket URL to send back.
- *Risk:* remote use takes two messages and can't send a notification, so the "send it
  back" step has to be obvious.

**F7 · Surprise us**

- **Movie:** Discover with a quality floor (`vote_average.gte=6.8&vote_count.gte=500`),
  the saved services and rating cap, on a random page from 1 to 5.
- **Recipe:** a random item from the F4 intersection, not `random.php`, which ignores
  diet filters.
- **Result:** lands on the ticket with Change on every item.
- *Risk:* repeats, prevented by a per-session "seen" set.

**F8 · Avoid list (best effort)**

- **Chips:** Pork, Beef, Shellfish, Nuts, Dairy and Mushrooms.
- **Matching:** each lazy lookup's 20 `strIngredientN` fields are checked against
  synonym lists (for pork: bacon, ham, prosciutto, chorizo, lard…).
- **Result:** matches are hidden ("3 of 12 hidden"), and the next page fills the gap.
- **Copy:** "We check ingredient lists only. Always double-check for allergies."
- *Risks:*
  - Hidden allergens (stock, pesto, Worcestershire sauce, fish sauce) mean this is
    **never** labeled allergy-safe.
  - The synonym lists need curation.

## 9. What NOT to build

- **Cook time, difficulty, servings scaling or calories.** None of these fields exist,
  and measures are free text ("a pinch", "2 large"). Any estimate would be made up,
  and scaling would be wrong.
- **"Allergy-safe" or "gluten-free" badges.** Ingredient names can't prove them, and a
  false label does harm. That's why F8 stays a preference.
- **A swipe deck as the main picker.** It's gesture-only, so WCAG 2.5.1 and 2.5.7 would
  demand button alternatives anyway. It also hides options side by side and slows
  comparison. F6 serves "decide together" better.
- **Real-time co-planning, sync or chat.** These need a WebSocket or WebRTC signaling
  server. URL handoff (F1, F6) covers the need.
- **Push reminders.** Web Push needs a push server and VAPID keys. The `.ics` VALARM
  covers it.
- **Accounts or cloud sync.** There's no backend; the share link is the sync.
- **LLM "mood" matching.** It needs keys or a backend, and it's slow and opaque. The
  vibe map is free and explainable.
- **Autoplaying trailers, video heroes or per-genre recoloring.** These cost bytes and
  battery, and they run into WCAG 2.2.2 and motion sensitivity. Every tint would also
  need its contrast re-verified.
- **Bulk-downloading TheMealDB** (`search.php?f=a…z`, 26 calls). It's too heavy on
  mobile data.
- **"Play on Netflix" deep links.** TMDB only gives a TMDB/JustWatch page.
- **Infinite scroll.** It traps keyboard users before the footer and keeps growing
  memory. "Show more" does the job instead.

## 10. Assumptions and open questions

- **Architecture:** I'm assuming a multi-page app, GET forms and state in the URL. An
  SPA would need to keep the same URL contract.
- **Theme:** dark on first visit, whatever the OS setting. "Follow the OS" would be a
  one-line change. This is open for debate.
- **Region:** `navigator.language`, falling back to US, and editable. Certification is
  US-only (`certification_country=US`). Do non-US users need their local ratings?
- **Still to verify:**
  - Image-size URL suffixes.
  - `list.php?a=list`, for F4.
  - Atkinson file sizes.
  - iOS Wake Lock in home-screen apps.
  - Outlook's handling of floating `.ics` times.
- **TMDB key:** it's visible client-side, which a static site can't avoid, so it should
  be the only key. TMDB and JustWatch attributions go in every footer.
- **Team page:** the README says **@Thisara-DE**, but `our-team.html` links
  **ThisaraMallawaArachchige**. Which one is correct?
- **Drinks:** is a zero-proof default with no age gate acceptable? I've assumed yes.
- **Validation:** there's no analytics (for privacy), so nothing will validate F5–F8.
  Run a hallway test with 5 couples before building F6 or F8.
