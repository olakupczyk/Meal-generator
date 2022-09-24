


//This is the meal generator on index.html
const getBreakfast = document.getElementById("breakfast");

const mealContainer = document.getElementById("meal");

getBreakfast.addEventListener("click", () => {
  fetch("http://localhost:8738/api/recipes")
    .then((res) => res.json())
    .then((data) => {
      let BreakfastRecipes = [];
      data.filter((recipe) => {
        if (recipe.FK_recipetypeid === 1) {
          BreakfastRecipes.push(recipe)
        }
      })



      //console.log(BreakfastRecipes);

      const max = BreakfastRecipes.length - 1
      const random = Math.floor(Math.random() * max);

      createRecipe(BreakfastRecipes[random]);

      console.log()
    });
});

function createRecipe(recipe) {
  mealContainer.innerHTML = `
        <div>
            <p> ${recipe.recipename}</p>
        </div>
    `;
}



const getLunch = document.getElementById("lunch");

getLunch.addEventListener("click", () => {
  fetch("http://localhost:8738/api/recipes")
    .then((res) => res.json())
    .then((data) => {
      let LunchRecipes = [];
      data.filter((recipe) => {
        if (recipe.FK_recipetypeid === 2) {
          LunchRecipes.push(recipe)
        }
      })

      //console.log(LunchRecipes);

      const max = LunchRecipes.length - 1
      const random = Math.floor(Math.random() * max);

      createRecipe(LunchRecipes[random]);

      console.log()
    });
});

function createRecipe(recipe) {
  mealContainer.innerHTML = `
        <div>
            <p> ${recipe.recipename} </p>
        </div>
    `;
}






const getDinner = document.getElementById("dinner");

getDinner.addEventListener("click", () => {
  fetch("http://localhost:8738/api/recipes")
    .then((res) => res.json())
    .then((data) => {
      let DinnerRecipes = [];
      data.filter((recipe) => {
        if (recipe.FK_recipetypeid === 3) {
          DinnerRecipes.push(recipe)
        }
      })

      //console.log(DinnerRecipes);

      const max = DinnerRecipes.length - 1
      const random = Math.floor(Math.random() * max);

      createRecipe(DinnerRecipes[random]);

      console.log()
    });
});

function createRecipe(recipe) {
  mealContainer.innerHTML = `
        <div>
            <p> ${recipe.recipename} </p>
        </div>
    `;
}






