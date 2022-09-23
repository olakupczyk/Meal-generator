const express = require('express');
const router = express.Router();

const Recipe = require('../models/recipe');

const Joi = require('joi');

const auth = require('../middleware/authenticate');
const admin = require('../middleware/admin');
const check = require('../middleware/checkauthorisation');  // see use in admin.js middleware




// GET /api/recipes/
//      query: -

router.get('/', async (req, res) => {
    res.header('Content-type', 'application/json');
    // need to connect to the DB and ask for all the recipes
    // when got the response back form the DB, then prepare the response for the client

    try {
        const recipes = await Recipe.readAll();
        return res.send(JSON.stringify(recipes));
    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).send(JSON.stringify(err));
        return res.status(500).send(JSON.stringify(err));
    }

})

// GET /api/recipes/:recipeid
//      query: -
//
router.get('/:recipeid', async (req, res) => {
    // validate recipeid in req.params
    // call Recipe.readById(req.params.recipeid)
    // respond with recipe
    // if error respond with error

    try {
        // validate recipeid in req.params
        const schema = Joi.object({
            recipeid: Joi.number()
                .integer()
                .min(1)
                .required()
        })


        //console.log('whatever');
        const { error } = schema.validate(req.params);
        if (error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: error }

        // call recipe.readById(req.params.recipeid)
        const recipe = await Recipe.readById(req.params.recipeid);

        // respond with recipe
        return res.send(JSON.stringify(recipe));

    } catch (err) {
        if (err.statusCode) {   // if error with statusCode 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode
    }

    // return res.send(JSON.stringify({ message: `GET /api/recipes/${req.params.recipeid}` }))
})



// |
// \/
// not fixed and finished


router.post('/', [auth, admin, check], async (req, res) => {
    res.header('Content-type', 'application/json');
    // VALIDATE THE USER INPUT AKA.: REQ.BODY
    // try to connect to the db and 'save' the new resource (a recipe)
    // prepare response for the client, or error (has to be sent to the client too)

    try {
        const {error} = Recipe.validate(req.body);
        if (error) throw {statusCode: 400, errorMessage:`Incorrectly formatted payload.`, errorObj: error}

        const recipeToSendToDB = new Recipe(req.body);
        const recipe = await recipeToSendToDB.create()
        
        return res.send(JSON.stringify(recipe));

    } catch (err) {
        if (err.statusCode) return res.status(err.statusCode).send(JSON.stringify(err));
        return res.status(500).send(JSON.stringify(err));
    }


})

// *** DELETE routes ***

// DELETE [auth, admin, check] /api/recipes/:recipeid
//
//
router.delete('/:recipeid', [auth, admin, check], async (req, res) => {
    // validate recipeid (in req.params)
   
    // call Recipe.readById(req.params.recipeid)
    // call recipe.delete()
    //      !!! IMPORTANT:  deleting from a DB is NOT a simple problem, while it is easy to remove a record from a table
    //                      you have to make sure that all references to that record are also removed (from all other tables)
    //                      and even then, the question remains: is the loss of information OK in the system, or
    //                      should 'deletion' be handled differently? read article: https://www.infoq.com/news/2009/09/Do-Not-Delete-Data/
    //                                      
    // respond with recipe - that has been removed from the DB
    // if error respond with error

    try {
        // validate recipeid
        const schema = Joi.object({
            recipeid: Joi.number()
                .integer()
                .min(1)
                .required()
        });

        const { error } = schema.validate(req.params);
        if (error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: error }

        // check if req.recipe.recipeid == req.params.recipeid
        // if (req.recipe.recipeid == req.params.recipeid) throw { statusCode: 403, errorMessage: `Request denied: cannot delete recipe`, errorObj: {} }

        //console.log('whatever');

        // call Recipe.readById(req.params.recipeid)
        const recipe = await Recipe.readById(req.params.recipeid);
        
        // call recipe.delete()
        const deletedRecipe = await recipe.delete();

        // respond with deletedRecipe
        return res.send(JSON.stringify(deletedRecipe));

    } catch (err) { // if error
        if (err.statusCode) {   // if error with statusCode, send error with status: statusCode 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode, send error with status: 500
    }

})



module.exports = router;