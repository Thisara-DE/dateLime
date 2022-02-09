fetch("https://movie-database-imdb-alternative.p.rapidapi.com/?r=json&i=tt4154796", {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "movie-database-imdb-alternative.p.rapidapi.com",
		"x-rapidapi-key": "252f4cdf93mshd92d57684acca16p10facbjsnf00f4351c63f"
	}
})
.then(function(response) {
	console.log(response);
    response.json().then(function(data) {
        console.log(data);
		
    });
})
.catch(err => {
	console.error(err);
});
