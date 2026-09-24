# Round 3 resolution: meeting in the middle

*Analyst A goes first. I measured every ratio here with `contrast.py`, and the font bytes are the moderator's measured sizes.*

Round 2 ended in a crossover: on six questions, B argued my old positions and I argued B's. I don't read that as a stalemate. It means each position had a reason good enough to convince the other side, so I haven't tried to win anything back. For each open item I've looked for the version that keeps the strongest reason from both sides. Where one side's position is simply better for two people on a couch at night, I've proposed it as it stands, whoever it came from. On one item I've moved again because of new evidence: B showed that #23D160 is Bulma's default `$green`, not a brand decision, and that changes the brand-lime question.

| # | Item | A's proposed resolution | Reason (1–2 lines) | B's response | A's final |
|---|---|---|---|---|---|
| 1 | Brand lime | **Zest #9FE143** is the brand lime: fills, the "Lime" in the wordmark, and the ticket stub. **Heritage #23D160 becomes the rind ring of the lime-slice glyph** (9.31:1 on velvet; it's a logo, so it's exempt from 1.4.11), so the old green stays inside the logo. The owner signs off with one line before build. If they veto, #23D160 drops back into the same token slots; its pairings were measured in rounds 1 and 2. | #23D160 is Bulma 0.7's default `$green`, and the owner's own words are "lime green". Zest suits the agreed velvet page (85° against 267°), and labels on it measure 11.97:1 against 9.31:1. | **ACCEPT.** One detail to pin down: in Matinee the wordmark's "Lime" is `#446F12` (5.58:1 on paper, 5.95 on white), because Zest on paper is only 1.48:1. A Zest "Lime" appears only on velvet, and the light landing page keeps the lime field with a velvet wordmark (11.97). | Agreed. On that lime field, the slice glyph also goes all-velvet (11.97:1), because its heritage rind measures only 1.29:1 against Zest. |
| 2 | Display serif | **Fraunces upright, wght axis only (36.6 KB), for H1 only.** It uses `font-display: optional` with no preload and a metric-matched serif fallback. H2s, ticket rows and labels stay in Roboto Condensed 700. Body text is Atkinson Next static 400/600 (24.8 KB). **Total: 82.5 KB** (0 + 21.1 + 36.6 + 24.8). Fraunces is the first thing cut if we ever pass 100 KB. | The H1 is the voice and the ticket is the object. A warm serif headline carries the romance, while the ticket keeps its condensed cinema type. `optional` means the H1 can never swap or delay the largest paint. | **COUNTER:** Keep Fraunces for H1 only, at 36.6 KB. Load it with `<link rel=preload>` and `font-display: swap`, give it a `size-adjust`ed serif fallback so the swap doesn't move anything, and precache it in the service worker. Keep the 100 KB ceiling, with Fraunces cut first. **Reason:** our SPA never reloads, and `optional` without preload never swaps once its window of about 100 ms has passed. First-session visitors, who are most of a portfolio site's traffic, would miss Fraunces for their whole visit. This corrects my own round-2 spec. | **ACCEPT.** B is right: with no reloads, `optional` without preload hides Fraunces for a visitor's entire first session. Preloading with `swap` over a size-adjusted fallback keeps the layout still, and the 100 KB ceiling, with Fraunces cut first, still holds. |
| 3 | Deciding together | **Match Night becomes a blind shortlist.** Each of you hearts up to 3 movies on the same results and passes the phone; the first person's hearts stay hidden. Overlaps are revealed with "It's a date". With no overlap, the second person picks from all hearted movies (6 at most), so it always ends in a pick. There's no swipe deck and no two-phone relay in v1. It's a **SHOULD**, first in line after the MUSTs. | It keeps B's point that both people vote, and mine that the normal grid lets you compare, with no new gesture to test. Random 3-of-20 hearts overlap 40% of the time (1 − C(17,3)/C(20,3)), and shared taste raises that. | **ACCEPT.** Notes: hearts are `aria-pressed` toggles with a live "2 of 3 hearts" count. They sit above the card's stretched button (item 6) and are their own tab stops. The hand-off screen takes focus and clears the first person's hearts from view, so they can't be seen or heard. The 40% figure checks out (0.4035). | Agreed. A fourth heart isn't disabled. It announces "3 of 3 hearts. Remove one to swap." |
| 4 | The fifth MUST | **Surprise us / Spin the Lime with holds**, which is B's position. | Both landing heroes already offer "Surprise us", so it has to work in v1. It's small and reuses the ticket. Deciding together follows as the first SHOULD, after B's five-couple hallway test. | **ACCEPT.** | Agreed. |
| 5 | Movie step | **One radio group**, "What's the mood tonight?", with **Any** preselected. It has 8 options, each labelled with a mood and a genre ("Swoony · Romance"). Two of them are curated AND blends: Rom-com (`35,10749`) and Scary-funny (`27,35`). Each blend must return at least 20 results in a Discover check at build time. Exact genres sit behind a `<details>`. A second "their mood" group is a COULD. | A genre in every label keeps the step literal and predictable (SC 2.4.6), and the mood word keeps the voice. One fieldset means one decision. Curated blends avoid the empty AND results an open-ended second group can produce. | **ACCEPT.** Notes: at runtime, if House Rules shrink a blend below 8 results, relax AND to OR and announce it, using the same staged fallback as the pairing step. Mark the "·" `aria-hidden` and add a visually hidden comma, so each label reads "Swoony, Romance". | Agreed. |
| 6 | Movie results | **One card component with two layouts, switched by a container query.** When the list is under 600px wide, it's a horizontal card: a 112px-wide 2:3 poster, the title, year and ★ score, a 3-line summary (**Discover already returns `overview`**), and only the badges the query guarantees. From 600px up, it's the poster grid. The title's stretched button opens the sheet, which makes the only details call (real certification, runtime, providers, trailer). **Pick** lives in the sheet. | Phones get text for comparison, and desktops get the cinematic grid. There are no per-card details calls (B's point), and phones still show the plot at a glance (mine). | **ACCEPT.** Notes: the title button gets `aria-haspopup="dialog"`, and closing the sheet returns focus to it. Pick is the sheet's sticky primary button. | Agreed. |
| 7 | Food thumbnails | **Circles for thumbnails up to 160px** (the recipe list, the ticket and the diary). The full square with a 12px radius shows in the recipe sheet and at the top of Cook-along. Images get `alt=""` next to the visible title. This is B's position. | The shape tells a plate from a screen without relying on color (in the spirit of 1.4.1). The 21.5% crop falls on background around a centred dish, and anyone inspecting the dish gets the full square. | **ACCEPT.** | Agreed. |
| 8 | First visit | **Auto by default:** dark if the OS is dark *or* if it's between 18:00 and 06:00 locally, otherwise light. A Lights up / Lights down / Match system toggle sits in the mobile header. The choice is remembered and applied before first paint. `forced-colors` and `prefers-contrast` are respected. | B's point about unequal harm holds at night: a phone left on light gets dark when the date actually happens. By day we don't override a light preference, and anyone who needs light at night pays one tap, once. | **ACCEPT.** This improves on my dark-first rule. One note: as written, the default can't be selected again once changed. Rename the third state from "Match system" to **Auto**: dark when the OS is dark, or between 18:00 and 06:00. The three states then become Lights up, Lights down and Auto. Build it as a radio group, not a button that cycles through them. | Agreed, and it's a good catch. At 390px the three radios fit in the header as 48px icon segments (sun, moon, "A"), each with a visually hidden text label. |
| 9 | Ticket in dark mode | **A raised velvet ticket** (#1E1726, with text measuring 15.62 primary, 10.81 secondary and 6.71 muted) keeps the notches and perforation, plus a **Zest stub** (velvet label, 11.97). **Paper #F7F0E4** is for Matinee (with a 1px #8A7F94 edge, 3.55 against the page), for print, and for the share image. | Paper measures 16.66:1 against the page, which makes it a white screen at night, the very glare our dark theme exists to prevent. The lime stub keeps the ticket "lit" while lime stays under 10% of the screen. | **ACCEPT.** Re-measured: text is 15.62 / 10.81 / 6.71 on `#1E1726`, and the stub label is 11.97. | Agreed. |
| 10 | Light-theme primary button | **A Zest fill with a 1.5px lime-800 #34540F edge and a velvet label (11.97).** The edge measures 8.13 on paper, 8.67 on white and 5.50 against the fill, where bare Zest on paper is only 1.48. **B's ink pill with a #BDEB74 label (13.13)** becomes the inverse variant for any button that sits on a lime surface (ink against Zest measures 11.44). Focus is #446F12 (5.58 on paper) with the 2px offset. | The primary button looks the same in both themes, and lime stays visible in Matinee, which is the identity the owner asked us to keep. The edge provides the 3:1 boundary that Zest can't provide on its own. | **ACCEPT.** Verified in every state. The edge `#34540F` measures 5.50 against the rest fill, 6.32 against hover `#BDEB74` and 4.29 against pressed `#84C92F`. The velvet label measures 11.97 / 13.75 / 9.32. The focus ring `#446F12` measures 3.78 even against Zest itself. | Agreed. I re-measured every figure, and all of them match. |

## Resulting MUST list (exactly 5)

1. **Date Ticket / Admit Two**
   - Save it, and share it as a link plus complete text (`#/date?m=&r=&d=&at=&note=`).
   - An `.ics` calendar file with a VALARM reminder.
   - A run of show with cook-time chips (30, 45, 60 or 90 minutes).
   - A "you've been sent a date" banner for the person receiving it.
   - Export and import of the diary as JSON.
   - A raised velvet ticket with a Zest stub (item 9).
2. **Vibe Pairing**
   - Matching runs origin first, then keywords, then genre, intersected by `idMeal`.
   - A staged fallback that tells the user when it relaxes.
   - A "why" line and a "Match the movie" switch.
   - The drink is chosen on the ticket and defaults to zero-proof.
3. **House Rules:** streaming services and region, a rating cap, Vegetarian and Vegan by category, and zero-proof. All of it is remembered, with JustWatch credit.
4. **Cook-along**
   - Wake Lock with a visible off switch.
   - Step cards, an "All steps" view and an ingredient checklist.
   - Timestamp timers and 64px Back and Next buttons.
   - A countdown to "Press play" and an offline cache of saved dates.
5. **Surprise us / Spin the Lime**
   - The movie comes from Discover, with House Rules, a quality floor and a random page.
   - The menu comes from the Vibe Pairing pool, not `random.php`.
   - It lands on the ticket, with hold toggles (`aria-pressed`) and one summary announcement.

## SHOULD / COULD / WON'T

- **SHOULD**
  1. **Match Night, as a blind shortlist** (item 3), only after the five-couple hallway test.
  2. **Mood labels and curated blends** on the movie step (item 5). The v1 floor is plain genre radios.
  3. **A best-effort ingredient scan** for meat and allergen avoidance, labelled exactly that way.
- **COULD**
  1. A typographic share image with no third-party pixels, offered as a separate action.
  2. **Afterglow:** ratings, notes, "one year ago tonight" and hiding watched movies.
  3. A second "their mood" group.
- **WON'T (v1)**
  1. The 10-card swipe deck.
  2. The two-phone Match relay.
  3. A share image that includes photos, because CORS on the image hosts is unverified.
  4. Invented cook times, difficulty or servings, and "allergy-safe" badges.

## B's notes

- **MUST:** I accept A's five as written. They match my round-2 list item for item.
- **SHOULD:** I accept the list and its order. The five-couple hallway test gates Match Night, and the ingredient scan is never labelled "allergy-safe".
- **COULD:** I accept it as is.
- **WON'T (v1):** I accept it, with one addition. Spell out the rest of the round-1 "What NOT to build" list that A adopted in round 2:
  - accounts or cloud sync
  - push reminders
  - LLM mood matching
  - autoplaying video or video heroes
  - infinite scroll
  - bulk-downloading TheMealDB
  - "Play on Netflix" deep links

  Writing these out keeps the architect's scope unambiguous.
- **Item 2:** if A holds `optional`, I'd rather cut Fraunces (A's 55.1 KB round-2 stack) than ship a font that most first-session visitors never see.

## A's closing note

Final lists.

- **MUST:** Date Ticket (Admit Two), Vibe Pairing, House Rules, Cook-along, and Surprise us (Spin the Lime).
- **SHOULD:** Match Night as a blind shortlist, after the hallway test; mood labels with curated blends; and a best-effort ingredient scan.
- **COULD:** a typographic share image, Afterglow, and a "their mood" group.
- **WON'T (v1):** the four listed, plus all seven of B's additions, which I accept: accounts or cloud sync, push reminders, LLM mood matching, autoplaying video, infinite scroll, bulk-downloading TheMealDB, and "Play on Netflix" links.

The only open dependency is the owner's sign-off on Zest.
