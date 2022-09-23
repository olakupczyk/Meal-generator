const express = require('express');
const router = express.Router();
const Joi = require('joi');

const Account = require('../models/account');

// guest:
// POST /api/accounts/resetpw
//      payload: {email}
// 
router.post('/', async (req, res) => {
    // validate email in req.body (payload)
    // find account by email, call Account.readByEmail(req.body.email)
    //  --  generate random password
    //  --  validate random password for password rules
    //  --      if fails --> generate random password again, until validation success
    // call account.updatePassword(password)
    //  --  prepare mail-message with random password
    //  --  send mail-message to email
    // respond with standard message 'Email sent'
    // if error respond with standard error message 'Oops something went wrong', unless payload validation error

    try {
        // validate email in req.body
        const { error } = Account.validate(req.body);   // can use this validate method, because the only required property in that schema
        // is the email , need to write a separate validation if that is not the case
        if (error) throw { statusCode: 400, errorMessage: 'Badly formatted request', errorObj: error }

        // find account by email, call Account.readByEmail(req.body.email)
        const account = await Account.readByEmail(req.body.email);

        const passwordWannabe = {}; // will validate the same way as in POST /api/accounts, so creating the same structure 

        // +++ generate and validate random password BEGIN -- a code example (lasts until +++ ... END, see below)
        let randomPasswordOK = false;
        // schema from POST /api/accounts 
        const schema = Joi.object({     // passwordWannabe is an object with a password property                
            password: Joi.string()      //      string
                .min(3)                 //      minimum 3 characters long
                .required()             //      and it is required
        });

        while (!randomPasswordOK) { // do this as long as needed to have a valid random password
            // generate random password
            const WORDLENGTH = 10;  // will generate WORDLENGTH long password
            const charString = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';    // charString acts as a "set" of characters
            const charList = charString.split('');  // charList splits charString into an array of single characters
            let word = '';
            for (let i = 0; i < WORDLENGTH; i++) {  // do this WORDLENGTH times
                word = word + charList[Math.floor((Math.random() * charList.length))];  // add a randomly chosen character from charList to the word
            }

            const passwordWannabe = {   // same structure as in POST /api/accounts
                password: word
            }

            const { value } = schema.validate(passwordWannabe); // here the interesting part if it DOES validate
            if (value) randomPasswordOK = true; // if validates, random password is OK, can stop with the while loop
        }
        // +++ generate and validate random password END

        console.log(passwordWannabe.password);  // showing it on the console -- you better copy it from there, or that account will not be able to log in
        // !!! this info should be in the email sent to the accout's email

        // call account.updatePassword(password)                                         
        const accountSame = await account.updatePassword(passwordWannabe.password);

        // prepare mail-message with passwordWannabe.password
        // send mail-message to account.email

        const standardMessage = { message: 'Email sent' };
        return res.send(JSON.stringify(standardMessage));

    } catch (err) { // if error
        // if (err.statusCode == 400) is to inform the client that the REQUEST was wrong (email was missing or malformed),
        // does not inform anything about the internal workings of the API
        if (err.statusCode == 400) return res.status(err.statusCode).send(JSON.stringify(err));

        // send standard error message, no details - similar as in login
        const standardError = { statusCode: 500, errorMessage: `Something went wrong, no email sent`, errorObj: err }
        return res.status(500).send(JSON.stringify(standardError));
    }
})

module.exports = router;
