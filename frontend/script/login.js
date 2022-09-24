const ls = window.localStorage

// const port = 8738;
// const baseUrl = `http://127.0.0.1:${port}`;



// window.addEventListener('DOMContentLoaded', (e) => {
//   let account;
//   if (ls.getItem('account')) {
//     account = JSON.parse(ls.getItem('account'));
//   }
//   if (!account) {

//   }

//   else {
//     btnSubmit.classList.add('hidden');
//     //inputEmail.innerHTML = account.loginname;
//   }
// })


// ls.removeItem('token')
// ls.removeItem('account')

const inputEmail = document.querySelector("#userEmail");
const inputPassword = document.querySelector("#userPassword");
const btnSubmit = document.querySelector("#btnSubmit");






btnSubmit.addEventListener("click", (e) => {

    e.preventDefault()
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

    //console.log(fetchOptions);
    fetch(`http://127.0.0.1:8738/api/accounts/login`, fetchOptions)
        .then(response => {
            const token = response.headers.get('x-authentication-token');
            ls.setItem('token', token);
            console.log(ls.getItem('token'));

            return response.json()

        })

        .then(data => {
            ls.setItem('account', JSON.stringify(data));
            // console.log(ls.getItem('account'));

            if (data.role.roleid === 2) {
                window.location.href = "admin.html"
            } else {
                window.location.href = "profile.html";
            }


            // window.location.href = replace("login.html", "profile.html");
            // return data;
        })

    // .then(data => {

    // })
})

