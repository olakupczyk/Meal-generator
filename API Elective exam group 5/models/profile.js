
const Joi = require('joi');
const sql = require('mssql');

const config = require('config');
const con = config.get('dbConfig_UCN');


class Profile {
    constructor(profileObj) {
        if (profileObj.profileid) {
            this.profileid = profileObj.profileid;
        }

        this.displayname = profileObj.displayname;

        if (profileObj.profiledesc) {
            this.profiledesc = profileObj.profiledesc;
        }

    }

    static validate(profileObj) {
        const schema = Joi.object({
            profileid: Joi.number()
                .integer()
                .min(1),
            displayname: Joi.string()
                .max(50)
                .required(),
            profiledesc: Joi.string()
                .max(255)
                .allow(null)
        })

        return schema.validate(profileObj);
    }



    static validateCredentials(credentialsObj) {
        const schema = Joi.object({
            displayname: Joi.string()
                .max(50)
                .required(),
            profiledesc: Joi.string()
                .max(255)
        })

        return schema.validate(credentialsObj);
    }

    static checkCredentials(credentialsObj) {
        return new Promise((resolve, reject) => {
            (async () => {
                // find the account --> Account.readByEmail(credentialsObj.email)
                // connect to the DB
                // query the DB for the account's password
                // compare the password and the hash
                // if OK --> resolve with Account obj (the one we had from the readByEmail)
                // if not OK --> reject with error
                // CLOSE THE DB CONNECTION!

                try {
                    const profile = await Profile.readByEmail(credentialsObj.displayname);

                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('profileid', sql.Int(), profile.profileid)
                        .query(`
                            SELECT *
                            FROM genAccount ac
                            WHERE ac.FK_profileid = @profileid
                        `)

                    if (result.recordset.length != 1) throw { statusCode: 500, errorMessage: `Corrupt DB.`, errorObj: {} }

                    // const hashedpassword = result.recordset[0].hashedpassword;

                    // // need to compare the password with the hash
                    // const okCredentials = bcrypt.compareSync(credentialsObj.password, hashedpassword);
                    // if (!okCredentials) throw { statusCode: 401 };

                    resolve(profile);

                } catch (err) {
                    if (err.statusCode) reject({ statusCode: 401, errorMessage: `Invalid profile`, errorObj: {} })
                    reject(err)
                }

                sql.close();
            })();
        })
    }

    /*
        <static> yourMethodName(){
            return new Promise((resolve, reject) => {   // promise definition
                (async () => {  // asynchrounous anonymous function
    
                })();   // immediately-invoked function expression: IIFE "iffy"
            })
        }
    */



    static readAll() {
        return new Promise((resolve, reject) => {   // promise definition
            (async () => {  // asynchrounous anonymous function
                // open connection to DB
                // query DB
                // restructure the DB response into the obj format we need
                //      validate the obj
                // if all good --> resolve with the obj(s)
                // if any error --> reject with the error information
                // CLOSE THE DB CONNECTION

                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .query(`
                            SELECT *
                            FROM genProfile
                        `);

                    const profiles = [];
                    result.recordset.forEach(record => {
                        const prafileWannabe = {
                            profileid: record.profileid,
                            displayname: record.displayname,
                            profiledesc: record.profiledesc
                        }

                        const { error } = Profile.validate(profileWannabe);
                        if (error) throw { statusCode: 500, errorMessage: `Corrupt Profile information in the database, profileid: ${profileWannabe.profileid}` }

                        profiles.push(new Profile(profileWannabe));
                    })

                    resolve(profiles);

                } catch (err) {
                    reject(err);
                }

                sql.close();
            })();   // immediately-invoked function expression: IIFE "iffy"
        })
    }

    // static readById(profileid)
    //
    static readById(profileid) {
        return new Promise((resolve, reject) => {   // *** returns Promise
            (async () => {  // *** async anon function
                // open connection to DB
                // query DB (SELECT all columns FROM profile table WHERE profileid)
                // check if exactly one result
                // restructure profileWannabe
                // valdiate profileWannabe
                // resolve with profile
                // if error --> reject with error
                // CLOSE DB CONNECTION

                try {
                    // open connection to DB
                    const pool = await sql.connect(con);

                    // query DB (SELECT all columns FROM profile table WHERE profileid)
                    const result = await pool.request()
                        .input('profileid', sql.Int(), profileid)
                        .query(`
                            SELECT *
                            FROM genProfile a
                            WHERE a.profileid = @profileid
                        `)

                    // check if exactly one result: profileid is primary key in the genProfile table, we expect to see exactly one result
                    if (result.recordset.length > 1) throw { statusCode: 500, errorMessage: `Corrupt DB, mulitple profiles with profileid: ${profileid}`, errorObj: {} };
                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Profile not found by profileid: ${profileid}`, errorObj: {} };

                    // restructure profileWannabe
                    const profileWannabe = {
                        profileid: result.recordset[0].profileid,
                        displayname: result.recordset[0].displayname,
                        profiledesc: result.recordset[0].profiledesc
                    }


                    // valdiate profileWannabe
                    const { error } = Profile.validate(profileWannabe);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, profile does not validate: ${profileWannabe.profileid}`, errorObj: error };

                    // resolve with profile
                    resolve(new Profile(profileWannabe))

                } catch (err) {
                    reject(err) // reject with error
                }

                sql.close();    // CLOSE DB CONNECTION

            })();   // *** IIFE
        })
    }

    //   static readByName(firstname, lastname)

    static readByName(displayname) {
        return new Promise((resolve, reject) => {   // *** returns Promise
            (async () => {  // *** async anon function
                // open connection to DB
                // query DB 
                // check if exactly one result
                // restructure profileWannabe
                // valdiate profileWannabe
                // resolve with profile
                // if error --> reject with error
                // CLOSE DB CONNECTION

                try {
                    // open connection to DB
                    const pool = await sql.connect(con);

                    // query DB (SELECT all columns FROM profile table WHERE profileid)
                    const result = await pool.request()
                        .input('displayname', sql.NVarChar(), displayname)
                        .query(`
                            SELECT *
                            FROM genProfile p
                            WHERE p.displayname = @displayname
                        `)

                    // check if exactly one result: displayname in the genProfile table, we expect to see exactly one result
                    if (result.recordset.length > 1) throw { statusCode: 500, errorMessage: `Corrupt DB, mulitple profiles with name: ${displayname}`, errorObj: {} };
                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Profile not found by name: ${displayname}`, errorObj: {} };

                    // restructure profileWannabe
                    const profileWannabe = {
                        profileid: result.recordset[0].profileid,
                        displayname: result.recordset[0].displayname,
                        profiledesc: result.recordset[0].profiledesc
                    }



                    // valdiate profileWannabe
                    const { error } = Profile.validate(profileWannabe);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, profile does not validate: ${profileWannabe.profileid}`, errorObj: error };

                    // resolve with profile
                    resolve(new Profile(profileWannabe))

                } catch (err) {
                    reject(err) // reject with error
                }

                sql.close();    // CLOSE DB CONNECTION

            })();   // *** IIFE
        })
    }


    static readAll(queryObj) {
        return new Promise((resolve, reject) => {   // *** returns Promise
            (async () => {  // *** async anon function
                // prepare query string
                // open connection to DB
                // query DB with query string --> if queryObj, there is a WHERE clause and that needs input()
                // restructure the result
                // validate the result
                // resolve with array of profiles
                // if error --> reject with error
                // CLOSE THE DB CONNECTION

                try {
                    // prepare query string
                    let queryString = `
                        SELECT *
                        FROM genProfile p
                    `;

                    let qcolumnname;
                    let qtype;
                    if (queryObj) {
                        switch (queryObj.query) {
                            case ('displayname'):
                                qcolumnname = 'displayname';
                                qtype = sql.NVarChar();
                                break;
                            default: break;
                        }

                        queryString += `
                            WHERE a.${qcolumnname} = @var
                        `;
                    }

                    // open connection to DB
                    const pool = await sql.connect(con);

                    // query DB with query string --> if queryObj, there is a WHERE clause and that needs input()
                    let result;
                    if (queryObj) {
                        result = await pool.request()
                            .input('var', qtype, queryObj.value)
                            .query(queryString)
                    } else {
                        result = await pool.request()
                            .query(queryString)
                    }

                    // restructure and validate the result
                    const profiles = [];
                    result.recordset.forEach(record => {
                        // restructure the result
                        const profileWannabe = {
                            profileid: record.profileid,
                            displayname: record.displayname,
                            profiledesc: record.profiledesc
                        }

                        // valdiate profileWannabe
                        const { error } = Profile.validate(profileWannabe);
                        if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, profile does not validate: ${profileWannabe.profileid}`, errorObj: error };

                        // push a new Profile object into profiles array
                        profiles.push(new Profile(profileWannabe));
                    })

                    // resolve with array of profiles
                    resolve(profiles)

                } catch (err) {
                    reject(err);    // reject with error
                }

                sql.close();    // CLOSE DB CONNECTION

            })();   // *** IIFE
        })
    }

    // create()
    //
    create() {
        return new Promise((resolve, reject) => {   // *** returns Promise
            (async () => {  // *** async anon function
            
                // open connection to DB
                // query DB --> INSERT INTO genProfile; SELECT WHERE profileid = SCOPE_IDENTITY()
                // in this case the profile is being created ONLY while creating the new account - nowhere else
                // check integrity (a.k.a. exactly 1 result)
                // "restructure" result --> profileid
                // close db
                // call Profile.readById(profileid)
                // resolve with profile
                // if error --> reject with error
                // CLOSE DB CONNECTION

                try {
                    // open connection to DB
                    const pool = await sql.connect(con);

                    // query DB --> INSERT INTO genProfile; SELECT WHERE profileid = SCOPE_IDENTITY()
                    const resultProfile = await pool.request()
                        .query(`
                            INSERT INTO genProfile
                            ([displayname])
                            VALUES
                            ('Anonym')
                           ;
                            SELECT *
                            FROM genProfile p
                            WHERE p.profileid = SCOPE_IDENTITY()
                        `)
                    //console.log(resultProfile.recordset);
                    // check integrity (a.k.a. exactly 1 result)     
                    if (resultProfile.recordset.length != 1) throw { statusCode: 500, errorMessage: `INSERT INTO profile table failed`, errorObj: {} }

                    // "restructure" result
                    const profileid = resultProfile.recordset[0].profileid;

                    // close db
                    sql.close();

                    // call Profile.readById(profileid) 
                    const profile = await Profile.readById(profileid);

                    // resolve with profile
                    resolve(profile);

                } catch (err) {
                    reject(err);    // reject with error
                }

                sql.close();    // CLOSE DB CONNECTION

            })();   // *** IIFE
        })
    }

    // update()
    //
    update() {
        return new Promise((resolve, reject) => {   // *** returns Promise
            (async () => {  // *** async anon function
                //  we want to allow changing displayname, profiledesc             
                //
                // call Profile.readById(this.profileid)
                // open connection to DB
                // query DB --> UPDATE genProfile WHERE profileid
                // close db
                // call Profile.readById(this.profileid)
                // resolve with profile
                // if error --> reject with error
                // CLOSE DB CONNECTION

                try {
                    let tmpResult;
                    // call Profile.readById(this.profileid)
                    tmpResult = await Profile.readById(this.profileid);

                    // open connection to DB
                    const pool = await sql.connect(con);

                    // query DB --> UPDATE genProfile WHERE profileid
                    tmpResult = await pool.request()
                        .input('profileid', sql.Int(), this.profileid)
                        .input('displayname', sql.NVarChar(), this.displayname)
                        .input('profiledesc', sql.NVarChar(), this.profiledesc)
                        .query(`
                            UPDATE genProfile
                            SET displayname = @displayname, profiledesc = @profiledesc
                            WHERE profileid = @profileid
                        `)

                    // close db
                    sql.close();

                    // call Profile.readById(this.profileid)
                    const profile = await Profile.readById(this.profileid);

                    // resolve with profile
                    resolve(profile);

                } catch (err) {
                    // reject with error
                    reject(err);
                }

                sql.close();    // CLOSE DB CONNECTION

            })(); // *** IIFE
        })
    }

}

module.exports = Profile;