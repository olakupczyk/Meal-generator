


//This is the meal generator on index.html
const getBreakfast = document.getElementById("breakfast");

const mealContainer = document.getElementById("meal");

getBreakfast.addEventListener("click", () => {
  fetch("http://localhost:8738/api/recipes")
    .then((res) => res.json())
    .then((data) => {
      let breakfastRecipes = [];
      data.filter((recipe) => {
        if (recipe.FK_recipetypeid === 1) {
          breakfastRecipes.push(recipe)
        }
      })

      //console.log(BreakfastRecipes);

      const max = breakfastRecipes.length - 1
      const random = Math.floor(Math.random() * max);

      createRecipe(breakfastRecipes[random]);

      console.log(breakfastRecipes[random])
    });
});



const getLunch = document.getElementById("lunch");

getLunch.addEventListener("click", () => {
  fetch("http://localhost:8738/api/recipes")
    .then((res) => res.json())
    .then((data) => {
      let lunchRecipes = [];
      data.filter((recipe) => {
        if (recipe.FK_recipetypeid === 2) {
          lunchRecipes.push(recipe)
        }
      })

      //console.log(LunchRecipes);

      const max = lunchRecipes.length - 1
      const random = Math.floor(Math.random() * max);

      createRecipe(lunchRecipes[random]);

      console.log(lunchRecipes[random])
    });
});

const getDinner = document.getElementById("dinner");

getDinner.addEventListener("click", () => {
  fetch("http://localhost:8738/api/recipes")
    .then((res) => res.json())
    .then((data) => {
      let dinnerRecipes = [];
      data.filter((recipe) => {
        if (recipe.FK_recipetypeid === 3) {
          dinnerRecipes.push(recipe)
        }
      })

      //console.log(DinnerRecipes);

      const max = dinnerRecipes.length - 1
      const random = Math.floor(Math.random() * max);

      createRecipe(dinnerRecipes[random]);

      console.log(dinnerRecipes[random])
    });
});

function createRecipe(recipe) {
  mealContainer.innerHTML = `
            <h3>${recipe.recipename}</h3>
            <img src=${recipe.recipeimg} alt="logo">
            <h4>About</h4>
            <p>${recipe.recipedesc}</p>
            <h4>Ingredients</h4>
            <p>${recipe.recipeingredients}</p>
            <h4>Kcal</h4>
            <p>${recipe.recipekcal}</p>
    `;
}
