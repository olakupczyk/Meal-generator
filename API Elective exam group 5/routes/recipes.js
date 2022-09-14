const express = require('express');
const router = express.Router();

const Recipe = require('../models/recipe');

router.get('/', async (req, res) => {
    res.header('Content-type', 'application/json');
    // need to connect to the DB and ask for all the books
    // when got the response back from the DB, then prepare the response for the client
    //console.log('get all books')
    try {
        const recipes = await Recipe.readAll();
        return res.send(JSON.stringify(recipes));

    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).send(JSON.stringify(err));
        return res.status(500).send(JSON.stringify(err));
    }

});

router.post('/', async (req, res) => {
    res.header('Content-type', 'application/json');
    //VALIDATE THE USER INPUT AKA.: REQ. BODY
    // try to connect to the database and 'save' the new resource (a book)
    // prepare response for the client, or error (has to be sent to the client too)

    try {
        const { error } = Recipe.validate(req.body);
        if (error) throw { statusCode: 400, errorMessage: `Incorrectly formatted payload.`, errorObj: error }


        const recipeToSendToDB = new Recipe(req.body);
        const recipe = await recipeToSendToDB.create()

        return res.send(JSON.stringify(recipe));

    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).send(JSON.stringify(err));
        return res.status(500).send(JSON.stringify(err));
    }

})

module.exports = router;