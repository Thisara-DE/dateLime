var movieSectionEl = document.querySelector("#movie-section");
var getMovie = function() {
	var movieId = localStorage.getItem("movieId");
	var apiUrl = "https://api.themoviedb.org/3/movie/" + movieId + "?api_key=8269c18eac650b276376132ecb76ecf7&language=en-US";

	fetch(apiUrl)
	.then(function(response) {		
		response.json().then(function(data) {
			console.log(data);
			createMovie(data, movieId);
			getWatchProviders(movieId);
			
		});
	})
	.catch(err => {
		console.error(err);
	});
}
getMovie(585083);

var createMovie = function(data, movieId) {
	var title = data.title;
	var plot = data.overview;
	var posterPath = data.poster_path;
    var posterUrl = "http://image.tmdb.org/t/p/w185" + posterPath;
	console.log(posterUrl);
	

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
    titleEl.textContent = title;

    // var SubTitleEl = document.createElement("p");
    // SubTitleEl.classList = "subtitle is-6";
    // SubTitleEl.textContent = certification;

    
    cardTitleContEl.appendChild(titleEl);
    // cardTitleContEl.appendChild(SubTitleEl);
   

    // creating plot
    var plotEl = document.createElement("div");
    plotEl.className = "content";
    plotEl.textContent = plot;

	cardContentEl.appendChild(cardTitleContEl);
    cardContentEl.appendChild(providerEl);
    cardContentEl.appendChild(plotEl);    

	cardContainerEl.appendChild(cardContentEl);
    movieBodyEl.appendChild(cardContainerEl);
    movieSectionEl.appendChild(movieBodyEl);

}

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
		    console.log("Provider is:", provider);
		  }
		//   document.getElementById(movieId).textContent = providerList.join("    -     ");
		});
	  } else {
		alert("Sorry, we couldn't find providers for the movies");
	  }
	});
  };

  

  // Get recipe from local
  var recipeSectionEl = document.querySelector("#movie-section");

var getRecipeObject = function () {
  
	fetch("https://tasty.p.rapidapi.com/recipes/list?from=0&size=20&tags=under_30_minutes", {
		"method": "GET",
		"headers": {
			"x-rapidapi-host": "tasty.p.rapidapi.com",
			"x-rapidapi-key": "c932fbbb24mshb43abde3fc25cffp11cacajsnae76ac16d611"
		}
	})
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          console.log(data);
    
          createRecipe(data);
        });
      } else {
        alert("Information not found");
      }
    })
    .catch(function (error) {
      alert("Error");
    });
};
getRecipeObject();

// gets recipe from local
var recipeName = localStorage.getItem(recipeName)
var createRecipe = function (data, recipeName) {
  console.log("createRecipe is being run");

// Dom elements

    var recipeBodyEl = document.createElement("div");
    recipeBodyEl.classList = "column is-half";

    var cardContainerEl = document.createElement("div");
    cardContainerEl.className = "card";
    cardContainerEl.setAttribute("id", "card-container");

    var cardEl = document.createElement("div");
    cardEl.className = "card-image";
    cardEl.setAttribute("id", "image-container");

//Thumbnail
    var ImgContEl = document.createElement("figure");
    ImgContEl.classList = "image is-128x128";
    ImgContEl.setAttribute("id", "card-image");

    var posterEl = document.createElement("img");
    posterEl.setAttribute("src", thumbnailUrl);

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
    titleEl.textContent = recipeName;

    cardTitleContEl.appendChild(titleEl);

   

// creating instructions
    var instructionsEl = document.createElement("div");
    instructionsEl.className = "content";
    instructionsEl.textContent = instructions;

    cardContentEl.appendChild(cardTitleContEl);
    cardContentEl.appendChild(instructionsEl);

    cardContainerEl.appendChild(cardContentEl);
    recipeBodyEl.appendChild(cardContainerEl);
    recipeSectionEl.appendChild(recipeBodyEl);
    var newLineEl = document.createElement("br");
    recipeSectionEl.appendChild(newLineEl);
	};