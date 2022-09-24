const ls = window.localStorage;
const signOut = document.querySelector('#signOut');

// ls.removeItem('token')
// ls.removeItem('account')

window.addEventListener('load', (e) => {
    if (ls.getItem('token')) {
        console.log('token');
    } else {
        window.location.href = "login.html"
    }
})

signOut.addEventListener('click', () => {
    ls.removeItem('token');
    ls.removeItem('account');

    window.location.href = "index.html"
})