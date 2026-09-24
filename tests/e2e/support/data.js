// Deterministic test data shaped like the real TMDB / TheMealDB / TheCocktailDB responses.
// Overviews are paraphrased; ids are stable so tests can assert on them.

// [id, title, year, genres, cert, runtime, rating, overview, originalTitle?]
const MOVIE_ROWS = [
  [313369, 'La La Land', 2016, [35, 18, 10749, 10402], 'PG-13', 128, 7.9, 'A jazz pianist and an aspiring actress fall for each other while chasing big dreams in Los Angeles.'],
  [194, 'Amélie', 2001, [35, 10749], 'R', 122, 7.9, 'A shy Parisian waitress secretly orchestrates small joys for the people around her.', "Le Fabuleux Destin d'Amélie Poulain"],
  [129, 'Spirited Away', 2001, [16, 10751, 14], 'PG', 125, 8.5, 'A girl wanders into a world of spirits and must work in a bathhouse to free her parents.', '千と千尋の神隠し'],
  [4348, 'Pride & Prejudice', 2005, [18, 10749], 'PG', 129, 8.1, 'Sparks fly when spirited Elizabeth Bennet meets the proud Mr. Darcy.'],
  [38, 'Eternal Sunshine of the Spotless Mind', 2004, [878, 18, 10749], 'R', 108, 8.1, 'After a painful breakup, a man undergoes a procedure to erase his ex from memory.'],
  [76341, 'Mad Max: Fury Road', 2015, [28, 12, 878], 'R', 120, 7.6, 'In a desert wasteland, a drifter and a rebel warrior flee a tyrant across the sands.'],
  [155, 'The Dark Knight', 2008, [18, 28, 80, 53], 'PG-13', 152, 8.5, 'Batman faces the Joker, a criminal mastermind who wants to watch Gotham burn.'],
  [603, 'The Matrix', 1999, [28, 878], 'R', 136, 8.2, 'A hacker learns that reality is a simulation and joins the fight to free humanity.'],
  [120467, 'The Grand Budapest Hotel', 2014, [35, 18], 'R', 100, 8.0, 'A legendary concierge and his lobby boy are swept up in the theft of a priceless painting.'],
  [115, 'The Big Lebowski', 1998, [35, 80], 'R', 117, 7.8, 'A laid-back bowler is mistaken for a millionaire and pulled into a kidnapping scheme.'],
  [8587, 'The Lion King', 1994, [10751, 16, 18], 'G', 88, 8.3, 'A young lion prince flees his kingdom and must find the courage to reclaim it.'],
  [862, 'Toy Story', 1995, [16, 12, 10751, 35], 'G', 81, 8.0, "A cowboy doll feels threatened when a flashy space ranger becomes his kid's favorite toy."],
  [12, 'Finding Nemo', 2003, [16, 10751], 'G', 100, 7.8, 'A timid clownfish crosses the ocean to find his son.'],
  [694, 'The Shining', 1980, [27, 53], 'R', 144, 8.2, 'A writer takes a winter caretaker job at an isolated hotel, and something in it takes hold of him.'],
  [419430, 'Get Out', 2017, [9648, 53, 27], 'R', 104, 7.6, "A weekend at his girlfriend's family estate turns into a nightmare for a young photographer."],
  [493922, 'Hereditary', 2018, [27, 9648, 53], 'R', 127, 7.3, 'After a death in the family, a grieving household uncovers terrifying secrets.'],
  [157336, 'Interstellar', 2014, [12, 18, 878], 'PG-13', 169, 8.4, 'Explorers travel through a wormhole to find humanity a new home among the stars.'],
  [329865, 'Arrival', 2016, [18, 878, 9648], 'PG-13', 116, 7.6, 'A linguist races to communicate with mysterious visitors before tensions boil over.'],
  [27205, 'Inception', 2010, [28, 878, 12], 'PG-13', 148, 8.4, 'A thief who steals secrets through dreams is hired to plant an idea instead.'],
  [8363, 'Superbad', 2007, [35], 'R', 113, 7.2, 'Two inseparable friends try to make one wild party count before graduation.'],
  [10625, 'Mean Girls', 2004, [35], 'PG-13', 97, 7.2, 'A new student is welcomed into the most popular clique at her school, with consequences.'],
  [2493, 'The Princess Bride', 1987, [12, 10751, 14, 35, 10749], 'PG', 98, 7.7, 'A farmhand turned pirate sets out to rescue his true love from a scheming prince.'],
  [11036, 'The Notebook', 2004, [10749, 18], 'PG-13', 123, 7.9, 'A summer romance between a country boy and a city girl endures across decades.'],
  [597, 'Titanic', 1997, [18, 10749], 'PG-13', 194, 7.9, 'Two passengers from different worlds fall in love aboard the ill-fated ocean liner.'],
  [680, 'Pulp Fiction', 1994, [53, 80], 'R', 154, 8.5, 'Stories of hitmen, a boxer and a gangster’s wife collide in Los Angeles.'],
  [807, 'Se7en', 1995, [80, 9648, 53], 'R', 127, 8.4, 'Two detectives hunt a killer who stages his crimes around the seven deadly sins.'],
  [105, 'Back to the Future', 1985, [12, 35, 878], 'PG', 116, 8.3, 'A teenager is accidentally sent thirty years into the past in a time-traveling car.'],
  [85, 'Raiders of the Lost Ark', 1981, [12, 28], 'PG', 115, 7.9, 'An archaeologist races rivals to find the legendary Ark of the Covenant.'],
  [13, 'Forrest Gump', 1994, [35, 18, 10749], 'PG-13', 142, 8.5, 'A kind-hearted man drifts through decades of history while loving one woman.'],
  [508442, 'Soul', 2020, [16, 10751, 35, 14], 'PG', 101, 8.0, 'A music teacher gets a second chance to find what makes life worth living.'],
  [354912, 'Coco', 2017, [10751, 16, 10402, 12], 'PG', 105, 8.2, 'A boy who dreams of music journeys into the Land of the Dead to learn his family’s story.'],
  [530915, '1917', 2019, [10752, 18, 36], 'R', 119, 8.0, 'Two soldiers cross enemy territory to deliver a message that could save hundreds of lives.'],
  [244786, 'Whiplash', 2014, [18, 10402], 'R', 107, 8.4, 'A young drummer is pushed to the edge by a ruthless music instructor.'],
  [1124, 'The Prestige', 2006, [18, 9648, 878], 'PG-13', 130, 8.2, 'Two rival magicians escalate their feud into an obsessive battle of illusions.'],
  [546554, 'Knives Out', 2019, [35, 80, 9648], 'PG-13', 131, 7.8, 'A detective investigates the death of a wealthy novelist whose family all had motives.'],
  [37165, 'The Truman Show', 1998, [35, 18], 'PG', 103, 8.1, 'An insurance salesman slowly discovers his whole life is a television show.'],
  [290250, 'The Nice Guys', 2016, [28, 35, 80], 'R', 116, 7.1, 'A hired enforcer and a hapless private eye team up on a missing-person case in 1970s LA.'],
  [398818, 'Call Me by Your Name', 2017, [10749, 18], 'R', 132, 8.1, 'A summer in the Italian countryside brings an unexpected first love.'],
  [11324, 'Shutter Island', 2010, [18, 53, 9648], 'R', 138, 8.2, 'A US Marshal investigates a disappearance at a hospital for the criminally insane.'],
  [572802, 'Aquaman and the Lost Kingdom', 2023, [28, 12, 14], 'PG-13', 124, 6.4, 'A reluctant king forms an alliance to protect his kingdom from an ancient power.'],
  [615656, 'Meg 2: The Trench', 2023, [28, 878, 27], 'PG-13', 116, 6.7, 'An expedition to the deepest ocean trench encounters prehistoric predators.'],
  [9502, 'Kung Fu Panda', 2008, [28, 12, 16, 10751, 35], 'PG', 90, 7.3, 'An unlikely panda is chosen to fulfil an ancient prophecy.'],
  [567, 'Rear Window', 1954, [9648, 53], 'PG', 112, 8.3, 'A photographer stuck at home becomes convinced a neighbour has committed murder.'],
  [289, 'Casablanca', 1942, [18, 10749], 'PG', 102, 8.2, 'A cynical nightclub owner is reunited with the woman he loved, in wartime Morocco.'],
  [11216, 'Cinema Paradiso', 1988, [18, 10749], 'R', 124, 8.4, 'A filmmaker recalls his childhood friendship with the projectionist of a village cinema.', 'Nuovo Cinema Paradiso'],
  [496243, 'Parasite', 2019, [35, 53, 18], 'R', 133, 8.5, 'A poor family schemes its way into the lives of a wealthy household.', '기생충'],
  [1018, 'Mulholland Drive', 2001, [53, 18, 9648], 'R', 147, 7.8, 'An amnesiac woman and an aspiring actress search for clues in Los Angeles.'],
  [372058, 'Your Name.', 2016, [16, 10749, 18], 'PG', 106, 8.5, 'Two teenagers discover they are mysteriously swapping bodies.', '君の名は。'],
];

export const MOVIES = MOVIE_ROWS.map(([id, title, year, genre_ids, cert, runtime, vote_average, overview, original_title]) => ({
  id,
  title,
  original_title: original_title ?? title,
  release_date: `${year}-06-15`,
  genre_ids,
  cert,
  runtime,
  vote_average,
  vote_count: 4000 + (id % 9000),
  overview,
  // One movie has no poster so the fallback art is exercised.
  poster_path: id === 290250 ? null : `/poster-${id}.jpg`,
  backdrop_path: `/backdrop-${id}.jpg`,
  popularity: 100 - (id % 97),
}));

export const PROVIDERS = [
  { provider_id: 8, provider_name: 'Netflix', logo_path: '/logo-netflix.jpg', display_priority: 1 },
  { provider_id: 1899, provider_name: 'Max', logo_path: '/logo-max.jpg', display_priority: 3 },
  { provider_id: 337, provider_name: 'Disney Plus', logo_path: '/logo-disney.jpg', display_priority: 2 },
  { provider_id: 9, provider_name: 'Amazon Prime Video', logo_path: '/logo-prime.jpg', display_priority: 4 },
  { provider_id: 15, provider_name: 'Hulu', logo_path: '/logo-hulu.jpg', display_priority: 5 },
];

// [id, name, category, area, instructionsStyle]
const MEAL_ROWS = [
  ['52982', 'Spaghetti alla Carbonara', 'Pasta', 'Italian', 'steps'],
  ['52771', 'Spicy Arrabiata Penne', 'Vegetarian', 'Italian', 'crlf'],
  ['52844', 'Lasagne', 'Pasta', 'Italian', 'crlf'],
  ['52835', 'Fettuccine Alfredo', 'Pasta', 'Italian', 'inline'],
  ['52839', 'Chilli Prawn Linguine', 'Pasta', 'Italian', 'crlf'],
  ['52961', 'Budino Di Ricotta', 'Dessert', 'Italian', 'paragraph'],
  ['52775', 'Vegan Lasagna', 'Vegan', 'Italian', 'steps'],
  ['52772', 'Teriyaki Chicken Casserole', 'Chicken', 'Japanese', 'crlf'],
  ['52820', 'Katsu Chicken Curry', 'Chicken', 'Japanese', 'steps'],
  ['53065', 'Sushi', 'Seafood', 'Japanese', 'crlf'],
  ['52773', 'Honey Teriyaki Salmon', 'Seafood', 'Japanese', 'inline'],
  ['52795', 'Chicken Handi', 'Chicken', 'Indian', 'paragraph'],
  ['52806', 'Tandoori Chicken', 'Chicken', 'Indian', 'crlf'],
  ['52807', 'Baingan Bharta', 'Vegetarian', 'Indian', 'steps'],
  ['52785', 'Dal Fry', 'Vegetarian', 'Indian', 'crlf'],
  ['52808', 'Lamb Rogan Josh', 'Lamb', 'Indian', 'crlf'],
  ['52819', 'Cajun Spiced Fish Tacos', 'Seafood', 'Mexican', 'crlf'],
  ['53000', 'Chicken Enchiladas', 'Chicken', 'Mexican', 'steps'],
  ['53001', 'Black Bean Quesadillas', 'Vegetarian', 'Mexican', 'inline'],
  ['53002', 'Churros', 'Dessert', 'Mexican', 'crlf'],
  ['52776', 'Chocolate Gateau', 'Dessert', 'French', 'crlf'],
  ['52917', 'White Chocolate Crème Brûlée', 'Dessert', 'French', 'steps'],
  ['52870', 'Chicken Marengo', 'Chicken', 'French', 'paragraph'],
  ['52832', 'Coq au Vin', 'Chicken', 'French', 'crlf'],
  ['52906', 'Flamiche', 'Vegetarian', 'French', 'crlf'],
  ['52852', 'Tuna Niçoise', 'Seafood', 'French', 'inline'],
  ['52827', 'Massaman Beef Curry', 'Beef', 'Thai', 'crlf'],
  ['52814', 'Thai Green Curry', 'Chicken', 'Thai', 'steps'],
  ['52869', 'Pad See Ew', 'Chicken', 'Thai', 'crlf'],
  ['53003', 'Tofu Pad Thai', 'Vegan', 'Thai', 'crlf'],
  ['52948', 'Wontons', 'Pork', 'Chinese', 'crlf'],
  ['52945', 'Kung Pao Chicken', 'Chicken', 'Chinese', 'steps'],
  ['52955', 'Egg Drop Soup', 'Vegetarian', 'Chinese', 'crlf'],
  ['53013', 'Big Mac', 'Beef', 'American', 'steps'],
  ['52995', 'BBQ Pork Sloppy Joes', 'Pork', 'American', 'crlf'],
  ['52855', 'Banana Pancakes', 'Dessert', 'American', 'inline'],
  ['52794', 'Vegan Chocolate Cake', 'Vegan', 'American', 'crlf'],
  ['52813', 'Kentucky Fried Chicken', 'Chicken', 'American', 'crlf'],
  ['52874', 'Beef and Mustard Pie', 'Beef', 'British', 'steps'],
  ['52959', 'Baked Salmon with Fennel & Tomatoes', 'Seafood', 'British', 'crlf'],
  ['52893', 'Apple & Blackberry Crumble', 'Dessert', 'British', 'crlf'],
  ['52803', 'Beef Wellington', 'Beef', 'British', 'paragraph'],
  ['52793', 'Sticky Toffee Pudding', 'Dessert', 'British', 'crlf'],
  ['52911', 'Chicken Quinoa Greek Salad', 'Chicken', 'Greek', 'crlf'],
  ['53012', 'Gigantes Plaki', 'Vegetarian', 'Greek', 'steps'],
  ['53004', 'Moussaka', 'Beef', 'Greek', 'crlf'],
  ['52843', 'Lamb Tagine', 'Lamb', 'Moroccan', 'crlf'],
  ['52850', 'Chicken Couscous', 'Chicken', 'Moroccan', 'steps'],
  ['52963', 'Shakshuka', 'Vegetarian', 'Egyptian', 'crlf'],
  ['52942', 'Roast Fennel and Aubergine Paella', 'Vegan', 'Spanish', 'crlf'],
  ['53005', 'Gambas al Ajillo', 'Seafood', 'Spanish', 'inline'],
  ['52937', 'Jerk Chicken with Rice & Peas', 'Chicken', 'Jamaican', 'crlf'],
  ['52997', 'Beef Banh Mi Bowls', 'Beef', 'Vietnamese', 'steps'],
  ['53006', 'Vegetable Pho', 'Vegan', 'Vietnamese', 'crlf'],
  ['52834', 'Beef Stroganoff', 'Beef', 'Russian', 'crlf'],
  ['52977', 'Corba', 'Side', 'Turkish', 'crlf'],
  ['52978', 'Kumpir', 'Side', 'Turkish', 'steps'],
  ['52965', 'Breakfast Potatoes', 'Breakfast', 'Canadian', 'crlf'],
  ['52928', 'BeaverTails', 'Dessert', 'Canadian', 'crlf'],
  ['53049', 'Apam Balik', 'Dessert', 'Malaysian', 'crlf'],
  ['52842', 'Broccoli & Stilton Soup', 'Starter', 'British', 'crlf'],
  ['52787', 'Hot Chocolate Fudge', 'Dessert', 'American', 'crlf'],
];

const INGREDIENTS = {
  default: [['Olive Oil', '2 tbs'], ['Garlic', '2 cloves'], ['Onion', '1 chopped'], ['Salt', 'pinch'], ['Black Pepper', 'to taste']],
  Pasta: [['Spaghetti', '320g'], ['Egg Yolks', '6'], ['Pancetta', '150g'], ['Parmesan', '50g grated'], ['Black Pepper', 'to taste']],
  Dessert: [['Butter', '100g'], ['Caster Sugar', '150g'], ['Eggs', '2'], ['Plain Flour', '200g'], ['Vanilla Extract', '1 tsp'], ['Dark Chocolate', '100g']],
  Seafood: [['Salmon', '2 fillets'], ['Lime', '1'], ['Garlic', '2 cloves'], ['Soy Sauce', '3 tbs'], ['Ginger', '1 tsp grated']],
  Chicken: [['Chicken Thighs', '6'], ['Onion', '1 sliced'], ['Garlic', '3 cloves'], ['Chopped Tomatoes', '400g can'], ['Cumin', '1 tsp'], ['Coriander', 'handful']],
  Vegetarian: [['Aubergine', '1 large'], ['Chickpeas', '400g can'], ['Tomato Puree', '2 tbs'], ['Spinach', '100g'], ['Paprika', '1 tsp']],
  Vegan: [['Tofu', '200g'], ['Rice Noodles', '200g'], ['Peanuts', '50g'], ['Lime', '1'], ['Bean Sprouts', '100g']],
  Beef: [['Beef Fillet', '600g'], ['Mushrooms', '250g'], ['Mustard', '2 tbs'], ['Shallots', '2'], ['Thyme', '2 sprigs']],
};

const INSTRUCTION_STYLES = {
  crlf: (name) =>
    `Heat the oil in a large pan over a medium heat.\r\nAdd the onion and garlic and cook until soft, about 5 minutes.\r\n\r\nStir in the remaining ingredients for the ${name} and simmer for 20 minutes.\r\nSeason to taste and serve straight away.`,
  steps: (name) =>
    `STEP 1\r\nPrepare all the ingredients for the ${name}.\r\n\r\nSTEP 2\r\nCook the base in a hot pan until golden.\r\n\r\nSTEP 3\r\nCombine everything and cook for 15 minutes.\r\n\r\nSTEP 4\r\nPlate up and enjoy together.`,
  inline: (name) => `1. Preheat the oven to 200C. 2. Mix the ${name} ingredients in a bowl. 3. Bake for 25 minutes. 4. Rest for 5 minutes before serving.`,
  paragraph: (name) =>
    `Start the ${name} by warming a heavy pan over a medium heat. Add the oil and let it shimmer before adding the aromatics. Cook them gently, stirring often, until they are soft and fragrant. Add the main ingredients and brown them well on every side. Pour in the liquid and scrape the bottom of the pan to lift any tasty bits. Cover and simmer gently for thirty minutes, stirring now and then. Taste and adjust the seasoning. Rest for a few minutes before serving with something fresh on the side.`,
};

export const MEALS = MEAL_ROWS.map(([idMeal, strMeal, strCategory, strArea, style]) => {
  const raw = {
    idMeal,
    strMeal,
    strDrinkAlternate: null,
    strCategory,
    strArea,
    strInstructions: INSTRUCTION_STYLES[style](strMeal),
    strMealThumb: `https://www.themealdb.com/images/media/meals/mock-${idMeal}.jpg`,
    strTags: strCategory === 'Dessert' ? 'Sweet,Baking' : 'Dinner',
    strYoutube: `https://www.youtube.com/watch?v=mock${idMeal}`,
    strSource: idMeal === '52982' ? '' : `https://example.com/recipes/${idMeal}`,
  };
  const ingredients = INGREDIENTS[strCategory] ?? INGREDIENTS.default;
  for (let i = 1; i <= 20; i += 1) {
    raw[`strIngredient${i}`] = ingredients[i - 1]?.[0] ?? '';
    raw[`strMeasure${i}`] = ingredients[i - 1]?.[1] ?? '';
  }
  return raw;
});

// [id, name, alcoholic, category]
const DRINK_ROWS = [
  ['11007', 'Margarita', 'Alcoholic', 'Ordinary Drink'],
  ['11000', 'Mojito', 'Alcoholic', 'Cocktail'],
  ['17222', 'A1', 'Alcoholic', 'Cocktail'],
  ['11118', 'Blue Margarita', 'Alcoholic', 'Ordinary Drink'],
  ['12162', 'Lime Cooler', 'Non alcoholic', 'Other / Unknown'],
  ['12560', 'Afterglow', 'Non alcoholic', 'Cocktail'],
  ['12572', 'Apello', 'Non alcoholic', 'Other / Unknown'],
  ['12618', 'Virgin Mojito', 'Non alcoholic', 'Cocktail'],
];

export const DRINKS = DRINK_ROWS.map(([idDrink, strDrink, strAlcoholic, strCategory]) => ({
  idDrink,
  strDrink,
  strAlcoholic,
  strCategory,
  strGlass: 'Highball glass',
  strInstructions: 'Fill a glass with ice.\r\nAdd the lime juice and the rest of the ingredients.\r\nStir gently and garnish with a lime wheel.',
  strDrinkThumb: `https://www.thecocktaildb.com/images/media/drink/mock-${idDrink}.jpg`,
  strIngredient1: 'Lime',
  strMeasure1: '1 ',
  strIngredient2: 'Soda water',
  strMeasure2: '200 ml',
  strIngredient3: strAlcoholic === 'Alcoholic' ? 'Tequila' : 'Mint',
  strMeasure3: strAlcoholic === 'Alcoholic' ? '1 1/2 oz ' : '6 leaves',
  strIngredient4: null,
  strMeasure4: null,
}));
