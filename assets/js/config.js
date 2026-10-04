// Every third-party endpoint and key lives here, and nowhere else.
//
// About the TMDB key: dateLime is a static site with no server, so any key it uses is
// visible in the browser. TMDB v3 read keys are rate-limited, read-only and free. To use
// your own, create one at https://www.themoviedb.org/settings/api and paste it below.
// TheMealDB and TheCocktailDB use their public test key "1", which needs no sign-up.

export const TMDB = {
  apiKey: '8269c18eac650b276376132ecb76ecf7',
  baseUrl: 'https://api.themoviedb.org/3',
  imageBase: 'https://image.tmdb.org/t/p',
  language: 'en-US',
  region: 'US',
};

export const MEALDB = {
  baseUrl: 'https://www.themealdb.com/api/json/v1/1',
};

export const COCKTAILDB = {
  baseUrl: 'https://www.thecocktaildb.com/api/json/v1/1',
};

// Accounts (optional sign-in) use Firebase Authentication and Cloud Firestore. Leave this
// null and dateLime runs without accounts, as before. To switch accounts on, create a
// Firebase project, add a web app, and paste its config object here. The web config is not
// a secret: what protects each user's data is firestore.rules (see the README).
export const FIREBASE = null;

// The Firebase JS SDK version, loaded from Google's CDN only when someone signs in.
export const FIREBASE_SDK = 'https://www.gstatic.com/firebasejs/12.19.0';
