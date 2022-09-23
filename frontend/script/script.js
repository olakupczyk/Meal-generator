const inputName = document.getElementById('#userName');
const inputPassword = document.getElementById('#userPassword');
const btnSumbit = document.getElementById('#btnSubmit');
//const divOutput = document.getElementById ('#btnSubmit');

btnSumbit.addEventListener('click', (e) => {
    
    const payload = {
        'accountemail': inputName.value,    
        'hashedpassword': inputPassword.value
    }

    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(payload)
    }
fetch('http//127.0.0.1:8738/api/login', fetchOptions)
.then((response) => response.json())
.then((data) => {
 //  divOutput
}) 

})