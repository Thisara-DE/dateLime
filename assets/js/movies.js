var goBtn = document.querySelector("#goBtn");

// Genre id tags
var action = document.getElementById("28");
var drama = document.getElementById("18");
var comedy = document.getElementById("35");
var horror = document.getElementById("27");

// Rating id tags
var g = document.getElementById("1");
var pg = document.getElementById("2");
var pg13 = document.getElementById("3");
var r = document.getElementById("4");

var saveID = function() {
    var saved = document.querySelector("input:checked").value;
    localStorage.setItem("saved", saved);

    console.log(saved);
};

// link to movielist page
var goToNewPage = function() {

    var url = url("http://127.0.0.1:5501/movielist.html?info=3,14&genre=");

    // turn goBtn into a hyperlink to movielist page
    var link = document.createElement("a");
    link.setAttribute("href", url);
    URLSearchParams.append("Action", action);
    link.setAttribute("target", "_blank");
    

    
};

saveID();
goBtn.addEventListener("click", goToNewPage());
