# dateLime redesign: Analyst A proposal, "Limelight"

*Analyst A (Experience & Brand), 2026-09-24. Every contrast ratio here was measured with the brief's `contrast.py`.*

## 1. Direction: **Limelight**

Limelight was the 1800s stage light made by heating lime, and to be "in the limelight" is to be the whole show. dateLime takes the pun literally. The living room becomes a private cinema and supper club for two with the house lights down, and **lime is the only light in the room**.

Surfaces are *velvet*, a warm plum-black like a theatre seat in the dark. Lime marks what's lit: the next action, the current choice and the brand. I retune it from Bulma's generic success green #23D160 to a true citrus, **Zest #9FE143** (hue 85°), which is nearly complementary to velvet (267°).

The flow plays in three acts: *The Feature*, *The Menu* and *The Ticket*. It ends in a paper cinema ticket stamped **ADMIT TWO**. The feeling is anticipation, mischief and candlelight, so planning the date feels like the start of it.

Two rules carry the system:
- **Lit = inverse + lime.** Primary and selected elements flip to maximum contrast and carry lime. In dark that means a lime pill with a velvet label. In light it means a velvet pill with a lime label, because lime on white is only 1.58:1.
- **Rectangles are screens, circles are plates.** Posters are always 2:3. Food and drink photos are always circles.

## 2. Principles, voice & tone

1. **Lights down, lime up.** Velvet does the quiet work. Lime marks the one next thing and covers no more than 10% of any screen.
2. **Two people, one phone.** It gets passed across a couch, so it uses 48px targets, arm's-length type, and choices that feel like a game.
3. **Every step is a scene.** Each screen holds one decision and a visible "what's next". The ending is an object (the ticket), not a page.
4. **Honest charm.** We never fake data: no invented cook times, real certifications only, and plain errors with a way out.
5. **Nobody's left out.** Diets, screen readers, keyboards, color-blindness (we never rely on color alone) and reduced motion are first-class.

**Voice:** warm, witty, a little flirty, never crude.
- Wordplay goes in headlines only.
- Buttons are plain verbs.
- We say "you two", never gendered roles.
- Errors drop the jokes after the headline.

| Moment | Copy |
|---|---|
| Landing hero + CTA | Eyebrow: "DATE NIGHT, IN". H1: "Dinner and a movie, *for two.*" Body: "Pick tonight's film. We'll pair a dish and a drink with its mood, then hand you a ticket for two." Primary: **Start tonight's date**. Secondary: **Surprise us**. |
| Loading | "Dimming the lights…" (movies), "Setting the table…" (recipes), "Muddling the lime…" (drinks). Screen readers get one plain line: "Loading movies." |
| Empty | "Nothing's showing with those picks." / "Try another mood, raise the rating limit, or add a streaming service." [Change picks] |
| API error | "The projector jammed." / "We couldn't reach the movie database. Check your connection and try again. Your picks are still here." [Try again] [Open a saved date] |
| Saved / shared | "Saved to your date diary." [View]. After Web Share: "Ticket sent. Admit two!" After a clipboard copy: "Link copied. Paste it to your date." |

## 3. Color theme

**Default: dark, "Late Show"** (the light theme is "Matinee"). Dark wins for four reasons:
- It's used in the evening in a dim room, where a white screen is a flashlight in your partner's face.
- Lime works as *light*: 11.97:1 on velvet against 1.58:1 on white.
- Posters and food look richer on dark.
- It cures the original sin of lime wallpaper under white text (2.03:1).

**Theme rules:**
- First visits get Late Show regardless of the OS setting, because light is the never-chosen default on most phones.
- A header toggle, "Lights up / Lights down" (`aria-pressed`), is remembered and applied before first paint.
- **Brand moments stay velvet in both themes:** the header "marquee", the landing "stage" and the share image.
- **The ticket takes the opposite theme:** paper on Late Show, velvet on Matinee.
- `prefers-contrast: more` promotes secondary and muted text to primary and borders to 2px.
- `forced-colors` uses system colors.

**Lime scale (both themes):** 50 #F6FCE9 · 100 #EAF8CF · 200 #D6F2A3 · 300 #BDEB74 · **400 #9FE143 Zest** · 500 #84C92F · 600 #64A01E · 700 #446F12 · 800 #34540F · 900 #263D0C · 950 #16240A

| Token | Late Show (default) | Matinee |
|---|---|---|
| bg.page | #140F1A velvet | #FBF7F1 program paper |
| bg.raised | #1E1726 | #FFFFFF |
| bg.overlay (sheets, toasts) | #2A2133 | #FFFFFF + shadow; toasts #1A1420 |
| bg.sunken (inputs) | #0E0A12 | #F2ECE3 |
| text.primary | #F6F2EC moonlight | #1A1420 ink |
| text.secondary | #D2C8DC | #463C50 |
| text.muted | #A89CB6 | #685D73 |
| text.brand / link | #BDEB74; eyebrows Zest #9FE143 | #446F12 |
| brand.fill → hover → active | #9FE143 → #BDEB74 → #84C92F | #1A1420 → #2E2537 → #000000 |
| text.on-brand | #140F1A | #BDEB74 |
| border.strong (control edges) | #7A6E88 | #8A7F94 |
| border.hairline (*decorative only*) | #372C42 | #E6DED3 |
| focus.ring (2px, 2px offset) | #D6F2A3 | #446F12 |
| success fg / tint | #BDEB74 / #1E2E12 | #34540F / #EEF8DC |
| warning fg / tint | #FFC96B / #3A2B12 | #8A5200 / #FFF3DA |
| danger fg / tint | #FF8A73 / #3B1A1C | #B42A1A / #FDECE8 |
| info fg / tint | #9DBEFF / #1A2440 | #2556C4 / #EAF0FF |
| accent.blush (love and match only) | #FF9CC8 | #A62B7C |
| ticket | paper #F7F0E4 with Matinee text tokens | velvet with Late Show tokens |
| scrim | rgb(14 10 18 / .72) | same |

Blush and danger sit 37–46° of hue apart, and each always carries its own icon (heart or alert).

**Measured contrast** (AA: text ≥4.5, large text and UI ≥3). In rows marked ¹, the surfaces are page / raised / overlay for Late Show and page / white / sunken for Matinee.

| Pairing | Late Show | Matinee |
|---|---|---|
| text.primary ¹ | 16.92 / 15.62 / 13.81 | 16.89 / 18.03 / 15.35 |
| text.secondary ¹ | 11.71 / 10.81 / 9.56 | 9.73 / 10.38 / 8.84 |
| text.muted ¹ (Late Show on sunken) | 7.27 / 6.71 / 5.94 (7.56) | 5.78 / 6.17 / 5.26 |
| brand text ¹ | Zest 11.97 / 11.05 / 9.77; #BDEB74 13.75 / 12.69 / 11.22 | 5.58 / 5.95 / 5.07 |
| on-brand label: rest / hover / active | 11.97 / 13.75 / 9.32 | 13.13 / 10.65 / 15.30 |
| secondary label on hover / active tint | 10.91 / 8.82 (#25281F / #303922) | 15.35 / 13.52 |
| border.strong ¹ | 3.97 / 3.66 / 3.24 | 3.55 / 3.79 / 3.23 |
| focus ring ¹ | 15.35 / 14.17 / 12.53 | 5.58 / 5.95 (page / white) |
| ring touching a lime fill (why the offset is required) | 1.15 ✗ | n/a |
| danger: page / raised / tint, then filled-button label | 8.21 / 7.58 / 6.76, ink 8.21 | 5.99 / 6.39 / 5.58, white 6.39 |
| warning: page / raised / tint | 12.42 / 11.46 / 9.01 | 5.99 / 6.39 / 5.81 |
| info: page / raised / tint | 10.10 / 9.32 / 8.20 | 6.14 / 6.55 / 5.74 |
| success on tint (Matinee on page in brackets) | 10.52 | 7.89 (8.13) |
| text.primary on danger / warning / info / success tints | 13.94 / 12.27 / 13.74 / 12.94 | 15.74 / 16.38 / 15.80 / 16.39 |
| blush ¹ | 9.74 / 8.99 / 7.95 | 6.04 / 6.45 / 5.49 |
| ink toast: text / lime icon / #FF8A73 icon | n/a | 16.17 / 13.13 / 7.84 |
| ticket paper: ink / secondary / muted / #446F12 / blush | 15.92 / 9.17 / 5.45 / 5.25 / 5.69 | uses the Late Show pairs |
| stub ink on Zest; paper edge against page | 11.44; 16.66 | n/a |
| worst-case photo scrim #37333C (85% velvet over white): primary / secondary | 11.07 / 7.66 | same |
| hairline against page (decorative only) | 1.44 | 1.25 |
| heritage fallback: #23D160 on velvet; ink on #23D160 | 9.31; 8.89 | n/a |

## 4. Typography

Fonts are self-hosted variable woff2 with a Latin subset, **150 KB or less in total**. Roboto Condensed and Figtree are preloaded. Fraunces uses `font-display: swap` with a metric-matched Georgia fallback, so the layout doesn't shift.

- **Roboto Condensed** (100–900): the wordmark (800), marquee labels (eyebrows, steps, ticket fields, badges) and tabular numerals.
- **Fraunces** (opsz 9–144, 500–700, italic 400): the display serif, with a warm menu-card romance. Its italic is reserved for accents ("*for two*").
- **Figtree** (300–900): all UI and body text. Its big x-height and open apertures read well at arm's length.

| Token | Size (390 → 1280px) | Face / weight | LH | Tracking |
|---|---|---|---|---|
| wordmark.hero | clamp(4.5rem, 3.25rem + 7.19vw, 9rem) = 80 → 144px | RC 800 | 0.9 | −0.03em |
| display (H1) | clamp(2.25rem, 1.7rem + 2.25vw, 3.5rem) = 36 → 56 | Fraunces 600 (accent: italic 400) | 1.05 | −0.015em |
| h2 | clamp(1.75rem, 1.42rem + 1.35vw, 2.5rem) = 28 → 40 | Fraunces 600 | 1.1 | −0.01em |
| h3 | clamp(1.375rem, 1.32rem + 0.22vw, 1.5rem) = 22 → 24 | Fraunces 600 | 1.2 | 0 |
| title (cards) | 1.125rem | Figtree 700 | 1.3 | 0 |
| body-lg (plots, steps) | 1.125rem (Showtime 1.375rem) | Figtree 400 | 1.6 | 0 |
| body | 1rem | Figtree 400 | 1.55 | 0 |
| body-sm (meta) | 0.875rem | Figtree 500 | 1.45 | 0.005em |
| label | 0.875rem UPPERCASE | RC 700 | 1.2 | 0.08em |
| button | 1rem | Figtree 700 | 1 | 0.01em |
| micro (attribution only, the size floor) | 0.75rem | Figtree 500 | 1.4 | 0.01em |

**Rules:**
- No body text in RC or Fraunces.
- Fraunces never goes below 22px.
- Italic only for accents of one to three words.
- Sentence case everywhere except `label`.
- Lines no longer than 68ch.
- `tabular-nums` for times.

**Wordmark:** "dateLime" in RC 800, lowercase "date" plus capital "Lime".
- **Two-tone:** "date" in text.primary and "Lime" in Zest, on velvet.
- **Print lockup:** ink with #446F12 (5.58:1 on paper).
- **Mono versions:** all moonlight on photos, all ink for print.
- **Size:** 1.5rem in the mobile nav and 1.75rem on desktop, never below 18px. Clear space equals the height of the "L".
- **Never** outline it, fill it with a gradient, italicize it or set it on lime.

**Glyph, the lime slice:** a #64A01E rind (8% of the diameter), #EAF8CF pith, and 8 Zest segments (6 below 20px). It appears as:
- the favicon and app icon, on velvet;
- the header lockup (1.1× cap height, 0.3em gap);
- the ticket seal, spinner and rating unit;
- on the landing, a **half slice rising behind the wordmark like a moon** (the "lime moon").

An optional hero flourish turns the "i" tittle into a tiny slice (outlined SVG, `aria-label="dateLime"`).

## 5. Shape, spacing, elevation, motion, iconography, imagery

- **Radius:** xs 4 (badges) · sm 8 (inputs, thumbnails) · md 12 (posters) · lg 20 (cards, sheets) · xl 28 (ticket, stage) · pill 999 (buttons, chips). The ticket's notches are 12px semicircles cut with a CSS `mask`.
- **Spacing (4-pt):** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96.
  - Gutters are 16/24/32px.
  - Max width is 1200px (ticket 960px, text 68ch).
  - Targets are at least 48px (WCAG 2.2 requires 24).
  - Sticky bars set `scroll-padding-bottom` so focus is never obscured (2.4.11).
- **Elevation:**
  - Late Show:
    - e1 `inset 0 1px 0 rgb(255 255 255/.04), 0 2px 6px rgb(0 0 0/.35)`
    - e2 `0 12px 32px -8px rgb(0 0 0/.6)`
    - e3 `0 24px 64px -12px rgb(0 0 0/.75)`
  - Matinee uses the same offsets in plum: `rgb(26 20 32/.08–.30)`.
  - **Glow** exists in Late Show only: `0 0 0 1px #9FE143, 0 8px 28px -6px rgb(159 225 67/.45)`. It's reserved for selected chips, primary hover and the lime moon.
- **Motion:**
  - **Durations:** micro 90ms (press, scale .97) · fast 160ms (hover, focus) · base 240ms (chips, toasts) · sheet 380ms · scene 650ms (page transitions, ticket print) · ritual 1200ms (lime moon, once per session).
  - **Easings:** standard `cubic-bezier(.2,0,0,1)` · enter `(.05,.7,.1,1)` · exit `(.3,0,.8,.15)` · pop `(.34,1.56,.64,1)`, used for selection only.
  - **Signature moments:** moon rise, chip pop, poster-to-ticket morph (View Transitions, `view-transition-name: poster`), the ticket printing out of a slot, a match burst, and a "Lights down" vignette.
  - **Reduced motion:** no transforms, parallax or bursts. View transitions become 120ms crossfades. No shimmer, and the spinner is static with text. Nothing auto-advances or loops for more than 5s.
- **Icons:** Lucide (ISC license) on a 24px grid: 1.75px stroke, round joins, `currentColor`, 20px inside chips and buttons.
  - Custom icons on the same grid: slice, ticket, popcorn, plate, coupe, candle and reel.
  - Filled only to show state (a filled heart means saved).
  - Icon-only buttons get an `aria-label` and a tooltip.
- **Posters:** always 2:3, never squared.
  - TMDB `srcset` at w185/w342/w500.
  - 12px radius plus a 1px inner stroke of `rgb(255 255 255/.08)`, so dark posters don't dissolve into the page.
  - Lazy-loaded with `decoding="async"`.
  - A missing poster becomes a typographic poster: the title in Fraunces on velvet.
- **Backdrops:** a w780 image tops the movie sheet and fades into the surface. Behind the ticket, a static w300 copy (40px blur, 30% opacity) acts as a "screen glow" in Late Show only.
- **Food and drink:** always circles.
  - Plates are 150px in the grid and 96–160px on the ticket. Coasters are 48px.
  - The source images are square and centred on the dish, so losing the corners is acceptable.
  - Photos are **never filtered**.
  - Alt text: "{meal}, plated".

## 6. Core components

| Component | Spec and states |
|---|---|
| **Primary button** | A 48px pill (56px in the hero and sticky bars), padding 0 24px.<br>• **Late Show:** Zest fill, velvet label.<br>• **Matinee:** ink fill, #BDEB74 label.<br>• **Hover:** lighter fill plus glow (Matinee: #2E2537).<br>• **Active:** #84C92F (Matinee: #000), scaled to .97.<br>• **Focus:** 2px ring at a 2px offset.<br>• **Disabled:** avoided. Use `aria-disabled` plus helper text that gives the reason, with a muted label on overlay/sunken (5.94 / 5.26). |
| Secondary | 1.5px border in Zest or ink, with a #BDEB74 or ink label. Hover: #25281F / #F2ECE3. Active: #303922 / #E6DED3. |
| Tertiary / danger | Links in brand text, underlined on hover. Destructive actions show danger text first, then a filled danger button to confirm. |
| **Chips / pills** | Real radio or checkbox inputs in a `fieldset` with a `legend`, 48px tall.<br>• **Unselected:** raised fill, border.strong, text.primary.<br>• **Selected:** lit = inverse **plus a ✓ icon**, with a 240ms pop.<br>• **Mood tiles:** 96px chips with an icon, the mood and a genre line. |
| **Movie card** | An `<article>` holding a 2:3 poster (`alt=""`) and an `<h3><button>` title whose `::after` covers the whole card. That gives one control per card, with no nested links and no document-wide listener.<br>• **Meta line:** "2001 · ★ 7.9".<br>• **"On your services" badge:** shown only when the query guarantees it.<br>• **Hover:** lifts 2px with a glow. The focus ring wraps the whole card. |
| Movie sheet | A `<dialog>`: a 92vh bottom sheet on mobile, a 520px right drawer on desktop. Top to bottom:<br>• backdrop with the poster overlapping it, then the h2 title<br>• "2001 · 2h 2m · R · Romance, Comedy", using the *real* certification<br>• italic tagline and the **full plot**<br>• [▶ Trailer] (youtube-nocookie in a nested dialog)<br>• provider logos with "Data by JustWatch"<br>• "Pairs with: French bistro"<br>• a sticky [Pick this movie] button |
| **Recipe card** | Circle photo, title, "French · Vegetarian", "9 ingredients" (an honest effort proxy), and the pairing reason in brand text ("Paris match").<br>Its sheet has an ingredient checklist with measures, numbered steps, YouTube and source links, and [Cook this]. |
| **Step progress** | `<ol aria-label="Progress">`: ACT I THE FEATURE · ACT II THE MENU · ACT III THE TICKET in RC, joined by a dashed perforation.<br>• **Current** (`aria-current="step"`): Zest dot.<br>• **Done:** ✓.<br>• **Upcoming:** muted.<br>On mobile it shrinks to "ACT II OF III · THE MENU" and a 3-segment bar. |
| **Date package: the "Admit Two" ticket** | An `<article>` with an xl radius and notches. Top to bottom:<br>1. **Header strip:** "DATELIME PRESENTS · A DOUBLE FEATURE".<br>2. **Feature:** poster, h2 title, year, runtime and certification.<br>3. A perforation.<br>4. **Menu:** plate, recipe and area, plus an optional drink coaster (zero-proof available).<br>5. **Run of show:** "7:15 cook · 8:00 dinner · 8:30 feature · 10:32 credits". The end time comes from the TMDB runtime. Cook and dinner times are labelled "your estimate" (45 + 30 min by default, editable).<br>6. **Stub:** a Zest band reading "ADMIT TWO · FRI 26 SEP · 8:30 PM", with the slice seal.<br>Any decorative barcode is `aria-hidden`. |
| **Toast** | Bottom-center above the safe area, at most 420px wide. It holds a slice ✓ icon, the text and an optional action, with `role="status"`.<br>• Stays 5s, or 8s if it has an action. Pauses on hover and focus.<br>• The action is also reachable elsewhere. Deletes get an Undo.<br>• **Errors are never toasts.** |
| **Skeleton** | Matches the exact final shapes (2:3 blocks, circles, two text bars) on raised. A diagonal "projector beam" sweeps across every 1.6s, and stays static under reduced motion. The list gets `aria-busy="true"` and one polite announcement. |
| **Empty / error** | Replaces the content region. It shows a slice illustration (alone on a plate, or tangled in film), an h3, plain body text, and one primary plus one secondary action.<br>• **Errors:** `role="alert"`, and the user's selections are kept.<br>• **Offline:** "You're offline. Saved dates still work." |

## 7. Screen concepts

The titles shown are illustrative.

**Mobile header (56px):** the slice and wordmark sit on the left. "Dates" (with a count badge) and a menu popover (Plan, House rules, Crew, Lights up/down) sit on the right. On landing the header shows only the slice until the hero scrolls away, so the wordmark never appears twice. On desktop, the menu items sit inline.

**Landing (390px)**
```
┌ velvet stage (both themes) ────────┐
│ ◉                     Dates(2)  ≡  │
│            ◠ lime moon + glow      │
│         dateLime   (80px)          │
│ DATE NIGHT, IN                     │
│ Dinner and a movie, for two.       │  display 36
│ Pick tonight's film. We'll pair…   │
│ [ Start tonight's date        → ]  │  primary 56px
│ [ ⟳ Surprise us                 ]  │  secondary
├ page ──────────────────────────────┤
│ Pick up where you left off     ›   │  only if a draft exists
│ ACT I film · ACT II menu · ACT III │  3 tiles: how it works
│ ♥ Can't agree? Try Match Night  →  │  blush-accent card
│ TMDB · JustWatch · MealDB · Crew   │  footer + attributions
└────────────────────────────────────┘
```

**Choose your movie (390px)**
```
│ ACT I OF III · THE FEATURE   ▬▭▭   │
│ What's the mood tonight?           │
│ Pick one, or one each.             │  2 picks = blend
│ ┌ Swoony ─────────┐┌ Belly laughs ┐│  96px mood tiles:
│ │ Romance         ││ Comedy       ││  icon, mood,
│ └─────────────────┘└──────────────┘│  genre line
│  Edge-of-seat · Scream together    │
│  Tearjerker · Mind-bender          │
│  Cozy classic · Big adventure      │
│ How late are we going?             │
│ (Short <100m)(Standard <130m)(Epic)│
│ Keep it at or below                │
│ ( G )( PG )( PG-13 )( R )( Any )   │
│ Streaming on: Netflix, Max  Edit › │  House Rules
├────────────────────────────────────┤
│ [          Show movies  →       ]  │  sticky bar
```
There are no dead ends: with nothing picked, the button reads "Show popular picks".

**Movie results (390px)**
- Editable filter-summary chips sit at the top.
- Sort options: Crowd favorites (`sort_by=vote_average.desc&vote_count.gte=500`), Popular, Newest.
- The grid has 2 columns of 171×256 posters with 16px gaps, 20 per page.
- A [More movies] button loads the next page. There's no infinite scroll, so the footer and attributions stay reachable.
- A card opens the movie sheet.

**Recipe results (390px)**
```
│ ACT II OF III · THE MENU   ▬▬▭     │
│ ┌ ▭ Amélie ───────────────────┐    │  pairing header
│ │ Set in Paris → French bistro│    │
│ │ classics and a sweet finish.│    │
│ └─────────────────────────────┘    │
│ (Perfect pairing)(Lighter)(Sweet)  │  tabs
│ (✓ Vegetarian)(No pork)(≤8 ingr) › │  house-rule chips, scroll
│     ◯ plate          ◯ plate       │  2 cols, 150px circles
│  Ratatouille       Dish name       │
│  French · Veg      French · Veg    │
│  9 ingredients     7 ingredients   │
```
[Cook this] opens an "Add a drink?" sheet: three coasters, a zero-proof toggle and [Skip the drink]. From there the user goes to the ticket.

**Date package (390px)**
```
│ ACT III · THE TICKET               │
│ Your date is set.                  │
│ When? [ Fri 26 Sep · 8:30 PM ▾ ]   │  datetime-local
│ ╭ paper ticket ──────────────────╮ │
│ │ DATELIME PRESENTS              │ │
│ │ ▭ poster  Amélie               │ │
│ │           2001 · 2h 2m · R     │ │
│ ◖ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐◗ │
│ │ ◯ Ratatouille · French         │ │
│ │ ◦ Kir Royale (or zero-proof)   │ │
│ │ 7:15 cook · 8:00 eat · 8:30    │ │
│ │ film · 10:32 credits           │ │
│ ◖ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐◗ │
│ │ ADMIT TWO · FRI 26 SEP      ◉  │ │  Zest stub
│ ╰────────────────────────────────╯ │
│ [ Share ticket ]                   │  primary
│ [ Save to diary ] [ + Calendar ]   │
│ [ Start Showtime mode ]            │
│ ▸ Full recipe   ▸ About the movie  │  disclosures
```

**Our dates (390px)**
- Upcoming and Past tabs, each with a count, sit over a list of stub cards.
- Each card shows the date and time in RC, poster and plate thumbnails, both titles, and [Open] [Share] [⋯]. The ⋯ menu holds Duplicate and Delete (with Undo).
- Past cards add "How was it?" (1–5 lime slices) and a note.
- Export and import live in the header's ⋯ menu.

**The crew (390px)**
- Styled as end credits, with no auto-scroll.
- A short blurb: "Made by five bootcamp grads in 2021, remastered in 2026."
- **STARRING:** five rows, each with an initials avatar in a Zest ring, the name in Fraunces 22px, and a "GitHub ↗" link whose accessible name reads like "Cha Vue on GitHub".
- **WITH DATA FROM:** TMDB · JustWatch · TheMealDB · TheCocktailDB.

**Desktop (1280px, 12 columns, 32px gutters)**

| Screen | Layout |
|---|---|
| Landing | A 640px velvet stage. Columns 1–6 hold the 144px wordmark, the 56px H1 and the CTAs. Columns 7–12 show an illustrated sample ticket, tilted −4°, under the lime moon. Nothing above the fold calls an API. Below the stage come the three acts in a row, a Match Night band and the "Pick up" row. |
| Choose movie | A centered 720px column with 4-column mood tiles and the CTA inline. |
| Movie results | A filter bar over a 5-column grid of posters about 214px wide. The sheet becomes a 520px drawer with the backdrop as its header. |
| Recipe results | A sticky 320px left rail (pairing card and House Rules) next to a 4-column grid of circles. |
| Date package | A horizontal 960×380 ticket with the stub on the right, on the screen glow. Actions sit below it, then two columns: the recipe (ingredients, steps) and the movie (plot, providers, trailer). |
| Saved dates | Tabs and [Plan another] across the top, then a 3-column grid of stubs. |
| Team | A centered 640px credits column with 28px names. |

## 8. Innovative feature proposals

| Rank | Feature | Pitch | Effort | V / I / F | |
|---|---|---|---|---|---|
| 1 | **Vibe Pairing** | Every movie gets a dish and a drink matched to its setting and mood, plus a one-line reason. | M | 5 / 4 / 4 | **MUST** |
| 2 | **Admit Two** | The date package becomes a ticket you can save, send and add to your calendar. | M | 5 / 4 / 4 | **MUST** |
| 3 | **Match Night** | You each swipe the same 10 movies, and the app reveals your matches. | M | 5 / 5 / 4 | **MUST** |
| 4 | **House Rules** | Set diet, streaming services and vetoes once, and every date obeys them. | S–M | 5 / 3 / 5 | **MUST** |
| 5 | **Mood Dial** | Pick a feeling, not a genre, or blend one mood each. | S | 4 / 3 / 5 | |
| 6 | **Showtime Mode** | A hands-free cook-along that keeps the screen awake and counts down to "lights down". | M | 4 / 4 / 4 | |
| 7 | **Spin the Lime** | One tap deals a full date on three reels. Hold what you like and re-spin the rest. | S | 3 / 3 / 5 | |
| 8 | **Afterglow** | Rate the night in limes, keep a note, and get "one year ago tonight" reminders. | S | 3 / 3 / 5 | |

**1. Vibe Pairing (MUST)**

*Value:* It keeps the README's unbuilt promise. A reason line ("Set in Paris → French bistro classics") makes the pairing feel curated rather than random.

*How:*
- One TMDB call: `GET /movie/{id}?append_to_response=keywords,release_dates`.
- A hand-written `pairings.json` (about 40 rules) picks TheMealDB lists in three tiers:
  - **Origin:** `original_language` or `production_countries` maps to an area (fr→French, it→Italian, ja→Japanese, hi→Indian…) via `filter.php?a=`.
  - **Keywords:** "paris"→French, "christmas"→`filter.php?c=Dessert`.
  - **Genre mood:** Romance→French and Dessert, Comedy→American or Mexican, Drama→slow Beef or Lamb, Sci-Fi→Japanese, Horror→shareable Starter or Side.
- The lists are filtered by House Rules and merged to about 12.
- `lookup.php?i=` runs only for cards that get opened, and results are cached in IndexedDB.
- Drinks are curated TheCocktailDB IDs per rule, fetched with `lookup.php?i=` (Kir Royale for Paris). Otherwise we use `filter.php?i=Lime` or `filter.php?a=Non_Alcoholic`.

*Risks:*
- Pairings are subjective and could turn into stereotypes. Every rule gets an editorial review, and reasons cite setting and mood, never people.
- Areas with few recipes fall back a tier.

**2. Admit Two (MUST)**

*Value:* The ending finally works (save, share, calendar), and it needs no backend.

*How:*
- State lives in the URL fragment `#t=`: base64url of `{v:1,m,r,d,at:"2026-09-26T20:30",n:"≤80-char note"}`, about 120 characters.
- **Save** writes to IndexedDB.
- **Share** calls `navigator.share({title,text,url})`. Where `navigator.canShare({files})` allows, it attaches a 1080×1350 canvas PNG. Otherwise it falls back to Clipboard `writeText` plus a toast.
- **Calendar** downloads an `.ics` Blob: a VEVENT in floating local time, with the run of show and the link in DESCRIPTION.
- Recipients get "You're invited": the ticket slides out of an envelope, with [Add to calendar] and [Plan our own].

*Risks:*
- Image hosts that don't send CORS headers taint the canvas. The fallback is a typographic PNG.
- Notes in the URL are readable by anyone with the link, and the UI says so.
- Some desktops lack Web Share. They get the copy fallback.

**3. Match Night (MUST)**

*Value:* It ends "I don't mind, you pick" and makes choosing the night's first game. It's the feature people show their friends.

*How:*
- Discover supplies 10 TMDB IDs with House Rules applied.
- **Pass the phone:** A votes, the screen says "Pass to your date, no peeking", B votes, then the reveal.
- **Two phones:** A shares `#match=v1.<ids>.<10-bit mask>`. B votes, B's device computes the intersection and offers a "send the result back" link.
- Swiping uses Pointer Events. **Yes/No buttons and ←/→ keys** work just as well (WCAG 2.5.1, 2.5.7).
- A match triggers a blush burst, plus an optional `navigator.vibrate` on Android.

*Risks:*
- A's mask can be peeked. It's lightly obfuscated and framed as a game.
- With no overlap, the app offers "Deal 10 more, or let Spin the Lime decide".
- The asynchronous relay needs one clear explainer screen.
- Feasibility: pass the phone 5, two phones 3.

**4. House Rules (MUST)**

*Value:* It removes the two date-killers, "can't eat it" and "can't stream it". It also covers the README's dietary promise and the wireframes' filter pills.

*How:*
- Stored in localStorage.
- **Discover** gets:
  - `with_watch_providers` and `watch_region`. The region defaults from `navigator.language`, and provider choices come from `/watch/providers/movie?watch_region=`.
  - `certification_country=US&certification.lte=`, which fixes the old bug.
  - `without_genres` for vetoes.
- **Diets in TheMealDB** are exact and cheap:
  - Intersect a pairing list, by `idMeal`, with `filter.php?c=Vegetarian` or `c=Vegan`.
  - Or subtract `c=Pork`, `Beef`, `Lamb` or `Goat`.
  - Each is one cached call per category, with no lookups.
- Allergen words are flagged in ingredient lists once a recipe is looked up.
- Zero-proof maps to `filter.php?a=Non_Alcoholic`.

*Risks:*
- Allergen flags are a heads-up, never a guarantee, and the copy says so.
- Provider data lags, so we show JustWatch attribution.
- Stacked vetoes can empty the results, which leads to the guided empty state.

**5. Mood Dial**

*Value:* Couples decide by feeling. Eight moods replace both the old four radio buttons and TMDB's 19 genres.

*How:*
- A static table maps each mood to Discover parameters, for example:
  - Swoony: `with_genres=10749&vote_average.gte=6.5&vote_count.gte=300`
  - Mind-bender: `with_genres=878|9648`
  - Cozy classic: `with_genres=35|10751&with_runtime.lte=110`
- Two moods combine with AND (`,`). Under 8 results, they fall back to OR (`|`).
- "How late are we going?" sets `with_runtime.lte`.

*Risks:* Moods are subjective. Each tile therefore shows its genres, and a "pick exact genres" option is always there.

**6. Showtime Mode**

*Value:* The date happens in the kitchen too, and a phone that sleeps under floury hands ruins it.

*How:*
- `navigator.wakeLock.request('screen')` keeps the screen on and is re-requested on `visibilitychange`.
- `strInstructions` is split into big-type step cards. Space moves to the next one.
- A duration regex ("20 minutes", "30–35 mins") creates tap-to-start timers with a Web Audio chime.
- A countdown ("Feature starts in 25 min") ends in **Lights down**. It dims the page and opens TMDB's JustWatch where-to-watch link.
- The Service Worker caches the saved date for offline use.

*Risks:*
- Wake Lock isn't everywhere, so we show a notice when it's missing.
- The regex will miss some times, so timers stay editable.
- Audio needs a gesture. The start tap provides it.

**7. Spin the Lime**

*Value:* A zero-effort path for tired couples, and a playful one.

*How:*
- **Feature:** Discover with House Rules, a random `page` from 1 to 10 and `vote_count.gte=500`.
- **Menu:** the Vibe Pairing pool. We avoid `random.php` because it ignores diets.
- **Drink:** a random pick from the Lime or Non_Alcoholic filter.
- Three `<output>` reels, each with a hold toggle (`aria-pressed`). Under reduced motion the swap is instant.

*Risks:* Randomness can feel arbitrary. Holds and re-spins soften it.

**8. Afterglow**

*Value:* It turns the planner into a shared memory book and prevents repeats.

*How:*
- IndexedDB diary entries gain `{rating (1–5 limes), note}`.
- On open, same-day anniversaries surface ("One year ago tonight: Amélie + Ratatouille").
- Watched movies are filtered out of Discover on the client.
- JSON export and import use a Blob download and `<input type=file>`.

*Risks:*
- Data lives on one device, which is why export exists.
- Notes can be private, which matters on shared devices.

## 9. Assumptions & open questions

**Assumptions**
- The hue shift and the two-tone wordmark fall within "refine how it's colored". If they're vetoed, the heritage green drops into the Zest slot: 9.31:1 on velvet, with ink on it at 8.89:1.
- US certifications set the rating ceiling. The locale's region sets the providers.
- Every cook and dinner time is labelled as the user's estimate.
- About 40 reviewed pairing rules ship as static JSON.
- The landing page makes no API calls above the fold.

**Open questions**
1. Will the product owner accept the hue shift and the two-tone lockup?
2. Should dark be the default regardless of the OS, or should we follow `prefers-color-scheme`? I expect Analyst B to argue for the OS setting. My fallback is to follow the OS but keep the marquee, stage and share image velvet.
3. Do `image.tmdb.org` and `themealdb.com` send CORS headers? That decides whether the share PNG can include photos, and it needs a spike.
4. Should drinks default to alcoholic, zero-proof or both? I propose both until House Rules say otherwise.
5. Should the share PNG ship in v1, or should v1 share a URL only?
6. The team page links Thisara to `ThisaraMallawaArachchige`, but the README says `@Thisara-DE`. Which is right, and do contributors want roles listed in the credits?
7. Should localization go beyond US certifications?
