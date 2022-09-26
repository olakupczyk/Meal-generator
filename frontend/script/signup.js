

const inputEmail = document.querySelector("#userEmail");
const inputPassword = document.querySelector("#userPassword");
const btnSubmit = document.querySelector("#btnSubmit");
const inputAccname = document.querySelector("#accountName");
const formContainer = document.querySelector('#formContainer');
//const divOutput = document.querySelector("#divOutput");

btnSubmit.addEventListener("click", (e) => {
    e.preventDefault()
  const payload = {
    accountemail: inputEmail.value,
    accountgenname: inputAccname.value, 
    password: inputPassword.value
  }

  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },

    body: JSON.stringify(payload),
  }


  fetch("http://127.0.0.1:8738/api/accounts", fetchOptions)
    .then((response) => response.json())
    .then((data) => {
    drawSignedUpMessage(data) 

    })


})

const drawSignedUpMessage = async function(account) {
    formContainer.innerHTML = ''
    formContainer.innerHTML = `
    <p>You have created an Account
    </br> <h5>Your username:</h5> <p>${account.accountgenname}</p>
    </br> <h5>Your Email:</h5> <p>${account.accountemail}</p>
    <a href="login.html"> Log in </a>
    `
}
