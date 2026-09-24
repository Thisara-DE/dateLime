// The crew: the five people who built dateLime in 2021.
import { html, render, icon } from '../ui.js';

export const title = () => 'The team';

const CREW = [
  { name: 'Cha Vue', github: 'chavue91' },
  { name: 'Ryan Harris', github: 'rharris529' },
  { name: 'Sonja Watson', github: 'Sonarie' },
  { name: 'Thisara M A', github: 'Thisara-DE' },
  { name: 'Will Yazdani', github: 'WillYazdani' },
];

const initials = (name) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export function mount(outlet) {
  render(
    outlet,
    html`<div class="page">
      <header class="page-head">
        <h1>The crew</h1>
        <p>dateLime began in 2021 as a bootcamp group project by five developers, and was remastered in 2026.</p>
      </header>
      <section class="section" aria-labelledby="starring"><h2 id="starring" class="eyebrow">Starring</h2>
        <ul class="crew">${CREW.map((c) => html`<li><span class="avatar" aria-hidden="true">${initials(c.name)}</span><div><h3>${c.name}</h3><a href="https://github.com/${c.github}" target="_blank" rel="noopener">@${c.github}<span class="visually-hidden"> (${c.name} on GitHub)</span>${icon('external')}</a></div></li>`)}</ul>
      </section>
      <section class="section" aria-labelledby="credits"><h2 id="credits" class="eyebrow">With data from</h2>
        <ul class="stack">
          <li><a href="https://www.themoviedb.org/" target="_blank" rel="noopener">TMDB</a>: movies, ratings and trailers. This product uses the TMDB API but is not endorsed or certified by TMDB.</li>
          <li><a href="https://www.justwatch.com/" target="_blank" rel="noopener">JustWatch</a>: where to stream, via TMDB.</li>
          <li><a href="https://www.themealdb.com/" target="_blank" rel="noopener">TheMealDB</a>: recipes.</li>
          <li><a href="https://www.thecocktaildb.com/" target="_blank" rel="noopener">TheCocktailDB</a>: drinks.</li>
        </ul>
      </section>
    </div>`,
  );
}
