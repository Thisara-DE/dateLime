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

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;

}

console.log("query params from url",parseQuery(queryString));

