const config = require('config');
const jwt = require('jsonwebtoken');
const { NText } = require('mssql');
const jwtKey = config.get('jwt_secret_key');


module.exports = (req, res, next) => {
    // check if there is a token in the header
    // check if token is corrent (can be decrypted)
    // attach the account info to the req object
    // --> if all good move on 
    //      if not, error

    try {
        const token = req.header('x-authentication-token');
        if (!token) throw { statusCode: 401, errorMessage: 'Access denied: no token provided', errorObj: {} };

        // decrypt the token
        const account = jwt.verify(token, jwtKey);
        req.account = account;

        next();

    } catch (err) { // if error
        if (err.name == 'JsonWebTokenError') {  // if this is a jwt.verify error
            return res.status(401).send(JSON.stringify({ statusCode: 401, errorMessage: `Access denied: invalid token`, errorObj: {} }));
        }
        if (err.statusCode) {   // if error with statusCode, send error with status: statusCode 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode, send error with status: 500
    }
}