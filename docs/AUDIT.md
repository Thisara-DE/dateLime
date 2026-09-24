# Audit of the original (2022) dateLime codebase

**Scope:** every file at commit `837bd30`: 6 HTML pages, 6 stylesheets and
6 scripts.

**Method:**
- A line-by-line read of every file.
- Reproduction of the runtime behavior in headless Chromium. Every TMDB, Tasty
  and RapidAPI call was intercepted and answered with realistic fixtures, so
  the results don't depend on the old API keys still working.

Items marked **(reproduced)** were observed at runtime. The quoted outputs come
from that run.

## 1. Critical: the main flow breaks

| # | Defect | Where | Evidence |
|---|---|---|---|
| 1 | Keyboard users can't continue past step 1, because "Let's Go!" is a `<div class="button">` with no tabindex, role or key handler. | `movie.html:108` | (reproduced) `DIV tabIndex=-1`. Fifteen Tab presses never reach it. |
| 2 | Clicking "Let's Go!" without choosing both a genre and a rating throws, and nothing happens. | `movies.js:15-17` | (reproduced) `TypeError: Cannot read properties of null (reading 'id')` |
| 3 | A leftover debug call `getMovieObject(3, 14)` adds 20 PG-13 **Fantasy** movies to *every* result list. | `movielist.js:163` | (reproduced) PG + Action rendered **40** cards and requested genres `28` and `14`. |
| 4 | `document.addEventListener("click", ...)` means a click **anywhere** (the heading, a poster, empty space) navigates to the next step and stores the clicked element's `id`, which is usually `""` or `"undefined"`. | `movielist.js:299`, `recipelist.js:127` | (reproduced) Clicking the "Your Movies" heading went to `/recipelist.html` with `movieId = ""`. |
| 5 | "Save Your Date!" saves nothing. It links to `movielist.html` without a query string, and that page then crashes to an empty list. | `date-ready.html:93`, `movielist.js:155` | (reproduced) `TypeError: Cannot read properties of undefined (reading 'split')` and 0 cards. |
| 6 | Tasty "compilation" results have no `instructions`, and `.map` on `undefined` stops the loop, so later recipes never render. | `recipelist.js:39` | (reproduced) 2 of 4 fixture recipes rendered. `TypeError ... (reading 'map')` |
| 7 | Opening the date page directly, or on a fresh device, crashes. `localStorage.getItem("recipeName")` is `null` and `null.replace(...)` throws. The movie fetch never checks `response.ok`. | `date-ready.js:154`, `date-ready.js:7` | (reproduced) `Cannot read properties of null (reading 'replace')` |

## 2. Wrong data shown to users

| # | Defect | Where |
|---|---|---|
| 8 | **The rating filter does nothing.** It sends `certification=US&certification.lte=2`. TMDB expects `certification_country=US&certification.lte=PG`, and ignores the certification filter without a country. (reproduced: the params above were sent.) | `movielist.js:129` |
| 9 | Each movie card's subtitle is the rating the **user picked**, not the movie's real certification. | `movielist.js:140, 222` |
| 10 | `original_title` is shown instead of `title`, so foreign films display in their original script (for example 千と千尋の神隠し). (reproduced) | `movielist.js:168` |
| 11 | `with_watch_monetization_types=free` is sent without `watch_region`, so it's ignored. The "free" intent also conflicts with the `flatrate` (subscription) providers that are displayed. | `movielist.js:133` |
| 12 | The recipes have nothing to do with the chosen movie. It is always `tags=under_30_minutes`. The README's "matched to your movie's vibe" and "dietary filters" features don't exist. | `recipelist.js:5` |
| 13 | The date page shows the recipe title in literal quotes (`"Tacos"`) because of `JSON.stringify`. (reproduced) | `date-ready.js:196` |
| 14 | On recipe cards the title renders **below** the instructions, because the title node is appended twice and the second append moves it. (reproduced) | `recipelist.js:90, 106` |
| 15 | The variable called `recipeUrl` actually holds the **thumbnail** URL, so no link to the real recipe is ever kept. | `recipelist.js:38, 103` |
| 16 | A missing poster produces `src=".../w185null"`, a broken image. (reproduced: 8 of 40) | `movielist.js:172` |

## 3. Security and privacy

| # | Defect | Where |
|---|---|---|
| 17 | **Three API keys are committed in five files.** Two are **billable RapidAPI keys**. They are in the git history permanently and **should be revoked**. | `script.js`, `dummy.js`, `recipelist.js`, `date-ready.js`, `movielist.js` |
| 18 | The landing page runs a leftover debug `fetch` to the "IMDB alternative" RapidAPI (searching for "korean" movies, page 10) on **every visit**, spending the key's quota and logging the result to the console. (reproduced) | `script.js` |
| 19 | Third-party recipe text goes into `innerHTML`, which is a stored-XSS vector if the API ever returns markup. (reproduced: an injected `<b>` rendered as markup) | `recipelist.js:88` |
| 20 | jQuery 3.4.1 (CVE-2020-11022/11023) and jQuery UI 1.12.1 (CVE-2021-41182/3/4) are loaded on the landing page and **never used**. | `index.html:53-55` |
| 21 | Images load over `http://image.tmdb.org`, which is mixed content on the HTTPS GitHub Pages site. | `movielist.js:172`, `date-ready.js:25` |

## 4. Performance

| # | Defect | Where |
|---|---|---|
| 22 | There's one watch-provider request per movie card: **40 requests** per results page with the debug call, or 20 without it. Each failure raises a separate `alert()`, and there's no `.catch`. (reproduced) | `movielist.js:182, 266` |
| 23 | The date page fetches providers **twice** for the one movie and never displays the result. (reproduced) | `date-ready.js:11, 33, 112` |
| 24 | The date page downloads 20 Tasty recipes just to trigger a function that ignores them. That's a billable call on every view. (reproduced) | `date-ready.js:127-149` |
| 25 | Three unused libraries (jQuery, jQuery UI, touch-punch) and all of Bulma are render-blocking CDN requests. | all pages |

## 5. Accessibility (WCAG 2.2)

| # | Defect |
|---|---|
| 26 | **White text on `#23d160` is 2.03:1**, which fails AA for all text sizes. The 3:1 large-text minimum isn't met even by the 150px hero title. |
| 27 | No image has `alt` text. (reproduced: 40 of 40 on the results page) |
| 28 | The radio groups have no `<fieldset>` or `<legend>`, and the labels carry no text beyond the choice ("G", "R"). |
| 29 | There's no visible focus style, and no skip link or `<main>` landmark. There are several `<h1>` elements per page, and every page has the same `<title>dateLime</title>`. |
| 30 | Truncated content: cards have fixed heights (192/375/535px) with `overflow:hidden`, so plots and instructions are cut off with no way to read the rest. |
| 31 | Errors are reported with blocking `alert()` dialogs, up to 40 in a row. |

## 6. HTML and CSS correctness

| # | Defect |
|---|---|
| 32 | Anchors are nested (`<a><h1><a>dateLime</a></h1></a>`) on four pages. That's invalid, and the parser closes the outer link early. |
| 33 | There are stray closing tags: an extra `</div>` in every navbar and an orphan `</form>` at `movie.html:44`. `our-team.html` is missing `</body></html>`. |
| 34 | Duplicate IDs: `sub2` appears three times on `movie.html`, and every generated card repeats `card-container`, `image-container`, `card-image`, `content` and `title-sec`. The provider line and the select button share the movie ID. (reproduced: 47 duplicated IDs on the results page) |
| 35 | Both radio groups use `name="answer"` and keep their values in numeric `id`s (`id="28"`, `id="1"`) instead of `value`. It only works because the groups happen to be in different forms. |
| 36 | `.subHeader` and `.subheader` are used interchangeably, but class names are case-sensitive, so half the rules never apply. |
| 37 | `recipelist.css` contains its whole rule set twice. `movielist.html` loads `our-team.css`. Every stylesheet repeats the same `* { font-family }` and `body` rules. |
| 38 | `<br>` elements are appended inside the flex `.columns` grid, which breaks the grid rhythm. (reproduced) |
| 39 | The navbar markup is copied five times, and each copy differs slightly. There's no mobile burger menu. |

## 7. Maintainability

| # | Defect |
|---|---|
| 40 | `dummy.js` isn't referenced anywhere. If it were loaded it would throw `ReferenceError: PG is not defined`. |
| 41 | The `genres` table is duplicated in two files, and a 200-line certification glossary sits in `movielist.js` although only its index is used. |
| 42 | The card-building code is copied in three files, each about 60 lines of `createElement`. |
| 43 | There are implicit globals (`movieId = ...`, `recipeName = ...`), `classList = "..."` assignments, `console.log` calls left in production, and no tests, linting or CI. |
| 44 | Thisara's GitHub link on the team page (`ThisaraMallawaArachchige`) doesn't match the README (`@Thisara-DE`). |

## What the modernization changes

Every item above is resolved in the rewrite. [`docs/design/`](design/) records
how the new design and feature set were chosen, and [`README.md`](../README.md)
describes the new architecture and test suite.
