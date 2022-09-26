const ls = window.localStorage;
const userName = document.querySelector('#accountName');
const userEmail = document.querySelector('#userEmail');
const userPassword = document.querySelector('#userPassword');
const btnSubmit = document.querySelector('#btnSubmit');
const formCont= document.querySelector('#formContainer');

/* const signOut = document.querySelector('#signOut');
 */
// ls.removeItem('token')
// ls.removeItem('account')

window.addEventListener('load', async (e) => {
    try{if (ls.getItem('token')) {
        await getMyAccount()
    } else {
        window.location.href = "login.html"
    }} catch (err){

    } 
})

/* signOut.addEventListener('click', () => {
    ls.removeItem('token');
    ls.removeItem('account');

    window.location.href = "index.html"
}) */



const getMyAccount = async function () {
    try{
        const fetchOptions = 
        {   
            method: "GET",
            headers: {
                "Content-type": "application/json"
            }
        }
        if (ls.getItem('token')) {
            fetchOptions.headers["x-authentication-token"] = ls.getItem('token')
        }
        fetch('http://127.0.0.1:8738/api/accounts/own', fetchOptions)
        .then (res => res.json())
        .then (data => {
            console.log(data)
            userName.value = data.accountgenname;
        })
    } catch (err) {
    }
}

btnSubmit.addEventListener ('click', async (e) => {
    try{
        e.preventDefault(); 
        const payload = {
            accountgenname: userName.value,
            password: userPassword.value
        } 
        const fetchOptions = 
        {   
            method: "PUT",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify (payload) 
        }
        if (ls.getItem('token')) {
            fetchOptions.headers["x-authentication-token"] = ls.getItem('token')
        }
        fetch('http://127.0.0.1:8738/api/accounts/own', fetchOptions)
        .then (res => res.json())
        .then (data => {
            console.log(data)
            formCont.innerHTML = `
            <a href= "profile.html">Back to profile</a>`
        })
    } catch (err) {
    }
}) 

