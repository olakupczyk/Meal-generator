const ls = window.localStorage;
let account
const signOut = document.querySelector('#signOut');
const content = document.querySelector('#content')

window.addEventListener('load', async () => {
    try {
        account = JSON.parse(ls.getItem("account"));

        if (ls.getItem('token') && account.role.roleid === 2) {

            await getAllRecipes()

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
                <td class="noPadMar redTxt deleteBtn" data-btn="${recipe.recipeid}"  >Delete</td>
              </tr>
                `
                    content.insertAdjacentHTML('beforeend', markup);

                    
                })
                addHandlerToDeleteBtn()
            })
    } catch (err) {
        console.log(err);
    }
}

const addHandlerToDeleteBtn = async function () {
    try {
        //const deleteBtn = document.querySelector('.deleteBtn')

        content.addEventListener('click', (e) => {
            e.preventDefault();

            const clickedBtn = e.target.closest(".deleteBtn");

            if (!clickedBtn) return;

            const recipeid = clickedBtn.dataset.btn

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





    } catch (err) {
        console.log(err)
    }

}