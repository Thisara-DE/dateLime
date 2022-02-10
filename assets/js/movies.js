var queryString = document.location.search;

// Genre button choices
var action = document.getElementById("action");
var drama = document.getElementById("drama");
var comedy = document.getElementById("comedy");
var horror = document.getElementById("horror");

// Rating button choices 
var g = document.getElementById("G");
var pg = document.getElementById("PG");
var pg13 = document.getElementById("PG-13");
var r = document.getElementById("R");

var userClickedGenere = '';

var genres = {
    'Action': 28,
}

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;

}

var checkboxes = document.getElementsByClassName('checkbox');

for(var i = 0; i < checkboxes.length; i++){
    checkboxes[i].addEventListener('click', function(){

         userClickedGenere = this.value;
         console.log(userClickedGenere)
    })
}

document.getElementById('gobtn').addEventListener('click', function(){
    console.log(genres.userClickedGenere)
})