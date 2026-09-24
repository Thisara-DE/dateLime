# Moderator's fact sheet for round 2 (cross-critique)

*From the architect, after reading both proposals. These are measurements and decisions, not opinions. Argue from them.*

## Decided by the architect

- **It's a single-page app with hash routes and one `index.html`.** Examples: `#/movies?genre=35&cert=PG-13` and `#/date?m=603&r=52982&at=2026-10-02T20:00`. There's no build step.
  - **Why hash routes:** GitHub Pages can't rewrite URLs, so hash routes are what make every deep link and refresh work.
  - **Why one shell:** the 2021 site copied its header into five pages, and the copies drifted apart.
  - **Analyst B's "the URL is the state" contract still holds.** Filters and plans live in the hash query, so Back, reload and share all work. Forms stay real `<form>` elements with native radios and Enter to submit, and on submit they're serialized into the hash.
  - **Transitions:** cross-document `@view-transition` doesn't apply to an SPA. The same-document View Transitions API does, and it degrades to no animation.
- **Every third-party key and endpoint lives in one `config.js`.** Only the TMDB key remains. TheMealDB and TheCocktailDB are keyless, and the RapidAPI keys are gone.

## Measured font costs

All figures are woff2 files with a Latin subset, measured from the `@fontsource` packages.

| Font | File | Bytes |
|---|---|---|
| Roboto Condensed | variable (wght) | 51.4 KB |
| Roboto Condensed | static 700 / static 800 | 21.1 KB / 21.2 KB |
| Fraunces | wght axis only, normal / italic | 36.6 KB / 45.7 KB |
| Fraunces | opsz + wght, normal / italic | 67.3 KB / 81.5 KB |
| Figtree | variable, normal / italic | 20.2 KB / 20.9 KB |
| Atkinson Hyperlegible Next | variable, normal / italic | 34.0 KB / 37.6 KB |
| Atkinson Hyperlegible Next | static 400 / 600 | 12.1 KB / 12.7 KB |

Totals as the proposals specified them:

- **Analyst A:** Roboto Condensed variable, plus Fraunces opsz in normal and italic, plus Figtree comes to about **220 KB**, which is over A's own 150 KB budget. Using Fraunces with the wght axis only brings it to about 154 KB, or about 108 KB without the italic.
- **Analyst B:** an SVG wordmark (0 KB), plus Roboto Condensed 700 static and Atkinson Next variable, comes to about **55 KB**.

## Unverifiable from this sandbox

The network policy blocks the API hosts, so the following couldn't be checked. Treat each as a risk, not as a fact.

- **CORS headers on `image.tmdb.org` and `themealdb.com` images.** This affects Analyst A's canvas share image.
- **TheMealDB image-size suffixes** (`/small`, `/medium`, `/preview`). The client will request a suffix and fall back to the original if it fails.
- **TheMealDB's area list.** The client already treats `{"meals": null}` as an empty list, so any origin-to-area map has to degrade gracefully, for example for Korean films.

## Where the proposals collide

Resolve these on the merits, because the product owner will read this debate.

1. Should the brand lime stay the heritage **#23D160** or be retuned to citrus **#9FE143**? The owner's brief says to keep the logo and the "lime identity", and allows the wordmark's color to be refined.
2. Should the page be **velvet plum-black #140F1A** or **green-tinted near-black #0F1411**?
3. Which type stack and font budget, using the measured sizes above?
4. **Match Night**, where both people swipe and the app reveals the matches, or **Shortlist + "You pick"**, a hand-off with no swiping?
5. A **Mood Dial** or **genre chips**?
6. Should the share include a **canvas image**, or be a **link and text** only?
7. Should food and drink images be **circles** or **squares**?
8. Should the first visit be **dark regardless of the OS** or **follow the OS**? You both chose dark-first and both flagged it as open.

## Already agreed

These aren't in dispute:

- Vibe pairing with a "why" line, as a MUST.
- The date ticket with save and share by URL, as a MUST.
- A cook-along with Wake Lock and timers.
- A one-tap "surprise" path.
- A `.ics` calendar export.
- Real US certifications.
- JustWatch and TMDB attribution.
- Native form controls in fieldsets.
- 48px touch targets.
- Focus rings with an offset.
- Honest data: no invented cook times.
- Thisara's GitHub link: the owner's README and repository use **@Thisara-DE**, so we'll use that.
