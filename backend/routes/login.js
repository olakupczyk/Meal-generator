const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const config = require('config');

const jwtKey = config.get('jwt_secret_key');

const Account = require('../models/account');

// guest:
// POST /api/accounts/login
router.post('/', async (req,res) => {
 //   res.header('Content-type', 'application/json');
    // for testing the readByEmail
    try{
        console.log('test');
        const {error} = Account.validateCredentials(req.body);
        if(error) throw {statusCode: 400, errorMessage: `Badly formatted request`, errorObj: error};

        const account = await Account.checkCredentials(req.body);

        // generate the token
        const token = jwt.sign(JSON.stringify(account), jwtKey);

        res.header('x-authentication-token', token);


        return res.send(JSON.stringify(account));

    }catch(err) {
        const standardError = {statusCode: 401, errorMessage: `Invalid account email or password`, errorObj: {}};
        return res.status(401).send(JSON.stringify(standardError));
    }
    // return res.send(JSON.stringify({message: `POST /api/accounts/login`}));
})

module.exports = router;