var movieSectionEl = document.querySelector("#movie-section");

// genre object
var genres = [
  {
    id: 28,
    name: "Action",
  },
  {
    id: 12,
    name: "Adventure",
  },
  {
    id: 16,
    name: "Animation",
  },
  {
    id: 35,
    name: "Comedy",
  },
  {
    id: 80,
    name: "Crime",
  },
  {
    id: 99,
    name: "Documentary",
  },
  {
    id: 18,
    name: "Drama",
  },
  {
    id: 10751,
    name: "Family",
  },
  {
    id: 14,
    name: "Fantasy",
  },
  {
    id: 36,
    name: "History",
  },
  {
    id: 27,
    name: "Horror",
  },
  {
    id: 10402,
    name: "Music",
  },
  {
    id: 9648,
    name: "Mystery",
  },
  {
    id: 10749,
    name: "Romance",
  },
  {
    id: 878,
    name: "Science Fiction",
  },
  {
    id: 10770,
    name: "TV Movie",
  },
  {
    id: 53,
    name: "Thriller",
  },
  {
    id: 10752,
    name: "War",
  },
  {
    id: 37,
    name: "Western",
  },
];

// certificate object
var UsCerts = [
  {
    certification: "NR",
    meaning: "No rating information.",
    order: 0,
  },
  {
    certification: "G",
    meaning:
      "All ages admitted. There is no content that would be objectionable to most parents. This is one of only two ratings dating back to 1968 that still exists today.",
    order: 1,
  },
  {
    certification: "PG",
    meaning:
      "Some material may not be suitable for children under 10. These films may contain some mild language, crude/suggestive humor, scary moments and/or violence. No drug content is present. There are a few exceptions to this rule. A few racial insults may also be heard.",
    order: 2,
  },
  {
    certification: "PG-13",
    meaning:
      "Some material may be inappropriate for children under 13. Films given this rating may contain sexual content, brief or partial nudity, some strong language and innuendo, humor, mature themes, political themes, terror and/or intense action violence. However, bloodshed is rarely present. This is the minimum rating at which drug content is present.",
    order: 3,
  },
  {
    certification: "R",
    meaning:
      "Under 17 requires accompanying parent or adult guardian 21 or older. The parent/guardian is required to stay with the child under 17 through the entire movie, even if the parent gives the child/teenager permission to see the film alone. These films may contain strong profanity, graphic sexuality, nudity, strong violence, horror, gore, and strong drug use. A movie rated R for profanity often has more severe or frequent language than the PG-13 rating would permit. An R-rated movie may have more blood, gore, drug use, nudity, or graphic sexuality than a PG-13 movie would admit.",
    order: 4,
  },
  {
    certification: "NC-17",
    meaning:
      "These films contain excessive graphic violence, intense or explicit sex, depraved, abhorrent behavior, explicit drug abuse, strong language, explicit nudity, or any other elements which, at present, most parents would consider too strong and therefore off-limits for viewing by their children and teens. NC-17 does not necessarily mean obscene or pornographic in the oft-accepted or legal meaning of those words.",
    order: 5,
  },
];

var movieIdArr = [];




// get movie object info from genre ID
//var apiUrl = "https://api.themoviedb.org/3/discover/movie?api_key=8269c18eac650b276376132ecb76ecf7&language=en-US&sort_by=popularity.desc&certification=US&certification.lte=" + certId + "&include_adult=false&include_video=false&page=1&with_genres=" + genreId + "&with_watch_monetization_types=free"

var getMovieObject = function (certId, genreId) {
  var apiUrl =
    "https://api.themoviedb.org/3/discover/movie?api_key=8269c18eac650b276376132ecb76ecf7&language=en-US&sort_by=popularity.desc&certification=US&certification.lte=" +
    certId +
    "&include_adult=false&include_video=false&page=1&with_genres=" +
    genreId +
    "&with_watch_monetization_types=free";

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          console.log(data);
          var certification = UsCerts[certId].certification;
          createMovie(data, certification);
        });
      } else {
        alert("Sorry we couldn't locate that information in the Database");
      }
    })
    .catch(function (error) {
      alert("Unable to connect to the Movie Database");
    });
};

// getting the certId and genreId from the url
var getCertGenreIds = function(){
    var queryString = document.location.search;
    var certAndGenre = queryString.split("=")[1];
    var cert = certAndGenre.split(",")[0];
    var genre = certAndGenre.split(",")[1];
    // console.log(cert,genre);
    getMovieObject(cert,genre);
}
getCertGenreIds();

// getMovieObject(3, 14);

// gets the highest rating 20 movies for a given genre and certification
var createMovie = function (data, cert) {
  for (var i = 0; i < data.results.length; i++) {
    var movieTitle = data.results[i].original_title;
    var certification = cert;
    var plot = data.results[i].overview;
    var posterPath = data.results[i].poster_path;
    var posterUrl = "http://image.tmdb.org/t/p/w185" + posterPath;
    var movieId = data.results[i].id;
    
    // ingest movieId into the movieIdArr
    movieIdArr.push(movieId);    

    // Creating DOM elements
    var providerEl = document.createElement("strong");
    providerEl.className = "providerList";
    providerEl.setAttribute("id", movieId)
    getWatchProviders(movieId);

    var movieBodyEl = document.createElement("div");
    movieBodyEl.classList = "column is-half";

    var cardContainerEl = document.createElement("div");
    cardContainerEl.className = "card";
    cardContainerEl.setAttribute("id", "card-container");

    var cardEl = document.createElement("div");
    cardEl.className = "card-image";
    cardEl.setAttribute("id", "image-container");

    //creating the poster
    var ImgContEl = document.createElement("figure");
    ImgContEl.classList = "image is-128x128";
    ImgContEl.setAttribute("id", "card-image");

    var posterEl = document.createElement("img");
    posterEl.setAttribute("src", posterUrl);

    ImgContEl.appendChild(posterEl);
    cardEl.appendChild(ImgContEl);
    cardContainerEl.appendChild(cardEl);

    // creating title and subtitle
    var cardContentEl = document.createElement("div");
    cardContentEl.setAttribute("id", "content");
    cardContentEl.className = "card-content";

    var cardTitleContEl = document.createElement("div");
    cardTitleContEl.className = "media-content";
    cardTitleContEl.setAttribute("id", "title-sec");

    var titleEl = document.createElement("p");
    titleEl.classList = "title is-4";
    titleEl.textContent = movieTitle;

    var SubTitleEl = document.createElement("p");
    SubTitleEl.classList = "subtitle is-6";
    SubTitleEl.textContent = certification;

    
    cardTitleContEl.appendChild(titleEl);
    cardTitleContEl.appendChild(SubTitleEl);
   

    // creating plot
    var plotEl = document.createElement("div");
    plotEl.className = "content";
    plotEl.textContent = plot;

    // creating select button
    var selectMovieBtnEl = document.createElement("button");
    selectMovieBtnEl.textContent = "Select Movie";
    selectMovieBtnEl.setAttribute("id", movieId);
    selectMovieBtnEl.classList = "button is-success is-rounded";

    cardContentEl.appendChild(cardTitleContEl);
    cardContentEl.appendChild(providerEl);
    cardContentEl.appendChild(plotEl);
    cardContentEl.appendChild(selectMovieBtnEl);

    cardContainerEl.appendChild(cardContentEl);
    movieBodyEl.appendChild(cardContainerEl);
    movieSectionEl.appendChild(movieBodyEl);
    // var newLineEl = document.createElement("br");
    // movieSectionEl.appendChild(newLineEl);
  }
  // console.log(movieIdArr);
};

// get movies by watch providers
// need to capture movie IDs from createMovie and save it in the movieIdArr
// var apiUrl = "https://api.themoviedb.org/3/movie/" + movieId + "/watch/providers?api_key=8269c18eac650b276376132ecb76ecf7"
// create a data object to be sent to the createMovie function and it will create movie elements in the DOM

var getWatchProviders = function (movieId) {
  var apiUrl =
    "https://api.themoviedb.org/3/movie/" +
    movieId +
    "/watch/providers?api_key=8269c18eac650b276376132ecb76ecf7";

  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        // console.log(data.results.US.flatrate);
        var providers = data.results?.US?.flatrate || [];
        var providerList = [];
        for (var i = 0; i < providers.length; i++) {
          var provider = providers[i].provider_name;
          providerList.push(provider);
        //   console.log("Provider is:", provider);
        }
        document.getElementById(movieId).textContent = providerList.join("    -     ");
      });
    } else {
      alert("Sorry, we couldn't find providers for the movies");
    }
  });
};

// save the movieId in localStorage
var saveAndGoToRecipe = function(event) {
    movieId = event.target.id;
    // console.log("selected movie ID is ",movieId);

    localStorage.setItem("movieId", movieId);

    document.location.replace("./recipelist.html")

}

var selectMovie = document.addEventListener("click", saveAndGoToRecipe);

