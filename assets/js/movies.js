var goBtn = document.querySelector("#save-btn");

var genreClass = document.getElementsByClassName("genre");

// link to movielist page
var goToNewPage = function(certId, genreId) {

    var url = "./movielist.html?info=" + certId + "," + genreId

    window.location.href = url;
};

goBtn.addEventListener("click", function(){

    var certInput = document.querySelector(".rating:checked").id;

    var genreInput = document.querySelector(".genre:checked").id;

    console.log("Let's go Clicked", certInput, genreInput);

    goToNewPage(certInput, genreInput)
});
