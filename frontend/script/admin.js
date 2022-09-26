const ls = window.localStorage;
let account
const signOut = document.querySelector('#signOut');
const content = document.querySelector('#content');
const profilesTab = document.querySelector('#profiles');
const popUp = document.querySelector('#popUp');

window.addEventListener('load', async () => {
    try {
        account = JSON.parse(ls.getItem("account"));

        if (ls.getItem('token') && account.role.roleid === 2) {

            await getAllRecipes()
            await getAllAccounts()

        } else {
            window.location.href = "login.html"
        }

    } catch (err) {
        console.log(err);
    }


})

signOut.addEventListener('click', () => {
    ls.removeItem('token');
    ls.removeItem('account');

    window.location.href = "index.html"
})


const getAllRecipes = async function () {


    try {
        fetch('http://127.0.0.1:8738/api/recipes')
            .then(res => res.json())
            .then(data => {

                data.forEach(recipe => {
                    const markup = `
                <tr>
                <td>${recipe.recipename}</td>
                <td>Active</td>
                <td class="noPadMar redTxt deleteBtn" data-btn="${recipe.recipeid}">Delete</td>
              </tr>
                `
                    content.insertAdjacentHTML('beforeend', markup);


                })
                drawDeleteBtn()
            })
    } catch (err) {
        console.log(err);
    }
}

const getAllAccounts = async function () {

    try {
        if (profiles.profiledesc = null)
            fetch('http://127.0.0.1:8738/api/profiles')
                .then(res => res.json())
                .then(data => {

                    data.forEach(profiles => {
                        const markupAcc = `
                <tr>
                <td>${profiles.displayname}</td>
                <td>${profiles.profiledesc}</td> 
                <td>${profiles.profileid}</td> 
              </tr>
                `
                        profilesTab.insertAdjacentHTML('beforeend', markupAcc);


                    })
                })

    } catch (err) {
        console.log(err);
    }
}

const drawDeleteBtn = async function () {
    try {
        //const deleteBtn = document.querySelector('.deleteBtn')

        content.addEventListener('click', (e) => {
            e.preventDefault();

            const clickedBtn = e.target.closest(".deleteBtn");
            if (!clickedBtn) return;

            content.style.opacity = '.5'

            const recipeid = clickedBtn.dataset.btn
            const markup = `<article>
            <p>Are you sure about your actions?</p>
            <button id='yes'>Yes</button>
            <button id='no'>No</button>
            </article>`

            popUp.insertAdjacentHTML(`afterbegin`, markup)
            addHandlerToDeleteBtn(recipeid)

        })





    } catch (err) {
        console.log(err)
    }
}

const addHandlerToDeleteBtn = async function (recipeid) {
    try {
        const yes = document.querySelector('#yes')
        yes.addEventListener('click', (e) => {
            console.log(recipeid);
            const fetchOptions = {

                method: "DELETE",
                headers: { "Content-type": "application/json" },

            };

            if (ls.getItem("token")) {

                fetchOptions.headers["x-authentication-token"] = ls.getItem("token");

            }

            fetch(`http://127.0.0.1:8738/api/recipes/${recipeid}`, fetchOptions)
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    window.location.reload()
                })
        })

        const no = document.querySelector('#no')
        no.addEventListener('click', (e) => {
            popUp.innerHTML = ""
            content.style.opacity = '1'
        } )

    } catch (error) {
        console.log(error)
    }
}



