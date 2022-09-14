const Joi = require('joi');
const sql = require('mssql');

const config = require('config');
const con = config.get('dbConfig_UCN');

class RecipeAuthor {
    constructor(recipeauthorObj) {
        if (recipeauthorObj.profileid) {
            this.profileid = recipeauthorObj.profileid;
        }

        this.displayname = recipeauthorObj.displayname;
        this.profiledesc = recipeauthorObj.profiledesc;
        
    }

    static validationSchema() {
        const schema = Joi.object({
            profileid: Joi.number()
                .integer()
                .min(1),
            displayname: Joi.string()
                .max(50)
                .required(),
            profiledesc: Joi.string()
                .max(255)
        })
        return schema;
    }


    static validate(recipeauthorObj) {
        const schema = RecipeAuthor.validationSchema();

        return schema.validate(recipeauthorObj);
    }

    static readAll() {
        return new Promise((resolve, reject) => { //promise definition
            (async () => { //asynchrounous anonymus function

                // open connection to DB
                // query DB
                // restructure the DB response into the obj format we need
                // validate the obj
                // if all good --> resolve with the obj(s)
                // if any error --> reject with the error information
                // CLOSE the DB connection

                try {
                    const pool = await sql.connect(con); // to use the 'await', the method needs to be asynchrounous (!)
                    const result = await pool.request()
                        .query(`
                            SELECT *
                            FROM genRecipeAuthor
                        `);

                    const recipeauthors = [];
                    result.recordset.forEach(record => {
                        const recipeauthorWannabe = {
                            profileid: record.profileid,
                            displayname: record.displayname,
                            profiledesc: record.profiledesc
                        }

                        const { error } = RecipeAuthor.validate(recipeauthorWannabe);
                        if (error) throw { statusCode: 500, errorMessage: `Corrupt Recipe Author information in the database, recipeauthorid: ${recipeauthorWannabe.profileid}` }

                        recipeauthors.push(new RecipeAuthor(recipeauthorWannabe));
                    })

                    resolve(recipeauthors);

                } catch (err) {
                    reject(err);
                }

                sql.close();

            })(); //immediately-ivoked function expression: IIFE "iffy"
        })
    }

}

module.exports = RecipeAuthor; // whenever we are working with modules, we are exporting the class