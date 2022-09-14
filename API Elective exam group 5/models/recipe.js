
const Joi = require('joi');
const sql = require('mssql');

const config = require('config');
const con = config.get('dbConfig_UCN');

const _ = require('lodash');
const RecipeAuthor = require('./recipeauthor');
const { max } = require('lodash');

class Recipe {
    constructor(recipeObj) {
        if (recipeObj.recipeid) {
            this.recipeid = recipeObj.recipeid
        };
        this.recipename = recipeObj.recipename;
        this.recipedesc = recipeObj.recipedesc;
        this.recipekcal = recipeObj.recipekcal;
     //   this.authors = _.cloneDeep(recipeObj.authors);
     //   this.recipeimg = recipeObj.recipeimg;
        this.recipeingredients = recipeObj.recipeingredients;
    // status?
    // recipe type?
    }

    static validationSchema() {
        const schema = Joi.object({
            recipeid: Joi.number()
                .integer()
                .min(1),
            recipename: Joi.string()
                .max(255)
                .required(),
            recipedesc: Joi.string()
                .max(max),
            recipekcal: Joi.number()
                .integer(),
            // recipeimg: Joi.image()
            //     .img()
            recipeingredients: Joi.string()
                .max(max)
        })

        return schema;
    }


    static validate(recipeObj) {
        const schema = Recipe.validationSchema();

        return schema.validate(recipeObj);
    }

    static readAll() {
        // console.log('hello');
        return new Promise((resolve, reject) => {
            (async () => {
                // open connection to DB
                // query DB
                // restructure the result into JS format (the way I need it)
                // validate my restructure structure
                // if all good --> resolve with restructured results
                // if error --> reject with arror
                // CLOSE THE DB CONNECTION

                try {
                    const pool = await sql.connect(con); //await because we don't know what is going to happen
                    //    console.log(pool);
                    const result = await pool.request()
                        .query(`
                        SELECT *
                        FROM genRecipe r
                            INNER JOIN genRecipeAuthor ra
                            ON r.recipeid = ra.FK_recipeid
                                INNER JOIN genProfile p
                                ON ra.FK_profileid = r.profileid
                        ORDER BY b.recipeid, a.profileid
                    `);
                    // here comes the restructuring part
                    // const recipeBinder = []
                    // let binderLastIndex = -1;
                    // result.recordset.forEach(record => {
                    //     if (!recipeBinder[binderLastIndex] || record.recipeid != recipeBinder[binderLastIndex].recipeid) {
                    //         // add new Recipe
                    //         const newRecipe = {
                    //             recipeid: record.recipeid,
                    //             recipename: record.recipename,
                    //             recipedesc: record.recipedesc,
                    //             recipekcal: record.recipekcal,
                    //         //     authors: [

                    //         //         {
                    //         //             authorid: record.authorid,
                    //         //             firstname: record.firstname,
                    //         //             lastname: record.lastname,
                    //         //             biolink: record.biolink
                    //         //         }
                    //         //     ]
                    //         // }

                    //             recipeingredients: record.recipeingredients,

                    //         // console.log(newBook);

                    //         recipeBinder.push(newRecipe);
                    //         binderLastIndex++;

                    //     } else {
                    //         // add new author to the existing last added recipe
                    //         const newRecipeAuthor = {
                    //             recipeauthorid: record.recipeauthorid,
                    //             firstname: record.firstname,
                    //             lastname: record.lastname,
                    //             biolink: record.biolink
                    //         }

                    //         bookBinder[binderLastIndex].authors.push(newAuthor);
                    //     }

                    // })

                    //and now we validate
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
}
//     create() {
//         return new Promise((resolve, reject) => {
//             (async () => {
//                 // open connection to DB
//                 // query DB (INSERT INTO libtBook and get the new book's id)
//                 // query DB (INSERT INTO librBookAuthor for each author the book has)
//                 // query DB (SELECT * about the book)
//                 // restructure the DB response into JS object format
//                 //      validate the obj
//                 // of OK --> resolve with book
//                 // if any error --> reject with error
//                 // CLOSE THE DB CONNECTION

//                 try {
//                     // here should check if the book is already in the DB
//                     //if it is --> should stop the create() method and reject with an error
//                     //      e.g 409 Conflict status code
//                     // else --> let's do what we need to do...

//                     //      also check all the author ids if they exist in the DB before moving on

//                     const pool = await sql.connect(con);
//                     let result = await pool.request()
//                         .input('name', sql.NVarChar(), this.recipename) // it is important that the first parameter is always a string
//                         .input('description', sql.NVarChar(), this.recipedesc)
//                         .input('kcal', sql.Int(), this.recipekcal)
//                         .input('ingredients', sql.NVarChar(), this.recipeingredients )
//                         .query(`
//                             INSERT INTO genRecipe
//                                 ([recipename], [recipedesc], [recipekcal], [recipeingredients]) 
//                             VALUES
//                                 (@recipename, @recipedesc, @recipekcal, @recipeingredients);

//                             SELECT * 
//                             FROM genRecipe
//                             WHERE recipeid = SCOPE_IDENTITY()
//                         `)

//                     // keep tabs on the newly inserted book's bookid
//                     if (!result.recordset[0]) throw { statusCode: 500, errorMessage: `INSERT failed.`, errorOnj: {} } //if I don't have anything there then i throw an error
//                     const recipeid = result.recordset[0].bookid;

//                     // for each author we need to insert a new row into the librBookAuthor table
//                     //cannot do it directly, due to 'await' does not work inside forEach loop
//                     // so instead, we create a string with all the vlue cominations needed to be inserted
//                     // and will query the DB just once, will all the necessary values
//                     let insertValues = '';
//                     this.authors.forEach(author => { // for all the authors
//                         insertValues += `(${recipeid},${author.authorid}),`;

//                     })

//                     insertValues = _.trimEnd(insertValues, ',');
//                     result = await pool.request()
//                         .query(` 
//                             INSERT INTO librBookAuthor
//                                 ([FK_bookid], [FK_authorid])
//                             VALUES
//                                 ${insertValues}
//                         `)

//                     // select the book with the new id (aka the one we just inserted)
//                     // from the joined tables
//                     result = await pool.request()
//                         .input('bookid', sql.Int(), bookid) // 'bookid' --> 'I could call it pink unicorn if I wanted'
//                         .query(`
//                             SELECT *
//                             FROM librBook b
//                             INNER JOIN librBookAuthor ba
//                             ON b.bookid = ba.FK_bookid
//                                 INNER JOIN librAuthor a
//                                 ON ba.FK_authorid = a.authorid
//                         WHERE b.bookid = @bookid
//                         ORDER BY a.authorid
//                         `)

//                     // ready to restructure into the Book format
//                     const bookBinder = []
//                     let binderLastIndex = -1;
//                     result.recordset.forEach(record => {
//                         if (!bookBinder[binderLastIndex] || record.bookid != bookBinder[binderLastIndex].bookid) {
//                             // add new book
//                             const newBook = {
//                                 bookid: record.bookid,
//                                 title: record.title,
//                                 year: record.year,
//                                 wikilink: record.wikilink,
//                                 authors: [

//                                     {
//                                         authorid: record.authorid,
//                                         firstname: record.firstname,
//                                         lastname: record.lastname,
//                                         biolink: record.biolink
//                                     }
//                                 ]
//                             }
//                             // console.log(newBook);
//                             bookBinder.push(newBook);
//                             binderLastIndex++;

//                         } else {
//                             // add new author to the existing last added book
//                             const newAuthor = {
//                                 authorid: record.authorid,
//                                 firstname: record.firstname,
//                                 lastname: record.lastname,
//                                 biolink: record.biolink
//                             }

//                             bookBinder[binderLastIndex].authors.push(newAuthor);
//                         }

//                     })

//                     if (bookBinder.length != 1) throw { statusCode: 500, errorMessage: `Inconsistent DB after INSERT, bookid: ${bookid}`, errorObj: {} }

//                     const { error } = Book.validate(bookBinder[0]);
//                     if (error) throw { statusCode: 500, errorMessage: `Corrupt Book information in the database, bookid: ${bookid}`, errorObj: error }

//                     resolve(new Book(bookBinder[0]));


//                 } catch (err) {
//                     reject(err)
//                 }

//                 sql.close();

//             })();
//         })
//     }
// }

// module.exports = Book;