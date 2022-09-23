module.exports = (req, res, next) => {

    const authorisedRole = 'admin'; // the role to allow access to

    try {
        // check if req.account exists
        if (!req.account) throw { statusCode: 401, errorMessage: `Access denied: authentication required`, errorObj: {} }
     //   console.log(req.account);
        // check if req.account.role.rolename is authorisedRole
        if (req.account.role && req.account.role.rolename == authorisedRole) { // !!! to check req.account.role.rolename, have to make sure that req.account.role is there too to avoid JS error
            req.account.authorised = true;  // setting the "flag"
            return next();
        }

        // move to the next function in the request pipeline
        return next()

    } catch (err) { // if error
        if (err.statusCode) {   // if error with statusCode, send error with status: statusCode 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode, send error with status: 500
    }

}