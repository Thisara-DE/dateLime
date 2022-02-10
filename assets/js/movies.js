var queryString = document.location.search;
console.log(queryString);
var userClickedGenre = '';
var goBtn = document.querySelector("#goBtn");
var genre = document.getElementsByClassName("genre");

// genre IDs are contained within obj
var id = {
    'Action': 28,

    "Comedy": 35,

    "Drama": 18,

    "Horror": 27,
};

// parse genre and rating ids into query params
function parseQuery(queryString) {
    var query = id;
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < genre.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    console.log(query);
    return query;
};

// link to movielist page
var goToNewPage = function(goBtn) {

    // turn goBtn into a hyperlink to movielist page
    var link = document.createElement("a");
    link.setAttribute("href", "http://127.0.0.1:5501/movielist.html?info=3,14");
    link.setAttribute("target", "_blank");
    goBtn.appendChild(link);
}

parseQuery();
goBtn.addEventListener("click", goToNewPage());