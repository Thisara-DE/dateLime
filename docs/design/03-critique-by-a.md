# Critique by Analyst A: "Limelight" meets "Couch-Proof"

*Analyst A, round 2. I've read the moderator's fact sheet and all of B's proposal. I measured every new ratio in this round with `contrast.py`. All byte counts are the moderator's measurements.*

B has engineered the same product better, and on most of the collisions B is simply right. The places where I still disagree are about mood and ceremony, the things that make a date planner feel like a date.

## 1. Adopt

I'd take all of these from B:
- **An SVG wordmark (0 KB)** with visually hidden text and `currentColor`. There's no font flash at 144px, and it survives `forced-colors`.
- **Atkinson Hyperlegible Next for body and UI.** TheMealDB measures are free text ("1 l", "10 g"), so letters that can't be confused (1/l/I, 0/O) matter while you cook. Figtree doesn't solve that.
- **The heritage lime scale** (hue 141°, #23D160 as 500) and **the light-theme hero as a lime field**, with velvet ink on #23D160 at 9.31:1. It brings back the original identity in an accessible way, which is better brand stewardship than my hue shift.
- **The `--brand-edge` rule.** In light mode a #0C5A27 edge measures 7.85:1 on my paper and 4.13:1 against the fill, so the primary button can be lime in both themes.
- **B's movie card**, with a single **Pick** control, a 3-line plot with **More**, and details fetched lazily (at most 4 in parallel) so cards show the *real* certification. Show **10 of 20, then "Show 10 more"** without a new request, and no infinite scroll.
- **Pairing × diet intersected by `idMeal`**, with a staged fallback that says what it did ("No British desserts, so…"). It's cleaner than my tier merge.
- **Picking the drink on the ticket, zero-proof by default.** The recipe screen stays one decision, and people who don't drink are included.
- **Cooking-time chips (30/45/60/90) plus a VALARM reminder.** They're more honest and more concrete than my "your estimate" field.
- **Cook Mode mechanics:** timers based on timestamps, 64px Back/Next buttons, an "All steps" view, and a visible switch for keeping the screen on.
- **Smaller wins from B:**
  - plain step names ("Step 2 of 3 · Meal") instead of my "Acts";
  - empty states that offer a way out ("No Horror rated G. Those two rarely meet." **Allow PG-13**);
  - 3px focus outlines;
  - skeletons that appear only after 300ms;
  - Undo toasts that stay until dismissed;
  - `storage.persist()` with honest "Saved on this device" copy;
  - B's whole "What NOT to build" list.

## 2. Contest

**My position on the eight collisions:**

| # | Question | Position | Evidence |
|---|---|---|---|
| 1 | Brand lime | **#23D160 (I concede)** | The owner names it, and the "lime identity" stays. It measures 9.31:1 on velvet (7.60 on overlay), and velvet ink on it measures 9.31:1, so nothing needs fixing. Moving the hue 56° (141°→85°) is a rebrand, not a refinement. |
| 2 | Page color | **Velvet #140F1A (I contest)** | Accessibility is equal: lime measures 9.31 against B's 9.18, and primary text 16.92 against 16.40. The difference is hue. B's page sits at 144°, only 3° from the brand's 141°, so the lime stands out from its background by lightness alone. Velvet sits at 267°, 126° away, so the lime reads as a light *in* the room rather than more of the room. The job here is romance at night, not a dashboard. |
| 3 | Type stack | **B's stack, 55.1 KB (I concede)** | Mine measured about 220 KB against my own 150 KB cap, which I can't defend. B's is the SVG wordmark (0) + Roboto Condensed 700 (21.1) + Atkinson Next (34.0) = 55.1 KB. I'm dropping Fraunces (36.6 KB). A cinema ticket speaks in condensed sans anyway. |
| 4 | Deciding together | **Shortlist + "You pick" (I concede the swipe deck) plus ceremony** | My swipe deck asks for 10 yes/no swipes each, 20 decisions in total. B's asks for at most 3 shortlist taps plus 1 pick. A deck shows one card at a time, so nobody can compare. Zero matches is a dead end. It also needs a new gesture component to meet WCAG 2.5.1 and 2.5.7. I keep only the *moment*: "It's a date" when the pick is made. |
| 5 | Mood Dial vs genres | **Genre chips + blend chips (I concede)** | Literal labels describe their purpose (SC 2.4.6) and predict the results. B's "Rom-com" (`35,10749`, AND) already *is* a mood. Keep 2–3 blends (Rom-com, Horror-comedy, Feel-good family). The mood voice lives on in the H1: "What's the mood tonight?" |
| 6 | Share | **Link + text is the MUST. A typographic ticket PNG is a COULD** | CORS on the image hosts can't be verified. A canvas with *no third-party pixels* (titles, time, lime slice) can't be tainted. Hash URLs mean every link preview is the same generic card, and that's exactly the gap an image fills. Offer it only when `canShare({files})` is true. |
| 7 | Food images | **Squares in lists and sheets. A circle only on the ticket** | A circle crop hides 21.5% of the image (1−π/4), and lists exist for comparison. On the ticket, a 96px plate is the identity moment, and the dish name sits right beside it. |
| 8 | First visit | **Follow the OS, with a remembered toggle (I revise)** | Automatic appearance on iOS and Android already switches to dark at sunset, so our evening users get dark anyway. Forcing dark overrides people who chose light to read better (some readers with astigmatism see light-on-dark text blur, called halation). No WCAG criterion or user job justifies overriding a stated preference. Keep B's Dark / Light / Match system control. |

**Three further contests:**
- **Ceremony isn't decoration.** B keeps a crossfade and the poster morph. I'd add three moments that cost 0 KB:
  - the lime moon rising (1200ms, once per session);
  - the ticket "printing" in (650ms, a same-document View Transition);
  - "It's a date" when the pick is made.
  
  Each is a single run of opacity or transform, and all three are removed under reduced motion. A date planner that never marks the moment a date is set is just a form.
- **Uppercase on the ticket stub.** B bans all-caps except on badges. I'd allow Roboto Condensed 700 at 1rem or larger for labels of three words or fewer, such as "Admit two" or "Fri 26 Sep". That's the ticket convention. We'd write them in sentence case, uppercase them with CSS, and check with VoiceOver and NVDA that they aren't spelled out letter by letter.
- **Deciding together is a MUST, not B's #6.** It's the only two-person feature in a two-person product. The link covers B's risk of remote hand-off, and I accept B's hallway test as the acceptance gate.

## 3. Feature verdicts (B's F1–F8)

| B's feature | Verdict | Reason |
|---|---|---|
| F1 Date Ticket | **Merge** with Admit Two | B's ID-only URL (now `#/date?m=…`) plus my ticket form, a "You've been sent a date" banner, and Save. |
| F2 Cook Mode | **Merge** with Showtime | B's mechanics plus my countdown to "Press play" and offline caching of saved dates. |
| F3 On our services | **Merge** into House Rules | Exact Discover parameters and JustWatch credit, remembered along with diet. |
| F4 Explainable pairing | **Merge** with Vibe Pairing | B's `idMeal` intersection and staged fallback, plus my keyword tier and curated drink IDs. |
| F5 Night plan + calendar | **Merge** into the ticket | B's chips and VALARM feed the ticket's run of show. |
| F6 Shortlist + You pick | **Keep, modify** | It beats my swipe deck. Add the pick ceremony. Revealing overlapping shortlists is a later idea. |
| F7 Surprise us | **Keep, modify** | Lands on the ticket with B's "Change" on each row. The rows "deal" in 3 × 240ms, instantly under reduced motion. |
| F8 Avoid list | **Keep** as a SHOULD | Lives in House Rules, with B's "never allergy-safe" copy. |

## 4. Concessions

1. **Hue:** I'm retiring Zest #9FE143. Heritage #23D160 stays.
2. **Fonts:** I'm dropping Fraunces, Figtree and variable Roboto Condensed. I'd blown my own budget by 70 KB.
3. **Theme:** dark-first becomes "follow the OS", with a toggle.
4. **Deciding together:** the Match Night swipe deck is cut in favor of Shortlist + You pick.
5. **Movie step:** the Mood Dial is cut in favor of genre chips plus blend chips.
6. **Food images:** circles everywhere become squares, with the circle kept only on the ticket.
7. **Light-mode buttons:** my "lit = inverse" rule becomes B's lime fill with an edge. One primary style across both themes is easier to learn, and my rule only existed to rescue Zest's 1.58:1 on white.
8. **Header:** the velvet header in both themes becomes a header that follows the theme. The light landing uses B's lime field.
9. **Movie results:** my poster grid with a sheet becomes B's horizontal card with **Pick**.
10. **Step names:** my "Acts" become B's plain step names.

## 5. My merged proposal

**Brand:**
- Heritage #23D160 on B's 141° scale.
- Text on lime is velvet #140F1A in both themes: 9.31:1 at rest, 10.63 on hover (#40DD77), 6.06 pressed (#1AA84C).
- The lime-slice glyph is the favicon, the ticket seal and the hero moon.

**Surfaces.** The theme follows the OS.

| | Dark: "Late Show" | Light: "Matinee" |
|---|---|---|
| page / raised / overlay | #140F1A / #1E1726 / #2A2133 | #FBF7F1 / #FFFFFF / #FFFFFF + shadow |
| text primary / secondary / muted | #F6F2EC / #D2C8DC / #A89CB6 | #1A1420 / #463C50 / #685D73 |
| lime text and link | #23D160 (7.60–9.31); link #40DD77 (8.67–10.63) | #117835 (4.75–5.58) |
| focus (3px, 2px offset) | #A6F2C1 (11.80–14.46) | #0C5A27 (7.13–8.38) |
| primary button | lime fill, velvet label | lime fill with a #0C5A27 edge (the fill alone measures 1.90 ✗ against the page) |
| landing hero | velvet stage with the lime moon | lime field with a velvet wordmark (9.31) |
| ticket | paper #F7F0E4 (ink 15.92, forest lime 4.93) | velvet (inverse) |

The semantic colors keep my round-1 values, which were measured on these surfaces. The one change is success: #6AE796 in dark (12.11 on velvet, 9.27 on its tint) and #117835 in light (5.08 on its tint).

**Type, 55.1 KB in total:**
- the SVG wordmark, 0 KB;
- Roboto Condensed 700 static, 21.1 KB, for h1–h3 at 1.25rem or larger and for ticket labels at 1rem or larger;
- Atkinson Hyperlegible Next variable, 34.0 KB, for everything else.

**Shape:**
- Posters are 2:3 rectangles, the "screens".
- Food is a square with a 12px radius in lists, and a round "plate" only on the ticket.
- The ticket's perforated notches are the signature shape.
- Pills are used for actions and chips.
- Motion uses B's tokens plus my three ceremonies, all removed under reduced motion.

| # | Merged feature | Priority |
|---|---|---|
| 1 | **Date Ticket.** An ID-only hash URL; save; share the link + text; `.ics` with a VALARM reminder; "Tonight's plan" with cook-time chips | MUST |
| 2 | **Vibe Pairing.** Origin, keyword and genre tiers; `idMeal` intersection; a "Why?" line; the drink chosen on the ticket, zero-proof by default | MUST |
| 3 | **House Rules.** Streaming services and region, diet chips, a rating cap, remembered, with JustWatch credit | MUST |
| 4 | **Cook Mode.** Keeps the screen on; steps; timestamp timers; a checklist; a countdown to "Press play" | MUST |
| 5 | **Shortlist + You pick.** Pass the phone or send a link, with an "It's a date" moment | MUST |
| 6 | **Surprise us.** A quality floor, rows that deal in, and "Change" on each item | SHOULD |
| 7 | **Avoid list.** Best effort, never labelled "allergy-safe" | SHOULD |
| 8 | **Typographic ticket image.** Drawn on a canvas with no third-party pixels | COULD |
| 9 | **Afterglow.** Rate the date, add a note, anniversaries, no repeats, JSON export | COULD |
| 10 | **Match Night swipe deck** | WON'T (replaced by #5) |
