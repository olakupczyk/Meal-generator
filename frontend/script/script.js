


//This is the meal generator on index.html
// const getBreakfast = document.getElementById("breakfast");
// const getLunch = document.getElementById("lunch");
// const getDinner = document.getElementById("dinner");
// const mealContainer = document.getElementById("meal");

// getBreakfast.addEventListener("click", () => {
//   fetch("http://localhost:8738/api/recipes")
//     .then((res) => res.json())
//     .then((res) => {
//       createRecipe(res.recipes);
//     });
// });

// function createRecipe(recipe) {
//   mealContainer.innerHTML = `
//         <div>
//             <img src="${recipe.recipeimg}" alt="Meal Img" />
//         </div>
//     `;
// }

// const inputTitle = document.querySelector("#bookTitle");
// const inputYear = document.querySelector("#bookYear");
// const btnSubmit = document.querySelector("#btnBookSubmit");
// const divOutput = document.querySelector("#divOutput");

//const inputEmail = document.querySelector("#userEmail");
//const inputPassword = document.querySelector("#userPassword");
//const btnSubmit = document.querySelector("#btnSubmit");
//const inputAccname = document.querySelector("#accountName");
//const divOutput = document.querySelector("#divOutput");

/* btnSubmit.addEventListener("click", (e) => {
  const payload = {
    "accountemail": inputEmail.value,

    "accountgenname": inputAccname.value, 

    "password": inputPassword.value
  }

  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },

    body: JSON.stringify(payload),
  }
//   console.log(fetchOptions);
  fetch("http://127.0.0.1:8738/api/accounts", fetchOptions)
    .then((response) => response.json())
    .then((data) => {
        // console.log(data);
  divOutput.innerHTML = `You have created an Account
      </br> Your username: ${data.accountgenname}
      </br> Your Email: ${data.accountemail}`
    })

})

function validateForm()
{
    var pass = document.getElementById('userPassword').value;
    if(pass == `${password}`) //here 1234 is your password
        window.location = 'file:///C:/Jeppe/GitHub/mealGenerator/frontend/register.html';
} */

const inputEmail = document.querySelector("#userEmail");
const inputPassword = document.querySelector("#userPassword");
const btnSubmit = document.querySelector("#btnSubmit");

const btnRegister= document.querySelector('#btnCreateProfile');

const ls = window.localStorage

const port = 8738;
const baseUrl = `http://127.0.0.1:${port}`;

window.addEventListener('DOMContentLoaded', (e) => {
  let account;
  if (ls.getItem('account')) {
      account = JSON.parse(ls.getItem('account'));
  }
  
  else {
      btnSubmit.classList.add('hidden');
      inputEmail.innerHTML = account.loginname;

      if (account.profileid) {
          btnCreateProfile.classList.add('hidden');
      } 
  }
})

btnSubmit.addEventListener("click", (e) => {
  const payload = {
    accountemail: inputEmail.value,
    password: inputPassword.value
  }

  const fetchOptions = {
    method: 'POST',
    headers: {
        'Content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  }
  
  fetch(`${baseUrl}/api/accounts/login`, fetchOptions)
  .then(response => {
      const token = response.headers.get('x-authentication-token');
      ls.setItem('token', token);
      console.log(ls.getItem('token'));

      return response.json()
  })
  .then(data => {
      ls.setItem('account', JSON.stringify(data));
      console.log(ls.getItem('account'));

      window.location.reload();
  })
})

