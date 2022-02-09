// genre object
var genres = [
    {
    "id": 28,
    "name": "Action"
    },
    {
    "id": 12,
    "name": "Adventure"
    },
    {
    "id": 16,
    "name": "Animation"
    },
    {
    "id": 35,
    "name": "Comedy"
    },
    {
    "id": 80,
    "name": "Crime"
    },
    {
    "id": 99,
    "name": "Documentary"
    },
    {
    "id": 18,
    "name": "Drama"
    },
    {
    "id": 10751,
    "name": "Family"
    },
    {
    "id": 14,
    "name": "Fantasy"
    },
    {
    "id": 36,
    "name": "History"
    },
    {
    "id": 27,
    "name": "Horror"
    },
    {
    "id": 10402,
    "name": "Music"
    },
    {
    "id": 9648,
    "name": "Mystery"
    },
    {
    "id": 10749,
    "name": "Romance"
    },
    {
    "id": 878,
    "name": "Science Fiction"
    },
    {
    "id": 10770,
    "name": "TV Movie"
    },
    {
    "id": 53,
    "name": "Thriller"
    },
    {
    "id": 10752,
    "name": "War"
    },
    {
    "id": 37,
    "name": "Western"
    }
    ];

// certificate object
var UsCerts = [
    {
    "certification": "NR",
    "meaning": "No rating information.",
    "order": 0
    },
    {
    "certification": "G",
    "meaning": "All ages admitted. There is no content that would be objectionable to most parents. This is one of only two ratings dating back to 1968 that still exists today.",
    "order": 1
    },
    {
    "certification": "PG",
    "meaning": "Some material may not be suitable for children under 10. These films may contain some mild language, crude/suggestive humor, scary moments and/or violence. No drug content is present. There are a few exceptions to this rule. A few racial insults may also be heard.",
    "order": 2
    },
    {
    "certification": "PG-13",
    "meaning": "Some material may be inappropriate for children under 13. Films given this rating may contain sexual content, brief or partial nudity, some strong language and innuendo, humor, mature themes, political themes, terror and/or intense action violence. However, bloodshed is rarely present. This is the minimum rating at which drug content is present.",
    "order": 3
    },
    {
    "certification": "R",
    "meaning": "Under 17 requires accompanying parent or adult guardian 21 or older. The parent/guardian is required to stay with the child under 17 through the entire movie, even if the parent gives the child/teenager permission to see the film alone. These films may contain strong profanity, graphic sexuality, nudity, strong violence, horror, gore, and strong drug use. A movie rated R for profanity often has more severe or frequent language than the PG-13 rating would permit. An R-rated movie may have more blood, gore, drug use, nudity, or graphic sexuality than a PG-13 movie would admit.",
    "order": 4
    },    
    {
    "certification": "NC-17",
    "meaning": "These films contain excessive graphic violence, intense or explicit sex, depraved, abhorrent behavior, explicit drug abuse, strong language, explicit nudity, or any other elements which, at present, most parents would consider too strong and therefore off-limits for viewing by their children and teens. NC-17 does not necessarily mean obscene or pornographic in the oft-accepted or legal meaning of those words.",
    "order": 5
    }
    ]

var movieIdArr = [];

// get movie object info from genre ID
//var apiUrl = "https://api.themoviedb.org/3/discover/movie?api_key=8269c18eac650b276376132ecb76ecf7&language=en-US&sort_by=popularity.desc&certification=US&certification.lte=" + certId + "&include_adult=false&include_video=false&page=1&with_genres=" + genreId + "&with_watch_monetization_types=free"

var getMovieObject = function(certId, genreId) {
    var apiUrl = "https://api.themoviedb.org/3/discover/movie?api_key=8269c18eac650b276376132ecb76ecf7&language=en-US&sort_by=popularity.desc&certification=US&certification.lte=" + certId + "&include_adult=false&include_video=false&page=1&with_genres=" + genreId + "&with_watch_monetization_types=free";

    fetch(apiUrl)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    console.log(data);                                        
                    var certification = UsCerts[certId].certification;   
                    createMovie(data, certification);                 
                });
            } else {
                alert("Sorry we couldn't locate that information in the Database");
            }
        })
        .catch(function(error) {
            alert("Unable to connect to the Movie Database");
        });
}
getMovieObject(5, 14);

// gets the highest rating 20 movies for a given genre and certification
var createMovie = function(data, cert) {
    console.log(data.results.length);
    for(var i = 0; i < data.results.length; i++) {
    var movieTitle = data.results[i].original_title;
    var certification = cert;    
    var plot = data.results[i].overview;
    var posterPath = data.results[i].poster_path;
    var movieId = data.results[i].id;
    // ingest movie IDs into the movieIdArr
                                                         

    getMoviePoster(posterPath);

    console.log(movieTitle);
    console.log(certification);
    console.log(plot);
    console.log(certification);  
    console.log(movieId);  
    };
}

// get movie poster by poster path
// var apiURL = "http://image.tmdb.org/t/p/w300" + poster-path
var getMoviePoster = function(posterPath) {
    var apiUrl = "http://image.tmdb.org/t/p/w185" + posterPath;
    console.log(apiUrl);
}

// get movies by watch providers
// need to capture movie IDs from createMovie and save it in the movieIdArr
// var apiUrl = "https://api.themoviedb.org/3/movie/" + movieId "/watch/providers?api_key=8269c18eac650b276376132ecb76ecf7"
// create a data object to be sent to the createMovie function and it will create movie elements in the DOM

// 





