// var recipeContainer = document.getElementById('recipe');


// function getRecipes() {
// fetch("https://tasty.p.rapidapi.com/recipes/list?from=0&size=4&tags=under_30_minutes", {
// 	"method": "GET",
// 	"headers": {
// 		"x-rapidapi-host": "tasty.p.rapidapi.com",
// 		"x-rapidapi-key": "c932fbbb24mshb43abde3fc25cffp11cacajsnae76ac16d611"
// 	}
// })
// .then(function(response) {
// 	console.log(response);
//     response.json().then(function(data) {
//         console.log(data);
		
//     });
// })
// .then(function (data) {
    
//     for (var i = 0; i < data.length; i++) {
//         var recipeName = document.createElement("<p class='title is-4'>recipe</p>")

//         recipeName.textContent = data[i].name;
        

//         recipeContainer.append(recipe);
//     }
// });
// };

// onload = (event) => {
//     getRecipes();
//   };


// Store data
// var someData = 'The data that I want to store for later.';
// localStorage.setItem('myDataKey', someData);

// Get data
// var data = localStorage.getItem('myDataKey');

function getRecipes() {
	fetch("https://tasty.p.rapidapi.com/recipes/list?from=0&size=4&tags=under_30_minutes", {
		"method": "GET",
		"headers": {
			"x-rapidapi-host": "tasty.p.rapidapi.com",
			"x-rapidapi-key": "c932fbbb24mshb43abde3fc25cffp11cacajsnae76ac16d611"
		}
	})
	.then(response => {
		if (!response.ok) {
			throw Error("ERROR");
		}
		return response.json();
	})
	.then(data => {
		const html = data.results
		.map(results => {
			// style this section
			return `
			<div class="list">
				<p class="image"><img src="${results.thumbnail_url}" /></p>
				<p class="name">${results.name}</p>
			</div>
			`;
		})
		.join("");
		document.querySelector("#results").insertAdjacentHTML("afterbegin", html);
	})
	.catch(error => {
		console.log(error);
	});
}

getRecipes();

// Ignore for now
// console logging list data
// fetch("https://tasty.p.rapidapi.com/recipes/list?from=0&size=4&tags=under_30_minutes", {
// 	"method": "GET",
// 	"headers": {
// 		"x-rapidapi-host": "tasty.p.rapidapi.com",
// 		"x-rapidapi-key": "c932fbbb24mshb43abde3fc25cffp11cacajsnae76ac16d611"
// 	}
// })
// .then(function(response) {
// 	console.log(response);
//     response.json().then(function(data) {
//         console.log(data);
		
//     });
// })
// .catch(err => {
// 	console.error(err);
// });