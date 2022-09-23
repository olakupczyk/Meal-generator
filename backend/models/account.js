const config = require('config');
const con = config.get('dbConfig_UCN');
const sql = require('mssql');
const Joi = require('joi');
const bcrypt = require('bcryptjs');


class Account {
    constructor(accountObj) {
        /*
        {
            accountid,  -- "optional"
            accountemail,
            accountgenname,
            profileid,  
            role: {
                roleid,
                rolename    -- optional -- for simplicity's sake when adding a new user to the system
            }
        }
        */
        if (accountObj.accountid) {
            this.accountid = accountObj.accountid;
        }
        this.accountgenname = accountObj.accountgenname;
        this.accountemail = accountObj.accountemail;
        
        this.profileid = accountObj.profileid;

        this.role = {}; // role is set by default and there is no input done by the user 

        if (accountObj.role) {
            this.role.roleid = accountObj.role.roleid;
            if (accountObj.role.rolename) {
                this.role.rolename = accountObj.role.rolename;
            }
        }
    }

    static validationSchema() {
        const schema = Joi.object({
            accountid: Joi.number()
                .integer()
                .min(1),
            accountgenname: Joi.string()
                .max(50)
                .min(4)
                .required(),
            accountemail: Joi.string()
                .email()
                .max(255)
                .required(),
            profileid: Joi.number()
                .integer()
                .min(1)
                .required(),
            role: Joi.object({
                roleid: Joi.number()
                    .integer()
                    .min(1)
                    .required(),
                rolename: Joi.string()
                    .max(50)
            })
                .required()
        })

        return schema;
    }

    static validate(accountObj) {
        const schema = Account.validationSchema();

        return schema.validate(accountObj);
    }

    static validateCredentials(credentialsObj) {
        const schema = Joi.object({
            accountemail: Joi.string()
                .email()
                .max(255)
                .required(),
            password: Joi.string()
                .required()
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
                    const account = await Account.readByEmail(credentialsObj.accountemail);

                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('accountid', sql.Int(), account.accountid)
                        .query(`
                            SELECT *
                            FROM genPassword p
                            WHERE p.FK_accountid = @accountid
                        `)

                    if (result.recordset.length != 1) throw { statusCode: 500, errorMessage: `Corrupt DB.`, errorObj: {} }

                    const hashedpassword = result.recordset[0].hashedpassword;

                    // need to compare the password with the hash
                    const okCredentials = bcrypt.compareSync(credentialsObj.password, hashedpassword);
                    if (!okCredentials) throw { statusCode: 401 };

                    resolve(account);

                } catch (err) {
                    if (err.statusCode) reject({ statusCode: 401, errorMessage: `Invalid email or password`, errorObj: {} })
                    reject(err)
                }

                sql.close();
            })();
        })
    }


    static readByEmail(accountemail) {
        return new Promise((resolve, reject) => {
            (async () => {
                // open connection to DB
                // query the DB -- account where email is email
                // check if exactly 1 result, otherwise error
                // restrucutre the DB response into an accountWannabe object
                // validate the accountWannae as Account
                // resolve with new Account object (based on assountWannabe)
                // reject with error
                // CLOSE THE CONNECTION TO DB!!!

                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('accountemail', sql.NVarChar(), accountemail)
                        .query(`
                            SELECT *
                            FROM genAccount a
                            INNER JOIN genRole r
                            ON a.FK_roleid = r.roleid
                            
                           

                            WHERE a.accountemail = @accountemail
                    `)

                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Account not found.`, errorObj: {} }
                    if (result.recordset.length != 1) throw { statusCode: 500, errorMessage: `Corrupt information in DB`, errorObj: {} }

                    // restructuring the DB response
                    const accountWannabe = {
                        accountid: result.recordset[0].accountid,
                        accountemail: result.recordset[0].accountemail,
                        accountgenname: result.recordset[0].accountgenname,
                        profileid: result.recordset[0].FK_profileid,
                        role: {
                            roleid: result.recordset[0].roleid,
                            rolename: result.recordset[0].rolename
                        }
                    }
                    console.log(accountWannabe);
                    // validate accountWannabe as Account
                    const { error } = Account.validate(accountWannabe);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt account information in the database, accountid: ${accountWannabe.accountid}`, errorObj: error }

                    resolve(new Account(accountWannabe));

                } catch (err) {
                    reject(err);
                }
                sql.close();

            })();
        })
    }


    // readById
    // staic readById(accountid) returns a Promise
    //      if successful - resolves with account, where account.accountid == accountid
    //      if unsuccessful - rejects with error
    // e.g. const account = await Account.readById(accountid)
    // identical to readByEmail, only difference is in the WHERE clause in the sql query 
    // minimal comments, check readByEmail for details
    //
    static readById(accountid) {
        return new Promise((resolve, reject) => {   // *** *** *** returns a Promise
            (async () => {  // *** *** *** asynchronous anonymus function expression
                // open connection to DB
                // query the account table joined with the role table where accountid is the account's id
                // check if we have exactly 1 result
                // validate the account
                // resolve account
                // if any error --> reject with error
                // CLOSE THE DB CONNECTION

                try {
                    const pool = await sql.connect(con);    // open DB connection
                    const result = await pool.request()     // query the account table joined role table, where accountid matches
                        .input('accountid', sql.Int(), accountid)  // setting up accountid as SQL variable
                        .query(`    
                            SELECT *
                            FROM genAccount ac
                                INNER JOIN genRole r
                                ON ac.FK_roleid = r.roleid
                            WHERE ac.accountid = @accountid
                        `)

                    // accountid is primary key in the genAccount table, we expect to see exactly one result
                    if (result.recordset.length > 1) throw { statusCode: 500, errorMessage: `Corrupt DB, mulitple accounts with accountid: ${accountid}`, errorObj: {} };
                    if (result.recordset.length == 0) throw { statusCode: 404, errorMessage: `Account not found by accountid: ${accountid}`, errorObj: {} };

                    // need to convert the result.recordset into the format of Account object
                    const accountWannabe = {
                        accountid: result.recordset[0].accountid,
                        accountemail: result.recordset[0].accountemail,
                        accountgenname: result.recordset[0].accountgenname,
                        profileid: result.recordset[0].FK_profileid,
                        role: {
                            roleid: result.recordset[0].roleid,
                            rolename: result.recordset[0].rolename
                        }
                    }

                    // after restructuring the DB result into the object-wannabe, it has to be validated    
                    const { error } = Account.validate(accountWannabe);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, account does not validate: ${accountWannabe.accountid}`, errorObj: error };

                    // resolve with a new Account object
                    resolve(new Account(accountWannabe));

                } catch (err) { // if anything went wrong
                    reject(err);    // reject with error 
                }

                sql.close();    // CLOSE THE DB CONNECTION

            })();   // *** *** *** Immediately Invoked Function Expression (IIFE) --> (function expression)();
        })
    }

    // readAll - with query
    // staic readById(queryObj) returns a Promise
    //      if successful - resolves with all accounts, where "queryObj.query" == "queryObj.value" (if no queryObj, returns with all)
    //      if unsuccessful - rejects with error
    // e.g. const accounts = await Account.readAll(queryObj)
    //
    //  queryObj: { query, value }
    //      query: 'accountemail' or 'roleid' (see API def document)
    //      value: an email or a roleid - depending on query 
    //
    static readAll(queryObj) {
        return new Promise((resolve, reject) => {   // *** *** *** returns a Promise
            (async () => {  // *** *** *** asynchronous anonymus function expression
                // based on queryObj, prepare sql query string
                // open connection to DB
                // query DB with query string --> if queryObj, there is a WHERE clause and that needs input()
                // restructure the result
                // validate the result
                // resolve with array of accounts
                // if error --> reject with error
                // CLOSE THE DB CONNECTION

                try {
                    // prepare query string
                    let queryString = `
                        SELECT *
                        FROM genAccount ac
                            INNER JOIN genRole r
                            ON ac.FK_roleid = r.roleid
                    `;

                    let qcolumnname;
                    let qtype;
                    if (queryObj) {
                        switch (queryObj.query) {
                            case ('accountemail'):
                                qcolumnname = 'accountemail';
                                qtype = sql.NVarChar();
                                break;
                            case ('roleid'):
                                qcolumnname = 'FK_roleid';
                                qtype = sql.Int();
                                break;
                            default: break;
                        }

                        queryString += `
                            WHERE ac.${qcolumnname} = @var
                        `   // 'qcolumnname' is the name of the column in the genAccount (aliased as 'ac' ) 
                        // using 'var' as the sql variable name, will need to setup the input with that name (see below)
                    }

                    const pool = await sql.connect(con);    // open connection to DB

                    // query the DB
                    let result;
                    if (queryObj) { // if there is a queryObj
                        result = await pool.request()
                            .input('var', qtype, queryObj.value)    // the WHERE clause needs an input, calling it 'var'
                            // the sql data type is in variable 'qtype' (see switch structure above)
                            .query(queryString)     // this queryString is with a WHERE clause
                    } else {
                        result = await pool.request()
                            .query(queryString)     // this queryString has no WHERE clause (because there was no queryObj)
                    }

                    // restructure the result AND validate in one go (inside the forEach loop)
                    // the result table has one row per account
                    const accounts = [];
                    result.recordset.forEach(record => {
                        // need to convert the record into the format of Account object
                        const accountWannabe = {
                            accountid: record.accountid,
                            accountemail: record.accountemail,
                            accountgenname: record.accountgenname,
                            profileid: record.FK_profileid,
                            role: {
                                roleid: record.roleid,
                                rolename: record.rolename
                            }
                        }

                        // after restructuring the record into the object-wannabe, it has to be validated    
                        const { error } = Account.validate(accountWannabe);
                        if (error) throw { statusCode: 500, errorMessage: `Corrupt DB, account does not validate: ${accountWannabe.accountid}`, errorObj: error };

                        // push the account into the accounts array
                        accounts.push(new Account(accountWannabe));
                    })

                    // resolve with accounts array
                    resolve(accounts);

                } catch (err) {
                    reject(err);
                }

                sql.close();

            })();   // *** *** *** Immediately Invoked Function Expression (IIFE) --> (function expression)();
        })

    }

    // create method
    // e.g.:
    //  const myNewAccount = new Account(accountObj)
    //  mwNewAccount.create(password)
    //
    //      non-static class method:    it is called by the OBJECT, not through the class (as seen with e.g. Account.readByEmail)
    //                                  that also means, that we have access to the OBJECT's properties via tha 'this' keyword
    //                                  e.g. this.accountemail, this.accountgenname, etc.
    //                                  --> regarding the create(password), as the password is not a property of the account object, we handle it as an input parameter
    //
    create(password) {
        return new Promise((resolve, reject) => {   // *** *** *** returns a Promise
            (async () => {  // *** *** *** asynchronous anonymus function expression
                // check if account already exists based on this.accountemail
                // if found --> REJECT with error, because the resource already exists!
                // if NOT found --> carry on
                //      open connection to DB
                //      query the DB with INSERT INTO genAccount table AND SELECT from the genAccount table by the newly inserted identity
                //          SCOPE_IDENTITY()
                //      hash the password
                //      query the DB with INSERT INTO genPassword with the new id
                //      
                //          restructure the DB (account) result
                //          validate the accountWannabe
                //          ^^ replaced with call Account.readByEmail
                //
                //      close DB connection
                //      call Account.readByEmail(this.accountemail)
                //      resolve with account
                //      if error --> reject with error
                //      CLOSE THE DB CONNECTION

                // !!! IMPORTANT: you cannot have two DB connections open at the same time
                //      since we open and close a connection in every class method with DB access
                //      we CANNOT call another while a connection is already open
                //console.log(this);
                // before a new (unique) resource (i.e. account) can be created, have to check if it is already there 
                try {
                    const account = await Account.readByEmail(this.accountemail);  // success means there IS ALREADY an account with the email

                    // ... and that is considered an error in this case
                    const error = { statusCode: 409, errorMessage: `Account already exists`, errorObj: {} }
                    return reject(error);  // reject with an error 409 - Conflict, return makes sure we are done here, the Promise is returned

                } catch (err) { // if the readByEmail returned with an error, we land here automatically
                    // however, there are two scenarios for error:
                    //  a) the account was not found (does not exist)
                    //  b) there was an actual error
                    //
                    // in case a) we have manually set the error info with statusCode: 404
                    // in case b)   if there is a statusCode, it is something else than 404,
                    //              but can be error w/o statusCode (e.g. DB error, typo, etc) that we did not handle manually
                    //
                    // ^^ based on the above,
                    //      if there is a statusCode and it is 404, that is good for us: the account does not exist and no errors happened (will carry on) 
                    //      meaning --> if there was NO statusCode OR statusCode is NOT EQUAL 404 --> we have an actual error, and should reject with error
                    //
                    if (!err.statusCode || err.statusCode != 404) { // if there was NO statusCode OR statusCode is NOT EQUAL 404
                        return reject(err);    // reject with error, return makes sure we are done here, the Promise is returned
                    }
                }

                try {   // +++ +++ +++ if we reach this point, we are certain that the account does not exist yet and no errors happened (so far... ;) )
                    const pool = await sql.connect(con);    // await opening connection to the DB

                    const resultAccount = await pool.request()  // query the DB, account table
                        .input('accountemail', sql.NVarChar(), this.accountemail)             // setting up email as SQL variable, info is in this.email
                        .input('accountgenname', sql.NVarChar(), this.accountgenname)
                        .input('profileid', sql.Int(), this.profileid)
                        // setting up accountgennname as SQL variable, info is in this.accountgennname
                        // !!! SQL can handle NULL values (the genAccount table accepts NULL as accountgennname)
                        //  but if the accountgennname property is missing from this.accountgennname,
                        //      the value there is UNDEFINED and not NULL,
                        //      thus we did the "let it be null" in the previous line 
                        .query(`
                            INSERT INTO genAccount
                                ([accountemail], [accountgenname], [FK_profileid])
                            VALUES
                                (@accountemail, @accountgenname, @profileid);
                            SELECT *
                            FROM genAccount ac
                            WHERE ac.accountid = SCOPE_IDENTITY()
                        `)  // the DB handles the FK_roleid DEFAULT value, set to 2, as of member
                    // there are two sql queries concatenated here: 1) INSERT INTO; 2) SELECT * FROM WHERE SCOPE_IDENTITY()
                    // nr 2) ensures that we have a resultAccount - (an array that represent) a table with a single row with the newly inserted account

                    //console.log(resultAccount.recordset);
                    
                    // do we have exactly 1 new line inserted?
                    // in any other case than 1 record in resultAccount.recordset, something went wrong
                    if (resultAccount.recordset.length != 1) throw { statusCode: 500, errorMessage: `INSERT INTO account table failed`, errorObj: {} }

                    // +++ +++ +++ if we reach this point, we are half done - the account is the DB, but the password is not in the DB yet

                    // inserting the HASHED password into the genPassword table
                    const hashedpassword = bcrypt.hashSync(password);   // create a hashedpassword from the (raw)password - we got password as the create method's input parameter
                    const accountid = resultAccount.recordset[0].accountid; // the newly inserted account's accountid after the successful insert
                    // resultAccount.recordset[0] exists because there IS one record resultAccount.recordset 

                    const resultPassword = await pool.request()     // query the DB, password table
                        .input('accountid', sql.Int(), accountid)       // setting up accountid as SQL variable, info in local variable accountid (see above)
                        .input('hashedpassword', sql.NVarChar(), hashedpassword) // setting up hashedpassword as SQL variable, info in local variable hashedpassword (see above)
                        .query(`
                            INSERT INTO genPassword
                                ([FK_accountid], [hashedpassword])
                            VALUES
                                (@accountid, @hashedpassword);
                            SELECT *
                            FROM genPassword p
                            WHERE p.FK_accountid = @accountid
                        `)  // two concatenated sql queries, 1) INSERT INTO; 2) SELECT * FROM WHERE -- note there is no SCOPE_IDENTITY() here
                    // the genPassword table does not have an IDENTITY column, we access the password via the FK_accountid
                    // (there is a 1-1 relation between genAccount and genPassword, see the ERD in ./scripts)

                    // do we have exactly 1 new line inserted?
                    // in any other case than 1 record in resultPassword.recordset, something went wrong
                    if (resultPassword.recordset.length != 1) throw { statusCode: 500, errorMessage: `INSERT INTO account table failed`, errorObj: {} }
                    // console.log(resultPassword.recordset[0]);    // for testing purposes, to check if the password looks as we would expect

                    // +++ +++ +++ if we reach this point, we are done with INSERT, but still need to prepare the account object to resolve the Promise with
                    // luckily, we have a method for that already: Account.readByEmail(email) 

                    sql.close();    // but to call the other method, have to close the DB connection here (the readByEmail method will open/close the connection for itself) 

                    const account = await Account.readByEmail(this.accountemail);  // awaiting the result of readByEmail
                    // on success, we have account (in the format we need it in)

                    resolve(account);   // resolve with account

                } catch (err) { // on any error
                    reject(err); // reject with error
                }

                sql.close();    // CLOSE THE DB CONNECTION
                // this is mandatory here, because if any error happens, the sql.close() might never happen in the 'try' block
                // good thing, that sql.close() does not care if there was no connection to close - that does not yield an error

            })();   // *** *** *** Immediately Invoked Function Expression (IIFE) --> (function expression)();
        })
    }

    // update() method
    // e.g.:
    //  const myAccount = await Account.readById(accountid);
    //  // --> overwrite myAccount properties with new values
    //  myAccount.update()
    //
    update() {
        return new Promise((resolve, reject) => {   // *** *** *** returns a Promise
            (async () => {  // *** *** *** asynchronous anonymus function expression
                // call Account.readById(this.accountid) - make sure the account with accountid (primary key) exists
                // open connection to DB
                // query DB with UPDATE WHERE accountid
                // close DB connection
                // call Account.readById(this.accountid) - to read the now updated info from the DB
                // resolve with account
                // if error --> reject with error
                // CLOSE THE DB CONNECTION

                try {
                    let tmpResult;
                    tmpResult = await Account.readById(this.accountid);     // call Account.readById(this.accountid)
                    // purely for ensuring the account with accountid exists
                    // console.log(tmpResult); 

                    const pool = await sql.connect(con);    // open connection to DB
                    tmpResult = await pool.request()     // query DB with UPDATE WHERE accountid, do not care much for the result
                        .input('accountid', sql.Int(), this.accountid)    // setting up accountid as SQL variable, for the WHERE clause
                        .input('roleid', sql.Int(), this.role.roleid)   // setting up roleid as SQL variable
                        .input('accountgenname', sql.NVarChar(), this.accountgenname)   // setting up accountgennname as SQL variable
                        .query(`
                        UPDATE genAccount
                        SET FK_roleid = @roleid, accountgenname = @accountgenname
                        WHERE accountid = @accountid
                    `)  // neither accountid nor email may be updated

                    // console.log(tmpResult);

                    sql.close();    // close DB connection, to allow for calling readById

                    const account = await Account.readById(this.accountid); // call Account readById(this.accountid) - now with the updated information from the DB

                    resolve(account);   // resolve with account

                } catch (err) { // on any error
                    reject(err);    // reject with error
                }

                sql.close();    // CLOSE THE DB CONNECTION

            })();   // *** *** *** Immediately Invoked Function Expression (IIFE) --> (function expression)();
        })
    }

    // updatePassword(password) method
    // e.g.:
    //  const myAccount = await Account.readById(accountid);
    //  myAccount.updatePassword(password)
    //
    updatePassword(password) {
        return new Promise((resolve, reject) => {   // *** *** *** returns a Promise
            (async () => {  // *** *** *** asynchronous anonymus function expression
                // call Account.readById(this.accountid) - make sure the account with accountid (primary key) exists
                // generate hashed password
                // open connection to DB
                // query DB genPassword with UPDATE WHERE FK_accountid = accountid
                // resolve with account (the account was not changed, only the password belonging to account)
                // if error --> reject with error
                // CLOSE THE DB CONNECTION

                try {
                    let tmpResult;
                    const account = await Account.readById(this.accountid); // call Account.readById(this.accountid)

                    const hashedpassword = bcrypt.hashSync(password);   // generate hashed password

                    const pool = await sql.connect(con);    // open connection to DB
                    tmpResult = await pool.request()    // query DB genPassword with UPDATE WHERE FK_accountid = accountid
                        .input('accountid', sql.Int(), this.accountid)
                        .input('hash', sql.NVarChar(), hashedpassword)
                        .query(`
                            UPDATE genPassword
                            SET hashedpassword = @hash
                            WHERE FK_accountid = @accountid
                        `)

                    resolve(account);   // resolve with account

                } catch (err) { // on any error
                    reject(err);    // reject with error
                }

                sql.close();    // CLOSE THE DB CONNECTION

            })();   // *** *** *** Immediately Invoked Function Expression (IIFE) --> (function expression)();
        })
    }

    // delete() method
    // e.g.:
    //  const someAccount = await Account.readById(accountid);
    //  someAccount.delete()
    //
    delete() {
        return new Promise((resolve, reject) => {   // *** *** *** returns a Promise
            (async () => {  // *** *** *** asynchronous anonymus function expression
                // call Account.readById(this.accountid) - make sure the account with accountid (primary key) exists
                // check for any active loans for this.accountid
                //      if yes --> error
                // open connection to DB
                // query DB genPassword --> DELETE WHERE FK_accountid = accountid
                // query DB genAccount --> DELETE WHERE accountid
                // resolve with account
                // if error --> reject with error

                try {
                    // call Account.readById(this.accountid)
                    const account = await Account.readById(this.accountid);

                    // check for any active loans for this.accountid
                    // *** CODE NOT YET AVAILABLE - NEEDS LOAN CLASS

                    let tmpResult;
                    const pool = await sql.connect(con);    // open connection to DB
                    tmpResult = await pool.request()    // query DB genPassword
                        .input('accountid', sql.Int(), this.accountid)
                        .query(`
                            DELETE FROM genPassword
                            WHERE FK_accountid = @accountid
                        `)
                    tmpResult = await pool.request()    // query DB genAccount
                        .input('accountid', sql.Int(), this.accountid)
                        .query(`
                            DELETE FROM genAccount
                            WHERE accountid = @accountid
                        `)

                    resolve(account);   // resolve with account

                } catch (err) { // on any error
                    reject(err);    // reject with error
                }

                sql.close();    // CLOSE THE DB CONNECTION

            })();   // *** *** *** Immediately Invoked Function Expression (IIFE) --> (function expression)();
        })
    }

}

module.exports = Account;