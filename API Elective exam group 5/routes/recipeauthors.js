const express = require('express');
const router = express.Router();

const RecipeAuthor = require('../models/recipeauthor');

router.get('/', async (req, res) => {
    res.header('Content-type', 'application/json');
/*
    const myAuthorWannabe = {
        firstname: "Gery", //if one of these is more than 50 characters long, there will be an error in the terminal
        lastname: "Barsi"
        // if there would be another extra information (property), it will not allow it
    }

    const {error} = Author.validate(myAuthorWannabe);
    console.log(error);

    res.send(JSON.stringify({"message":"GET /api/authors"}));
*/

    // need to connect to the database (DB) amd ask for all the authors
    // when got the response back from the DB, then prepare the response for the client
    
    try {
        const recipeauthors = await RecipeAuthor.readAll(); // readAll method is a promise - is asynchrounous, so we have to await, then write async in router.get
        return res.send(JSON.stringify(recipeauthors));
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).send(JSON.stringify(err));
        return res.status(500).send(JSON.stringify(err));
    }
});


module.exports = router;