const Joi = require('joi');
const sql = require('mssql');

const config = require('config');
const con = config.get('dbConfig_UCN');

const _ = require('lodash');
const Profile = require('./profile');
const { create, reject } = require('lodash');

class Recipe {
    constructor(recipeObj) {
        if (recipeObj.recipeid) {
            this.recipeid = recipeObj.recipeid
        };
        this.recipename = recipeObj.recipename;
        this.recipedesc = recipeObj.recipedesc;
        this.recipekcal = recipeObj.recipekcal;
        this.FK_profileid = (recipeObj.FK_profileid);
        this.recipeimg = (recipeObj.recipeimg);
        this.recipeingredients = (recipeObj.recipeingredients);
        this.FK_recipetypeid = (recipeObj.FK_recipetypeid);
        this.FK_poststatusid = (recipeObj.FK_poststatusid);
        this.profile = recipeObj.profile;
    }

    static validationSchema() {
        //console.log('hello');
        const schema = Joi.object({
            recipeid: Joi.number()
                .integer()
                .min(1),
            recipename: Joi.string()
                .max(255),
            recipedesc: Joi.string()
                .max(400),
            recipekcal: Joi.number()
                .integer(),
            recipeimg: Joi.string()
                .uri()
                .max(255),
            recipeingredients: Joi.string()
                .max(300),
            FK_recipetypeid: Joi.number()
                .integer()
                .min(1),
            FK_poststatusid: Joi.number()
                .integer()
                .min(1),
            FK_profileid: Joi.number()
                .integer()
                .min(1),
            profile: Joi.object({
                profileid: Joi.number()
                    .integer()
                    .min(1),
                displayname: Joi.string()
                    .max(50),
                profiledesc: Joi.string()
                    .max(255)
                    .allow(null)
            })

        })

        return schema;
    }

    static validate(recipeObj) {
        const schema = Recipe.validationSchema();

        return schema.validate(recipeObj);
    }

    static readAll() {
        return new Promise((resolve, reject) => {
            (async () => {
                // open connection to DB
                // query DB
                // restructure the result into JS object format (the way i need it)
                // validate my restructured structure
                // if all good --> resolve with restructured results
                // if error --> reject with error
                // CLOSE THE DB CONNECTION

                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .query(`
                        SELECT *
                        FROM genRecipe r

                            INNER JOIN genProfile p
                            ON p.profileid = r.FK_profileid

                            INNER JOIN genRecipeType rt
                            ON r.FK_recipetypeid = rt.recipetypeid

                        ORDER BY r.recipeid, p.profileid, rt.recipetypeid 
                    `)
                    //console.log('hello 2')
                    // here comes the restructuring part...
                    const recipeBinder = []
                    // let binderLastIndex = -1; --> we don't need this part because for us one recipe can only have one profile
                    result.recordset.forEach(record => {
                        // add new recipe
                        const newRecipe = {
                            recipeid: record.recipeid,
                            recipename: record.recipename,
                            recipedesc: record.recipedesc,
                            recipekcal: record.recipekcal,
                            FK_profileid: record.FK_profileid,
                            recipeimg: record.recipeimg,
                            recipeingredients: record.recipeingredients,
                            FK_recipetypeid: record.FK_recipetypeid,
                            profile:
                            {
                                profileid: record.profileid,
                                displayname: record.displayname,
                                profiledesc: record.profiledesc
                            }
                        }
                        recipeBinder.push(newRecipe);
                    })

                    // and now we validate
                    const recipes = [];
                    recipeBinder.forEach(recipe => {
                        const { error } = Recipe.validate(recipe);
                        if (error) throw { statusCode: 500, errorMessage: `Corrupt Recipe information in the database, recipeid: ${recipe.recipeid}`, errorObj: error }

                        recipes.push(new Recipe(recipe));
                    })

                    resolve(recipes);

                } catch (err) {
                    reject(err);
                }

                sql.close();
            })();
        })
    }

    // readById
    // staic readById(recipeid) returns a Promise
    //      if successful - resolves with recipe, where recipe.recipeid == recipeid
    //      if unsuccessful - rejects with error
    // e.g. const recipe = await Recipe.readById(recipeid)
    // identical to readByEmail, only difference is in the WHERE clause in the sql query 
    // minimal comments, check readByEmail for details
    //
    static readById(recipeid) {
        return new Promise((resolve, reject) => {   // *** *** *** returns a Promise
            (async () => {  // *** *** *** asynchronous anonymus function expression
                // open connection to DB
                // query the recipe table joined with the role table where recipeid is the recipe's id
                // check if we have exactly 1 result
                // validate the recipe
                // resolve recipe
                // if any error --> reject with error
                // CLOSE THE DB CONNECTION

                try {
                    const pool = await sql.connect(con);    // open DB connection
                    const result = await pool.request()     // query the recipe table joined role table, where recipeid matches
                        .input('recipeid', sql.Int(), recipeid)  // setting up recipeid as SQL variable
                        .query(`    
                            SELECT *
                            FROM genRecipe r

                            INNER JOIN genProfile p
                            ON p.profileid = r.FK_profileid

                            INNER JOIN genRecipeType rt
                            ON r.FK_recipetypeid = rt.recipetypeid

                            WHERE r.recipeid = @recipeid

                            ORDER BY r.recipeid, p.profileid, rt.recipetypeid 
                           
                        `)

                    // recipeid is primary key in the genRecipe table, we expect to see exactly one result
                    if (result.recordset.length > 1) throw { statusCode: 500, errorMessage: `Corrupt DB, mulitple recipes with recipeid: ${recipeid}`, errorObj: {} };
                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Recipe not found by recipeid: ${recipeid}`, errorObj: {} };

                    // need to convert the result.recordset into the format of Recipe object
                    const recipeWannabe = {
                            recipeid: result.recordset[0].recipeid,
                            recipename: result.recordset[0].recipename,
                            recipedesc: result.recordset[0].recipedesc,
                            recipekcal: result.recordset[0].recipekcal,
                            FK_profileid: result.recordset[0].FK_profileid,
                            recipeimg: result.recordset[0].recipeimg,
                            recipeingredients: result.recordset[0].recipeingredients,
                            FK_recipetypeid: result.recordset[0].FK_recipetypeid,
                            profile:
                            {
                                profileid: result.recordset[0].profileid,
                                displayname: result.recordset[0].displayname,
                                profiledesc: result.recordset[0].profiledesc
                            }
                        }
                    

                    // after restructuring the DB result into the object-wannabe, it has to be validated    
                    const { error } = Recipe.validate(recipeWannabe);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, recipe does not validate: ${recipeWannabe.recipeid}`, errorObj: error };

                    // resolve with a new Recipe object
                    resolve(new Recipe(recipeWannabe));

                } catch (err) { // if anything went wrong
                    reject(err);    // reject with error 
                }

                sql.close();    // CLOSE THE DB CONNECTION

            })();   // *** *** *** Immediately Invoked Function Expression (IIFE) --> (function expression)();
        })
    }



    //  |
    //  |
    //  \/
    // Well, the part below; we tried but did not manage to FIX and finish

    create() {
        return new Promise((resolve, reject) => {
            (async () => {
                // open connection to DB
                // query DB (INSERT INTO genRecipe and get the new recipe's id)
                // query DB (SELECT * about the recipe)
                // restructure the DB response into JS obj format
                //      validate the obj
                // if OK --> resolve with recipe
                // if any error --> reject with error
                // CLOSE THE DB CONNECTION

                try {
                    // here should check if the recipe is already in the DB
                    // if it is --> should stop the create() method and reject with an error
                    //      e.g. 409 Conflict status code
                    // else --> let's do what we need to...

                    const pool = await sql.connect(con);
                    const resultRecipe = await pool.request()
                        .input('recipename', sql.NVarChar(), this.recipename)
                        .input('recipedesc', sql.NVarChar(), this.recipedesc)
                        .input('recipekcal', sql.Int(), this.recipekcal)
                        .input('FK_accountid', sql.Int(), this.FK_accountid)
                        .input('FK_profileid', sql.Int(), this.FK_profileid)
                        .input('recipeimg', sql.NVarChar(), this.recipeimg)
                        .input('recipeingredients', sql.NVarChar(), this.recipeingredients)
                        .input('FK_recipetypeid', sql.Int(), this.FK_recipetypeid)
                        .input('FK_poststatusid', sql.Int(), this.FK_poststatusid)
                        .query(`
                            INSERT INTO genRecipe
                                ([recipename], [recipedesc], [recipekcal], [FK_accountid], [FK_profileid], [recipeimg], [recipeingredients], [FK_recipetypeid], [FK_poststatusid])
                            VALUES
                                (@recipename, @recipedesc, @recipekcal, @FK_accountid, @FK_profileid, @recipeimg, @recipeingredients, @FK_recipetypeid, @FK_poststatusid);
                            SELECT *
                            FROM genRecipe r
                            WHERE r.recipeid = SCOPE_IDENTITY()
                        `)

                    // keep tabs on the newly inserted recipe's recipeid
                    if (!resultRecipe.recordset[0]) throw { statusCode: 500, errorMessage: `INSERT failed.`, errorObj: {} }


                    sql.close();

                    const recipe = await Recipe.readById(this.recipeid);

                    resolve(recipe);

                } catch (err) {
                    reject(err);
                }

                sql.close();
            })();
        })
    }

    delete() {

        return new Promise((resolve, reject) => {
    
          (async () => {
    
            try {
    
              const recipe = await Recipe.readById(this.recipeid);
              const pool = await sql.connect(con);
              let result;
              result = await pool.request()
    
                .input('recipeid', sql.Int(), this.recipeid)
    
                .query(`
    
                  DELETE FROM genRecipe
    
                  WHERE recipeid = @recipeid
    
                `)
    
              resolve(recipe);
    
            } catch (err) {
    
              reject(err);
    
            }
    
            sql.close();
    
          })()
    
        })
    
      }


}

module.exports = Recipe;