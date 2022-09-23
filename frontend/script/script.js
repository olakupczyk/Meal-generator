const inputName = document.querySelector('#userName');
const inputPassword = document.querySelector('#userPassword');
const btnSumbit = document.querySelector('#btnSubmit');

btnSumbit.addEventListener('click', (e) => {
    
    const payload = {
        'accountemail': inputName.value,
        'hashedpassword': inputPassword.value
    }

    const fetchoptions = {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(payload)
    }
fetch('http//127.0.0.1:8738/api/login')
})