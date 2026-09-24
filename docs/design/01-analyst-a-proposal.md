# dateLime redesign: Analyst A proposal, "Limelight"

*Analyst A, Experience & Brand. Written for the critique round, 2026-09-24. Every contrast ratio below was measured with the brief's `contrast.py`.*

## 1. Direction: **Limelight**

Limelight was the stage light of the 1800s, made by heating a block of lime, and being "in the limelight" means being the whole show. This direction takes the pun literally. The living room becomes a private cinema and supper club for two, with the house lights down, and **lime is the only light in the room**. Surfaces are *velvet*: a warm plum-black, like a theatre seat in the dark. Lime marks what's lit: the next action, the current choice, the brand. I retune it from Bulma's generic "success" #23D160 to a true citrus **Zest #9FE143** (hue 85°), which sits almost exactly opposite velvet (hue 267°) on the color wheel. The flow plays in three acts, *The Feature*, *The Menu* and *The Ticket*, and ends in something worth sending: a paper cinema ticket stamped **ADMIT TWO**. The feeling should be anticipation, a little mischief and candlelight, so that planning the date already feels like the start of it.

Two rules carry the system:
- **Lit = inverse + lime.** Anything primary or selected flips to maximum contrast and carries lime. In the dark theme that's a lime pill with a velvet label. In the light theme it's a velvet pill with a lime label, because lime on white is only 1.58:1.
- **Rectangles are screens, circles are plates.** Posters are always 2:3 rectangles. Food and drink photos are always circles: the plate, the coaster, the lime slice.

## 2. Principles, voice & tone

1. **Lights down, lime up.** Velvet does the quiet work, and lime marks the one thing to do next. Lime covers ≤10% of any screen, because if everything glows, nothing does.
2. **Two people, one phone.** It's built to be passed across a couch: 48px targets, text readable at arm's length, and choices that feel like a game rather than a form.
3. **Every step is a scene.** Each screen asks for one decision, shows a visible "what's next", and has a ceremonial transition that respects reduced motion. The ending is an object (the ticket), not a page.
4. **Honest charm.** Delight never fakes data. There are no invented cook times, the movie's rating is its real certification, and errors are plain and offer a way forward.
5. **Nobody's left out of date night.** Dietary needs, screen readers, keyboards, color-blind users (state is never shown by color alone) and reduced motion are all first-class.

**Voice:** warm, witty, a little flirty, never crude. Cinema and kitchen wordplay goes in headlines only. Buttons are plain verbs. The copy says "you two" and "your date", never gendered roles. After an error headline, the jokes stop.

| Moment | Copy |
|---|---|
| Landing hero + CTA | Eyebrow "DATE NIGHT, IN" · H1 "Dinner and a movie, *for two.*" · "Pick tonight's film. We'll pair a dish and a drink with its mood, then hand you a ticket for two." · **Start tonight's date** · secondary **Surprise us** |
| Loading | "Dimming the lights…" (movies) · "Setting the table…" (recipes) · "Muddling the lime…" (drinks). Screen readers get a single plain announcement, "Loading movies." |
| Empty | "Nothing's showing with those picks." / "Try another mood, raise the rating limit, or add a streaming service." [Change picks] |
| API error | "The projector jammed." / "We couldn't reach the movie database. Check your connection and try again. Your picks are still here." [Try again] [Open a saved date] |
| Saved / shared | Toast "Saved to your date diary." [View] · after Web Share "Ticket sent. Admit two!" · clipboard fallback "Link copied. Paste it to your date." |

## 3. Color theme

**Default: dark ("Late Show"). Light theme: "Matinee".** Here is why dark is the default:
- People use this in the evening in a dim room, where a white screen is a flashlight in your partner's face.
- Lime works as *light*: it measures 11.97:1 on velvet but only 1.58:1 on white.
- Posters and food photography look richer on dark, which is the cinema convention.
- It fixes the original sin, which was lime used as wallpaper under white text (2.03:1).

The first visit is Late Show whatever the OS setting, because "light" is the never-chosen default on most phones. A header toggle ("Lights up" / "Lights down", `aria-pressed`) remembers the choice, and a tiny inline head script applies it before first paint. **Brand moments stay velvet in both themes**: the header ("marquee"), the landing hero ("stage") and the share image. The ticket always takes the *opposite* theme: paper on Late Show, velvet on Matinee. `prefers-contrast: more` maps secondary and muted text to primary and makes borders 2px. `forced-colors` falls back to system colors.

**Lime scale (theme-independent):** 50 #F6FCE9 · 100 #EAF8CF · 200 #D6F2A3 · 300 #BDEB74 · **400 #9FE143 Zest** · 500 #84C92F · 600 #64A01E · 700 #446F12 · 800 #34540F · 900 #263D0C · 950 #16240A

| Token | Late Show (default) | Matinee |
|---|---|---|
| bg.page | #140F1A velvet | #FBF7F1 program paper |
| bg.raised | #1E1726 | #FFFFFF |
| bg.overlay (sheets, toasts) | #2A2133 | #FFFFFF + shadow (toasts #1A1420) |
| bg.sunken (inputs) | #0E0A12 | #F2ECE3 |
| text.primary | #F6F2EC moonlight | #1A1420 ink |
| text.secondary | #D2C8DC | #463C50 |
| text.muted | #A89CB6 | #685D73 |
| text.brand / link | #BDEB74 (Zest #9FE143 for eyebrows) | #446F12 |
| action.fill → hover → active | #9FE143 → #BDEB74 → #84C92F | #1A1420 → #2E2537 → #000000 |
| text.on-action | #140F1A | #BDEB74 |
| border.strong (control edges) | #7A6E88 | #8A7F94 |
| border.hairline (*decorative only*) | #372C42 | #E6DED3 |
| focus.ring (2px, 2px offset) | #D6F2A3 | #446F12 |
| success fg / tint | #BDEB74 / #1E2E12 | #34540F / #EEF8DC |
| warning fg / tint | #FFC96B / #3A2B12 | #8A5200 / #FFF3DA |
| danger fg / tint | #FF8A73 / #3B1A1C | #B42A1A / #FDECE8 |
| info fg / tint | #9DBEFF / #1A2440 | #2556C4 / #EAF0FF |
| accent.blush (love and match moments only) | #FF9CC8 | #A62B7C |
| ticket | paper #F7F0E4 with Matinee text tokens | velvet with Late Show tokens |
| scrim | rgb(14 10 18 / .72) | same |

Blush and danger are kept 37–46° of hue apart, and each always travels with its own icon (heart vs. alert).

**Measured contrast (WCAG 2.2 AA: text ≥4.5, large text and UI ≥3):**

| Pairing | Late Show | Matinee |
|---|---|---|
| text.primary on page / raised / overlay (Matinee: sunken) | 16.92 / 15.62 / 13.81 | 16.89 / 18.03 / 15.35 |
| text.secondary, same surfaces | 11.71 / 10.81 / 9.56 | 9.73 / 10.38 / 8.84 |
| text.muted, same surfaces (+ sunken) | 7.27 / 6.71 / 5.94 (7.56) | 5.78 / 6.17 / 5.26 |
| brand text on page / raised / overlay | Zest 11.97 / 11.05 / 9.77; #BDEB74 13.75 / 12.69 / 11.22 | #446F12 5.58 / 5.95 / 5.07 (sunken) |
| label on action fill: rest / hover / active | 11.97 / 13.75 / 9.32 | 13.13 / 10.65 / 15.30 |
| secondary button label on hover / active tint (#25281F / #303922) | 10.91 / 8.82 | ink on #F2ECE3 / #E6DED3: 15.35 / 13.52 |
| border.strong vs page / raised / overlay (Matinee: page / white / sunken) | 3.97 / 3.66 / 3.24 | 3.55 / 3.79 / 3.23 |
| focus ring vs page / raised / overlay (Matinee: page / white) | 15.35 / 14.17 / 12.53 | 5.58 / 5.95 |
| ring touching lime fill (why the offset is mandatory) | #BDEB74 on #9FE143 = 1.15 ✗ | — |
| danger on page / raised / tint | 8.21 / 7.58 / 6.76; ink on danger fill 8.21 | 5.99 / 6.39 / 5.58; white on fill 6.39 |
| warning on page / raised / tint | 12.42 / 11.46 / 9.01 | 5.99 / 6.39 / 5.81 |
| info on page / raised / tint | 10.10 / 9.32 / 8.20 | 6.14 / 6.55 / 5.74 |
| success on tint | 10.52 | 7.89 (page 8.13) |
| text.primary on danger / warning / info / success tints | 13.94 / 12.27 / 13.74 / 12.94 | 15.74 / 16.38 / 15.80 / 16.39 |
| blush on page / raised / overlay (Matinee: page / white / sunken) | 9.74 / 8.99 / 7.95 | 6.04 / 6.45 / 5.49 |
| light toast: moonlight / lime icon / danger icon on #1A1420 | — | 16.17 / 13.13 / 7.84 |
| ticket paper: ink / secondary / muted / lime / blush | 15.92 / 9.17 / 5.45 / 5.25 / 5.69 | (uses Late Show pairs) |
| ticket stub: ink on Zest · paper edge vs page | 11.44 · 16.66 | — |
| worst-case text on photo scrim (85% velvet over white = #37333C) | primary 11.07, secondary 7.66 | same |
| hairline vs page (decorative, never the only edge) | 1.44 | 1.25 |
| heritage fallback: #23D160 on velvet · ink on #23D160 | 9.31 · 8.89 | — |

## 4. Typography

The type is self-hosted variable woff2 files with a Latin subset, **≤150 KB total**. Roboto Condensed and Figtree are preloaded. Fraunces uses `font-display: swap` with a metric-matched Georgia fallback so nothing shifts on load.

- **Roboto Condensed** (100–900) sets the wordmark at 800. It also sets the *marquee labels* (eyebrows, step names, ticket fields, badges) and tabular numerals.
- **Fraunces** (opsz 9–144, weights 500–700, plus italic 400) is the display serif. It's warm and menu-card romantic, and its italic is for accents like "*for two*".
- **Figtree** (300–900) handles all UI and body text. It has a large x-height and open apertures, so it stays legible at arm's length.

| Token | Size (390 → 1280px) | Face / weight | Line height | Tracking |
|---|---|---|---|---|
| wordmark.hero | clamp(4.5rem, 3.25rem + 7.19vw, 9rem): 80 → 144px | RC 800 | 0.9 | −0.03em |
| display (H1) | clamp(2.25rem, 1.7rem + 2.25vw, 3.5rem): 36 → 56 | Fraunces 600 (accent: italic 400) | 1.05 | −0.015em |
| h2 | clamp(1.75rem, 1.42rem + 1.35vw, 2.5rem): 28 → 40 | Fraunces 600 | 1.1 | −0.01em |
| h3 | clamp(1.375rem, 1.32rem + 0.22vw, 1.5rem) | Fraunces 600 | 1.2 | 0 |
| title (cards) | 1.125rem | Figtree 700 | 1.3 | 0 |
| body-lg (plots, steps) | 1.125rem (Showtime: 1.375rem) | Figtree 400 | 1.6 | 0 |
| body | 1rem | Figtree 400 | 1.55 | 0 |
| body-sm (meta) | 0.875rem | Figtree 500 | 1.45 | 0.005em |
| label | 0.875rem, UPPERCASE | RC 700 | 1.2 | 0.08em |
| button | 1rem | Figtree 700 | 1 | 0.01em |
| micro (attribution only) | 0.75rem (the floor) | Figtree 500 | 1.4 | 0.01em |

**Rules:** Body text is never Roboto Condensed or Fraunces, and Fraunces never goes below 22px. Italic is for accents of one to three words only. Text is sentence case everywhere except `label`. Lines are at most 68ch. Numerals use `tabular-nums`.

**Wordmark:** "dateLime" in RC 800, with lowercase "date" and capital "Lime" unchanged. It's **two-tone**: "date" in text.primary and "Lime" in Zest on velvet. The print lockup, on paper, is ink plus #446F12 (5.58:1). There are also mono versions: all moonlight on photos, all ink for print. The nav size is 1.5rem on mobile and 1.75rem on desktop, the minimum is 18px, and the clear space on every side equals the height of the "L". Never outline it, add a gradient, italicize it or place it on a lime fill.

The supporting glyph is a **lime slice**: an 8% rind ring in #64A01E, a pith ring in #EAF8CF, and 8 Zest segments (6 below 20px). It appears in four places:
- **Favicon and app icon**, on a velvet rounded square.
- **Header lockup**, at 1.1× cap height with a 0.3em gap before the wordmark.
- **Ticket seal, spinner and rating unit.**
- **Landing hero, as a half slice** rising behind the wordmark like a moon (the "lime moon"). An optional flourish for the hero only swaps the "i" tittle for a tiny slice, using an outlined SVG with `aria-label="dateLime"`.

## 5. Shape, spacing, elevation, motion, iconography, imagery

- **Radius:** xs 4 (badges), sm 8 (inputs, thumbnails), md 12 (posters), lg 20 (cards, sheets), xl 28 (ticket, hero stage), pill 999 (buttons, chips). The ticket's perforation is cut with 12px semicircle notches using a CSS `mask` radial-gradient.
- **Spacing (4-pt):** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96. Gutters are 16 / 24 / 32px. Content is at most 1200px wide, the ticket at most 960px, and reading text at most 68ch. Touch targets are ≥48px, well above WCAG 2.2's 24px minimum. The sticky bottom bar sets `scroll-padding-bottom` so focus is never hidden behind it (2.4.11).
- **Elevation.** Late Show uses a lighter surface plus shadow:
  - e1 is `inset 0 1px 0 rgb(255 255 255/.04), 0 2px 6px rgb(0 0 0/.35)`.
  - e2 is `0 12px 32px -8px rgb(0 0 0/.6)`.
  - e3 is `0 24px 64px -12px rgb(0 0 0/.75)`.

  Matinee uses plum-tinted shadows: `rgb(26 20 32/.08–.30)` at the same offsets. Glow (Late Show only) is `0 0 0 1px #9FE143, 0 8px 28px -6px rgb(159 225 67/.45)` and is reserved for selected chips, primary hover and the lime moon.
- **Motion tokens:**
  - Durations: micro 90ms (press, scale .97), fast 160ms (hover, focus), base 240ms (chips, toasts), sheet 380ms, scene 650ms (page transitions, the ticket "printing"), ritual 1200ms (the lime moon, once per session).
  - Easings: standard `cubic-bezier(.2,0,0,1)`, enter `(.05,.7,.1,1)`, exit `(.3,0,.8,.15)`, and pop `(.34,1.56,.64,1)` (selection only).
  - Signature moments: the lime moon rises, a chip pops and glows on select, the poster morphs into the ticket (View Transitions, `view-transition-name: poster`), the ticket prints up out of a slot, match segments burst, and Showtime's "Lights down" dims the edges.
  - **Reduced motion:** no transforms, parallax or bursts. View transitions become a 120ms crossfade, the shimmer stops, and the spinner becomes a static slice with text. Nothing auto-advances and nothing loops for more than 5s.
- **Icons:** Lucide (ISC license), on a 24px grid with a 1.75px stroke and round joins, in `currentColor`. They're 20px inside chips and buttons. Custom icons follow the same grid: lime slice, ticket, popcorn, plate, coupe, candle and reel. Filled icons are used only to show state (a filled heart means saved). Icon-only buttons get an `aria-label` and a tooltip.
- **Posters:**
  - Always 2:3 and never squared, with `srcset` from TMDB w185, w342 (grid at 2×) and w500 (ticket).
  - A 12px radius and a 1px inner stroke `rgb(255 255 255/.08)` so dark posters don't dissolve into the page.
  - Lazy-loaded with `decoding="async"`.
  - A missing poster becomes a *typographic poster*: the title in Fraunces on velvet with a small slice.
- **Backdrops:** w780 at the top of the movie sheet, fading into the surface. Behind the ticket, a w300 version blurred 40px at 30% gives a static "screen glow" (Late Show only).
- **Food and drink:** always circles, meaning plates (grid 150px, ticket 96–160px) and coasters (48px). TheMealDB and TheCocktailDB images are square and dish-centred, so the corner loss is acceptable. Photos are **never filtered**. Alt text reads "{meal}, plated".

## 6. Core components

| Component | Spec and states |
|---|---|
| **Primary button** | Pill, 48px (56px for hero and sticky CTAs), padding 0 24px, button type. Late Show: Zest with a velvet label. Matinee: ink with a #BDEB74 label. Hover: lighter fill + glow, or #2E2537. Active: #84C92F or #000 with scale .97. Focus: 2px ring with 2px offset. **Disabled:** avoided. Instead we use `aria-disabled` with the reason as helper text and a muted label on overlay/sunken (5.94 / 5.26). |
| Secondary | 1.5px border (Zest or ink) with a #BDEB74 or ink label. Hover tint #25281F or #F2ECE3, active #303922 or #E6DED3. |
| Tertiary / danger | Text links in brand text, underlined on hover. Destructive actions use danger text; after confirming, a filled danger button (ink or white label). |
| **Chips / pills** | Real radio or checkbox inputs inside a `fieldset` with a `legend`. 48px tall. Unselected: raised fill, border.strong, text.primary. **Selected: lit = inverse, plus a ✓ icon** (never color alone), with a 240ms pop. Mood tiles are 96px chips with an icon, the mood, and a genre line. |
| **Movie card** | `<article>`: 2:3 poster (`alt=""`), then an `<h3><button>` title whose `::after` stretches across the whole card. That gives one control per card, with no nested links and no document-wide listener. Meta line: "2001 · ★ 7.9". An "On your services" badge appears only when the query guarantees it. Hover lifts 2px with a glow. The focus ring wraps the card. |
| Movie sheet | A `<dialog>`: a bottom sheet at 92vh on mobile, a 520px right-side drawer on desktop. It shows the backdrop, the overlapping poster, an h2, "2001 · 2h 2m · R · Romance, Comedy" (the *real* certification), the italic tagline, the **full plot**, a [▶ Trailer] button (youtube-nocookie in a nested dialog), provider logos with "Data by JustWatch", a teaser line "Pairs with: French bistro · Kir Royale", and a sticky [Pick this movie]. |
| **Recipe card** | Circle photo, title, "French · Vegetarian", "9 ingredients" (an honest effort proxy), and a pairing reason in brand text ("Paris match"). The recipe sheet has an ingredient checklist with measures, numbered steps, YouTube and source links, and [Cook this]. |
| **Step progress** | `<ol aria-label="Progress">` with ACT I THE FEATURE · ACT II THE MENU · ACT III THE TICKET as RC labels joined by a dashed "perforation". The current step (`aria-current="step"`) gets a Zest dot. Done steps get a ✓, upcoming ones are muted. Mobile collapses it to "ACT II OF III · THE MENU" plus a 3-segment bar. |
| **Date package: "Admit Two" ticket** | `<article>` with an xl radius and notches. **Header strip:** "DATELIME PRESENTS · A DOUBLE FEATURE". **Feature:** poster, title (h2), year · runtime · cert. **Perforation.** **Menu:** a plate circle, recipe, area, and the drink on a coaster (optional, with zero-proof). **Run of show**, e.g. 7:15 cook · 8:00 dinner · 8:30 feature · 10:32 credits: the end time uses TMDB runtime, while cook and dinner times are labelled "your estimate" (default 45 + 30 min, editable). **Stub:** a Zest band with "ADMIT TWO · FRI 26 SEP · 8:30 PM" and the slice seal. Any decorative barcode is `aria-hidden`. |
| **Toast** | Bottom-center, above the safe area, max 420px. A lime-slice ✓ icon, text and an optional action. Uses `role="status"`. Stays 5s (8s with an action), pauses on hover or focus, and its action is always available elsewhere too. Offers Undo after a delete. **Errors are never toasts.** |
| **Skeleton** | The exact shapes of the real content (2:3 blocks, circles, two text bars) on raised. A diagonal "projector beam" sweeps across every 1.6s and is static under reduced motion. The list gets `aria-busy="true"` and one polite announcement. |
| **Empty / error** | Replace the content region. A slice illustration (a slice alone on a plate; a slice tangled in film), an h3 headline, plain body text, and one primary plus one secondary action. Errors use `role="alert"` and keep the user's selections. When offline: "You're offline. Saved dates still work." |

## 7. Screen concepts

The mobile header is 56px: slice + wordmark on the left, then an "Our dates" ticket icon with a count badge, and a menu popover holding Plan, House rules, Crew and Lights up/down. The desktop header lists those items inline.

**Landing (390px)**
```
┌ velvet stage (both themes) ─────────┐
│ ◉ dateLime               🎟2   ≡   │
│           ◠  lime moon + glow       │
│        dateLime   (80px)            │
│  DATE NIGHT, IN                     │
│  Dinner and a movie, for two.       │  display 36
│  Pick tonight's film. We'll pair…   │
│ [ Start tonight's date        → ]   │  primary 56px
│ [ ⟳ Surprise us                 ]   │  secondary
├ page ──────────────────────────────┤
│ Pick up where you left off  ›      │  if a draft or upcoming date exists
│ ACT I film · ACT II menu · ACT III ticket   (3 tiles)
│ ♥ Can't agree? Try Match Night →   │  blush-accent card
│ TMDB · JustWatch · MealDB · CocktailDB · Crew
└────────────────────────────────────┘
```

**Choose your movie (390px)**
```
│ ACT I OF III · THE FEATURE  ▬▭▭    │
│ What's the mood tonight?           │
│ Pick one, or one each.             │  max 2 = blend
│ [♥ Swoony      ] [☺ Belly laughs ] │  96px mood tiles, 2 columns,
│ [⚡ Edge-of-seat] [☠ Scream togeth.] │  genre line under each
│ [☂ Tearjerker  ] [✦ Mind-bender  ] │
│ [☕ Cozy classic] [⛰ Big adventure] │
│ How late are we going?             │
│ (Short <100m)(Standard <130m)(Epic)│
│ Keep it at or below                │
│ ( G )( PG )( PG-13 )( R )( Any )   │
│ Streaming on: Netflix, Max  Edit › │  from House Rules
│▔ sticky: [ Show movies → ] ▔▔▔▔▔▔▔ │  no dead ends: with nothing
                                         picked it reads "Show popular picks"
```

**Movie results (390px).** Filter summary chips sit at the top, each with an edit icon, followed by a Sort control (Crowd favorites / Popular / Newest). Below is a 2-column poster grid of 171×256 posters with a 16px gap, 20 per page, and a [More movies] button (no infinite scroll). Tapping a card opens the movie sheet.

**Recipe results (390px)**
```
│ ACT II OF III · THE MENU  ▬▬▭      │
│ ┌▭ Amélie ─────────────────────┐   │  pairing header
│ │ Set in Paris → French bistro │   │
│ │ classics and a sweet finish. │   │
│ └──────────────────────────────┘   │
│ (Perfect pairing)(Lighter)(Sweet ending)  tabs
│ (✓Vegetarian)(No pork)(≤8 ingr.) ›  │  house-rule chips, scrollable
│    ◯ plate         ◯ plate         │  2 columns, 150px circles
│  Ratatouille    Tian provençal     │
│  French · Veg   French · Veg       │
│  9 ingredients  7 ingredients      │
```
[Cook this] opens an "Add a drink?" sheet with 3 coasters (lime-forward by default), a zero-proof toggle and a [Skip the drink] option. Then comes the ticket.

**Date package (390px)**
```
│ ACT III · THE TICKET               │
│ Your date is set.                  │
│ When? [ Fri 26 Sep · 8:30 PM ▾ ]   │  datetime-local
│ ╭ paper ticket ─────────────────╮  │
│ │ DATELIME PRESENTS              │  │
│ │ ▭poster  Amélie                │  │
│ │          2001 · 2h 2m · R      │  │
│ ◖ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐◗  │
│ │ ◯ Ratatouille · French         │  │
│ │ ◦ Kir Royale (or zero-proof)   │  │
│ │ 7:15 cook·8:00 eat·8:30 film·10:32
│ ◖ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐ ‐◗  │
│ │▓ ADMIT TWO · FRI 26 SEP ◉ ▓▓▓▓│  │  Zest stub
│ ╰───────────────────────────────╯  │
│ [ Share ticket ]                   │  primary
│ [ Save to diary ] [ Add to calendar ]
│ [ Start Showtime mode ]            │
│ ▸ Full recipe   ▸ About the movie  │  disclosures
```

**Saved dates, "Our dates" (390px).** Tabs for Upcoming (n) and Past (n) sit above a list of stub cards. Each card shows the date and time in RC, a poster thumbnail + plate thumbnail, the titles, and [Open] [Share] [⋯]. The ⋯ menu offers Duplicate and Delete (with Undo). Past cards add "How was it?" with 1–5 lime slices plus a note. Export and import live under ⋯ in the page header.

**Team, "The crew" (390px).** The page is set as end credits, with no auto-scroll. A short blurb ("Made by five bootcamp grads in 2021, remastered in 2026") is followed by a **STARRING** label and five rows: an initials avatar in a Zest ring, the name in Fraunces 22px, and a "GitHub ↗" link with the accessible name "Cha Vue on GitHub". It closes with **WITH DATA FROM** TMDB · JustWatch · TheMealDB · TheCocktailDB.

**Desktop (1280px), 12 columns, 32px gutters:**

| Screen | Layout |
|---|---|
| Landing | A 640px velvet stage. Columns 1–6 hold the 144px wordmark, the 56px H1 and the CTA row. Columns 7–12 hold an illustrated sample ticket, tilted −4°, under the lime moon (no API calls above the fold). Below: the three acts in a row, a Match Night band and the "pick up" row. |
| Choose movie | A centered 720px column. Mood tiles in 4 columns. The CTA sits inline, not sticky. |
| Movie results | Filter bar across the top, then a 5-column grid of ~220px posters. The sheet becomes a 520px right drawer with the backdrop header. |
| Recipe results | A sticky 320px left rail (pairing card + House Rules) and a 4-column circle grid on the right. |
| Date package | A horizontal 960×380 ticket (stub on the right) on the ambient backdrop glow, an action row, then two columns: the recipe (ingredients, steps) and the movie (plot, providers, trailer). |
| Saved dates | Tabs and [Plan another] in the top row, then a 3-column grid of stub cards. |
| Team | A centered 640px credits column with 28px names. |

## 8. Innovative feature proposals

| Rank | Feature | Pitch | Effort | V / I / F | |
|---|---|---|---|---|---|
| 1 | **Vibe Pairing** | Every movie gets a dish and a drink matched to its setting and mood, with a one-line reason why. | M | 5 / 4 / 4 | **MUST** |
| 2 | **Admit Two** | The date package becomes a ticket you save, send and add to your calendar. | M | 5 / 4 / 4 | **MUST** |
| 3 | **Match Night** | Each of you swipes yes or no on the same 10 movies, and dateLime reveals your matches. | M | 5 / 5 / 4 | **MUST** |
| 4 | **House Rules** | Set diet, streaming services and vetoes once, and every date obeys them. | S–M | 5 / 3 / 5 | **MUST** |
| 5 | **Mood Dial** | Pick a feeling, not a genre, or blend one mood each. | S | 4 / 3 / 5 | |
| 6 | **Showtime Mode** | A hands-free cook-along that keeps the screen awake and counts down to "lights down". | M | 4 / 4 / 4 | |
| 7 | **Spin the Lime** | One tap deals a full date on three reels. Hold the ones you like and re-spin the rest. | S | 3 / 3 / 5 | |
| 8 | **Afterglow** | Rate the night in limes, keep a note, and get "one year ago tonight" reminders. | S | 3 / 3 / 5 | |

**1. Vibe Pairing (MUST).**
- **Value:** this is the unbuilt README promise. The *reason* line ("Set in Paris → French bistro classics") makes the app feel curated rather than random.
- **How:** after the movie is picked, call TMDB `GET /movie/{id}?append_to_response=keywords,release_dates` (one call). A hand-authored `pairings.json` of about 40 rules resolves the dish in three tiers:
  - (a) **Origin:** `original_language` / `production_countries` → a TheMealDB area (fr→French, it→Italian, ja→Japanese, hi→Indian, th→Thai, es→Spanish, el→Greek…) via `filter.php?a=`.
  - (b) **Keywords:** "paris"→French, "christmas"→`filter.php?c=Dessert`, "sushi"→Japanese.
  - (c) **Genre mood:** Romance→French + Dessert, Comedy→American/Mexican, Drama→slow Beef/Lamb comfort, Sci-Fi→Japanese, Horror→shareable Side/Starter.
  
  The tiers are merged into a pool of about 12. `lookup.php?i=` runs only for cards on screen and is cached in IndexedDB. The drink comes from TheCocktailDB: `filter.php?i=Lime` by default (on-brand), or `filter.php?a=Non_Alcoholic`, then `lookup.php?i=`.
- **Risks:** pairings are subjective and could read as stereotypes, so every rule gets an editorial review and reasons talk about setting and mood, never people. Sparse areas fall back a tier. The per-recipe lookups are the price of the filter endpoints returning summaries only.

**2. Admit Two (MUST).**
- **Value:** the ending finally *does* something. The broken "Save" is fixed, and the result is social with no backend.
- **How:**
  - **State in the URL:** the fragment `#t=` holds base64url `{v:1,m:<tmdbId>,r:<mealId>,d:<drinkId>,at:"2026-09-26T20:30",n:"≤80-char note"}`, about 120 characters.
  - **Save:** to IndexedDB.
  - **Share:** `navigator.share({title,text,url})`. Where `navigator.canShare({files})` allows it, a 1080×1350 PNG rendered with canvas is attached. The fallback is Clipboard `writeText` plus a toast.
  - **Calendar:** a `.ics` Blob with a VEVENT in floating local time and the run of show plus the link in DESCRIPTION.
  - **Recipient view:** "You're invited", with the ticket sliding out of an envelope and [Add to calendar] [Plan our own].
- **Risks:** if the image hosts don't send CORS headers, the canvas is tainted and the PNG falls back to a typographic ticket. Notes in the URL are readable by anyone with the link, which we say explicitly. Desktop browsers without Web Share get the copy fallback.

**3. Match Night (MUST).**
- **Value:** it ends the "I don't mind, you pick" standoff and turns choosing into the night's first game. It's the feature people will show their friends.
- **How:** both modes use the same 10 TMDB IDs from Discover, filtered by House Rules.
  - **Pass-the-phone:** A votes, a hand-off screen says "Pass to your date, no peeking", B votes, and the matches are revealed.
  - **Two phones:** A shares `#match=v1.<ids>.<10-bit mask>`. B votes, B's device computes the intersection, and it offers a "send result back" link.
  - **Input:** swipes use Pointer Events, and **Yes/No buttons and ←/→ keys work just as well** (WCAG 2.5.1 / 2.5.7).
  - **Payoff:** the match burst uses blush, with an optional `navigator.vibrate` on Android.
- **Risks:** A's mask can be peeked (it's lightly obfuscated, and we say it's a game, not security). No overlap leads to "No match. Deal 10 more, or let Spin the Lime decide." The two-phone relay is asynchronous and needs a single, clear explainer screen. Feasibility is 5 for pass-the-phone and 3 for two phones.

**4. House Rules (MUST).**
- **Value:** it removes the two date-killers, "can't eat it" and "can't stream it". It's the README's dietary promise plus the wireframe's filter pills.
- **How:** the rules live in localStorage and apply to three sources:
  - **TMDB Discover:** `with_watch_providers` + `watch_region` (defaulting to the `navigator.language` region, editable), `certification_country=US&certification.lte=` (fixing the old bug), and `without_genres` for vetoes. Provider choices come from `/watch/providers/movie?watch_region=`.
  - **TheMealDB:** `filter.php?c=Vegetarian|Vegan|Seafood`, with exclusions dropping the Pork, Beef, Lamb and Goat categories. An allergen scan runs on the looked-up ingredient lists.
  - **TheCocktailDB:** zero-proof via `a=Non_Alcoholic`.
- **Risks:** allergen scanning is a heads-up, never a guarantee, and the copy says so. Provider data can be stale (hence the JustWatch attribution). Stacked vetoes can empty the results, which triggers the guided empty state.

**5. Mood Dial.**
- **Value:** couples decide by feeling. Eight moods replace TMDB's 19-genre taxonomy and the old four radio buttons.
- **How:** a static table maps each mood to Discover parameters:
  - Swoony = `with_genres=10749&vote_average.gte=6.5&vote_count.gte=300`
  - Mind-bender = `878|9648`
  - Cozy classic = `35|10751&with_runtime.lte=110`
  
  Two moods combine with AND (`,`), falling back to OR (`|`) when there are fewer than 8 results. "How late are we going?" maps to `with_runtime.lte`.
- **Risks:** moods are subjective, so the genre line stays visible and a "pick exact genres" escape hatch is available.

**6. Showtime Mode.**
- **Value:** the date happens in the kitchen too. A phone that sleeps while your hands are covered in flour ruins it.
- **How:**
  - **Wake lock:** `navigator.wakeLock.request('screen')`, re-acquired on `visibilitychange`.
  - **Steps:** `strInstructions` split into big-type cards (Space moves to the next one).
  - **Timers:** a duration regex ("20 minutes", "30–35 mins") creates tap-to-start timers with a Web Audio chime.
  - **Countdown:** "Feature starts in 25 min", then a "Lights down" button that dims the page and opens the TMDB/JustWatch where-to-watch link.
  - **Offline:** the Service Worker caches the saved date's recipe and images.
- **Risks:** Wake Lock support has gaps (we show a notice when it's missing). The regex will miss some timers, so timers stay editable. Audio needs a user gesture, and the start tap provides it.

**7. Spin the Lime.**
- **How:** the Feature comes from Discover with House Rules and a random `page` from 1 to 10. The Menu comes from the Vibe Pairing pool, *not* `random.php`, which ignores diet. The Drink is a random pick from the Lime or Non_Alcoholic filter. Three `<output aria-live="polite">` reels each have a hold toggle (`aria-pressed`), and under reduced motion the swap is instant.
- **Risks:** random picks can be weak, so results are biased toward `vote_count.gte=500`.

**8. Afterglow.**
- **How:** IndexedDB diary entries gain `{rating, note}`. On open, the app surfaces same-day anniversaries. Movies already watched are filtered out of Discover client-side. The diary can be exported and imported as JSON (a Blob download plus `<input type=file>`).
- **Risks:** the diary lives on one device with no sync, which is exactly why export exists. Notes may be private on shared devices.

## 9. Assumptions & open questions

**Assumptions**
- Shifting #23D160 to Zest #9FE143 and the two-tone wordmark fall within "refine how it's colored". If the owner vetoes it, the heritage green drops straight into the Zest slot (9.31:1 on velvet, 8.89:1 with ink on it) and nothing else changes.
- The rating ceiling uses US certifications, while the region for providers follows the user's locale.
- TheMealDB has no timing data, so every cook or dinner time is the user's labelled estimate.
- The ~40 pairing rules are hand-written, reviewed, and shipped as static JSON.
- There are zero API calls above the fold on the landing page.

**Open questions**
1. Will the product owner accept the hue shift and the two-tone lockup?
2. Should dark be the default regardless of the OS setting, or should we follow `prefers-color-scheme`? I expect Analyst B to argue for following the OS. My acceptable compromise is to follow the OS but keep the marquee, stage and share image velvet in both themes.
3. Do `image.tmdb.org` and `themealdb.com` send CORS headers? That decides whether the share PNG can include photos, and it needs a spike.
4. Should the default drink be alcoholic, zero-proof or both? I propose showing both until House Rules say otherwise.
5. Should the share PNG ship in v1, or should v1 be URL-only?
6. The team page links Thisara to `ThisaraMallawaArachchige`, but the README says `@Thisara-DE`. Which is right, and do contributors want roles in the credits?
7. Should any localization beyond US certifications be in scope?
