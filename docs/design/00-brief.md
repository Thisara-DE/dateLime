# dateLime redesign: analyst brief

This is the shared brief for the two design analysts. It is the only context you
get, so it is written to stand on its own.

## 1. The product

**dateLime** is a 2021 bootcamp group project (five contributors) and is live at
`https://thisara-de.github.io/dateLime/`. It's a planner for a **date night at
home**. You pick a movie, then a recipe to cook, and you get a "date package"
that shows both.

The original flow, one HTML page per step:

1. `index.html` is the landing page, with a giant "dateLime" wordmark, the tagline
   "Your Guide to Date Night Planning." and a "Start Your Date Here!" button.
2. `movie.html` has you choose a genre (Action, Drama, Comedy or Horror) and a
   rating (G, PG, PG-13 or R), then click "Let's Go!".
3. `movielist.html` shows up to 20 TMDB movies as cards (poster, title, rating,
   streaming providers, plot), each with a "Select Movie" button.
4. `recipelist.html` shows 20 Tasty (RapidAPI) recipes as cards with a "Select
   Recipe" button.
5. `date-ready.html` ("Your Date!") shows the chosen movie card and recipe card,
   plus a "Save Your Date!" button.
6. `our-team.html` lists the five contributors with links to their GitHub
   profiles.

The README also promises two things that were never built: **recipes matched to
the movie's vibe** and **filtering recipes by dietary preference**. The original
wireframes (`assets/images/wireframe/*.pdf`, which the Read tool can open) show
more that never shipped: a **"your dates"** nav button for saved dates, a row
of recipe **filter pills**, and a working **save** button.

## 2. Non-negotiables from the product owner

- **Keep the logo.** The logo is the **"dateLime" wordmark**: lowercase "date"
  followed by capital-L "Lime", set in **Roboto Condensed** at a heavy weight.
  The brand color is **lime green** (the original used `#23d160`). You may
  refine how the wordmark is placed, sized and colored, and you may add a
  supporting mark such as a lime-slice glyph. The word, the typeface and the
  lime identity stay.
- **Keep the basic idea.** It remains a date-night-at-home planner that pairs a
  movie with a recipe and ends in a shareable date package. Features should
  extend that idea, not replace it.

## 3. What is there today (design)

- The screenshot is at `assets/images/Screenshot-landing page.png`.
- It uses Bulma 0.7.4 from a CDN, with Roboto Condensed for **all** text.
- Every page is a flat `#23d160` background with white text. **White on
  `#23d160` is 2.03:1**, which fails WCAG AA for every text size, and 3:1 is the
  bar even for large text. Dark text `#363636` on that lime gets 5.96:1.
- The cards are Bulma defaults, with a 128×128 poster crammed next to the text.
  Card heights are fixed (375/535px) with `overflow:hidden`, so long plots are
  cut off with no way to read the rest.
- There is no mobile navigation, no dark theme, no focus styles, no empty,
  loading or error states, and failures show as `alert()` pop-ups.

## 4. What is broken today (engineering audit summary)

You don't have to fix any of this. It's here so your design doesn't rely on
behavior that doesn't exist.

- **The core flow is broken in several places.**
  - The "Let's Go!" control is a `<div>`, so keyboard users can't activate it.
    Leaving a radio group unpicked throws a `TypeError`.
  - The results page always adds 20 unrelated Fantasy movies, from a leftover
    `getMovieObject(3, 14)` debug call.
  - A click listener sits on the whole `document`, so clicking *anywhere* on the
    movie or recipe list navigates away and stores a blank or `"undefined"`
    selection.
  - "Save Your Date!" saves nothing. It links to the results page without
    parameters, and that page crashes to blank.
  - On the recipe cards the title ends up *below* the instructions because the
    node is appended twice. Some Tasty results have no `instructions`, which
    throws and stops the rest of the list from rendering.
  - The date page shows the recipe title wrapped in literal `"quotes"`
    (`JSON.stringify`). It also re-fetches 20 recipes it never uses.
- **Data is wrong.**
  - The rating filter is sent with the wrong parameter name
    (`certification=US`) and with a number where TMDB expects `PG-13`, so it
    does nothing.
  - Each card shows the rating the user *picked* rather than the movie's real
    rating.
  - Titles use `original_title`, so non-English titles appear in their original
    script.
- **Security.** Three API keys are committed in five files. Two of them are
  billable RapidAPI keys, and one is spent on every landing-page view by a
  leftover debug `fetch`. Third-party HTML goes into `innerHTML`, which is an
  XSS risk.
- **Performance.** Each results page fires 20 to 40 extra requests for watch
  providers. jQuery and jQuery UI are loaded on the landing page but never used,
  and both are old versions with known vulnerabilities.
- **HTML.** Anchors are nested, there are stray closing tags and duplicate IDs,
  and `our-team.html` is missing `</body></html>`. No image has `alt` text. Every
  page has the same `<title>`.

## 5. Constraints for the modernization

The architect will build to these constraints. Design and propose features that
fit them. If a proposal only works by breaking a constraint, say so and argue
for it explicitly.

- **Hosting.** It's a static site on GitHub Pages. There is **no backend**, no
  user accounts and no server-side storage. Persistence is `localStorage` or
  IndexedDB on the user's device. Anything "social" has to work through
  **shareable URLs**, which can encode state, or on the same device.
- **No build step is required for deploy.** The app uses native ES modules,
  modern CSS (custom properties, nesting, container queries, `:has()`) and
  modern web platform APIs, with graceful fallbacks.
- **Data sources.** Only free APIs, and no new secret keys. Here is what each
  one can and can't do:
  - **TMDB v3** (the existing key stays, centralized in one config file):
    - *Discover* filters on genre, US certification (G/PG/PG-13/R, using an
      "at most" filter), release year, runtime range, minimum vote average,
      original language, keywords, and "streaming on provider X in region".
    - *Movie details* give runtime, tagline, genres, release dates with the real
      US certification, videos (YouTube trailer keys), credits, and
      recommendations or similar titles.
    - *Watch providers* give each provider's name and logo per region (this
      requires a "Data by JustWatch" attribution).
    - It serves poster and backdrop images at several sizes.
    - An attribution to TMDB is required.
  - **TheMealDB** (free, keyless; it *replaces* Tasty):
    - Filter by category (Beef, Chicken, Dessert, Lamb, Miscellaneous, Pasta,
      Pork, Seafood, Side, Starter, Vegan, Vegetarian, Breakfast, Goat), by area
      or cuisine (about 28, such as Italian, Mexican, Japanese, Indian, French,
      Thai or American), or by main ingredient.
    - A lookup returns the full recipe: instructions as free text, up to 20
      ingredient/measure pairs, a thumbnail, a YouTube link, a source link and
      tags.
    - There is also a random endpoint.
    - It has **no cook time, difficulty, nutrition or servings data.**
  - **TheCocktailDB** (free, keyless, same provider):
    - Drinks by ingredient (for example lime), alcoholic or non-alcoholic,
      category and glass.
    - A lookup returns ingredients and instructions, and there is a random
      endpoint.
- **Browser APIs you can design around.** Web Share, Clipboard, View
  Transitions, Screen Wake Lock, `<dialog>` and Popover, the Service Worker
  (offline/installable), `.ics` calendar files generated in the browser, and
  `prefers-color-scheme` and `prefers-reduced-motion`.
- **Fonts.** Choose from Google Fonts (they will be self-hosted). Roboto
  Condensed stays for the wordmark. You can pick other typefaces for UI and body
  text.
- **Quality bar.** WCAG 2.2 AA (contrast, keyboard access, focus, reduced
  motion), a mobile-first layout (people plan these on their phones, often on
  the couch), and fast on mid-range phones.

## 6. Tools

A WCAG contrast checker is at
`/tmp/claude-0/-home-user-dateLime/0979d68c-d4e8-5202-8b78-6e3d288590b5/scratchpad/contrast.py`.

```
python3 <that path> '#FG' '#BG' ['#FG2' '#BG2' ...]
```

Every color pairing you specify for text or UI **must** have a measured ratio,
not an estimate.

## 7. Ground rules

- Only write the markdown file(s) you are asked to write under `docs/design/`.
  Don't change any other file, don't create code, and don't run git commands.
- Be concrete. Give hex values, font names and weights, pixel and rem values,
  component states, and actual screen layouts. "Modern and clean" isn't a
  decision.
- Be honest about trade-offs. The other analyst will read your work and
  challenge it.
