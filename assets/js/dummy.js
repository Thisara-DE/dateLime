// fetch("https://movie-database-imdb-alternative.p.rapidapi.com/?r=json&i=tt4154796", {
// 	"method": "GET",
// 	"headers": {
// 		"x-rapidapi-host": "movie-database-imdb-alternative.p.rapidapi.com",
// 		"x-rapidapi-key": "252f4cdf93mshd92d57684acca16p10facbjsnf00f4351c63f"
// 	}
// })
// .then(function(response) {
// 	console.log(response);
//     response.json().then(function(data) {
//         console.log(data);
//     })
// })
// .catch(err => {
// 	console.error(err);
// });



// convert genre name into an ID
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
	


	// get movie info from genre ID
	//var apiUrl = "https://api.themoviedb.org/3/discover/movie?api_key=8269c18eac650b276376132ecb76ecf7&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=" + genreID + "&with_watch_monetization_types=flatrate";
	// movie title
	"https://api.themoviedb.org/3/discover/movie?api_key=8269c18eac650b276376132ecb76ecf7&language=en-US&sort_by=popularity.desc&certification=US&certification.lte=" + PG + "&include_adult=false&include_video=false&page=1&with_genres=" + 14 + "&with_watch_monetization_types=free"


	// get movie poster by poster path
	// var apiURL = "http://image.tmdb.org/t/p/w300" + poster-path





