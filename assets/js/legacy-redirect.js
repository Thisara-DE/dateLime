// Forwards the 2021 multi-page URLs (movie.html, movielist.html?info=2,28, ...) to the
// single-page app's hash routes. It runs before the meta refresh fires.
(() => {
  const target = document.currentScript?.dataset.target || '#/';
  const certs = ['', 'G', 'PG', 'PG-13', 'R']; // the old app used 1-4 for G..R
  let hash = target;
  // movielist.html?info=<certIndex>,<genreId> carried the old filter choices.
  const info = new URLSearchParams(location.search).get('info');
  if (target === '#/movies' && info) {
    const [cert, genre] = info.split(',');
    const params = new URLSearchParams();
    if (/^\d+$/.test(genre ?? '')) params.set('genre', genre);
    if (certs[Number(cert)]) params.set('cert', certs[Number(cert)]);
    if (params.size) hash += `?${params}`;
  }
  location.replace(`./${hash}`);
})();
