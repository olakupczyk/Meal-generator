const { response } = require('express');
const express = require('express');
const router = express.Router();

const Profile = require('../models/profile');

const auth = require('../middleware/authenticate');
const admin = require('../middleware/admin');
const member = require('../middleware/member');
const check = require('../middleware/checkauthorisation');

const Joi = require('joi');

// *** GET endpoints ***

// GET /api/profiles
//      query: { displayname, profiledesc }
//
router.get('/', async (req, res) => {
    // validate query parameters (req.query)
    // based on query parameters, call Profile.readAll(queryObj)
    //          queryObj: { query, value }
    //              query: 'displayname' or 'profiledesc' (see API def document)
    //              value: a displayname or profiledesc string - depending on query
    //      prepare the profiles array, based on all queries 
    // respond with profiles array
    // if error respond with error

    try {
        // validate query parameters (req.query)
        // cannot use Profile.validate as the query parameters are not mandatory (cannot be required)
        const schema = Joi.object({
            displayname: Joi.string()
                .max(50),
            profiledesc: Joi.string()
                .max(255)
        })

        const { error } = schema.validate(req.query);
        if (error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: error }
        
        // based on query parameters, will call Profile.readAll(queryObj) one or more times
        const profilesArrays = [];  // will be an array of sets

        // queryKeyValuePairs is an array of [key, value] pairs, where each
        //      key: name of property, value: value of property
        //      of the req.query object
        const queryKeyValuePairs = Object.entries(req.query);

        // the normal for loops (for, forEach, etc.) cannot await Promises in their function body
        // have to use:     for await (value of iterable) {} -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
        for await ([key, value] of queryKeyValuePairs) {

            // call Profile.readAll(queryObj)
            const profilesArray = await Profile.readAll({ query: key, value: value });

            // push the profilesArray into the profilesArrays
            profilesArrays.push(profilesArray);
        }

        // prepare the profiles array
        let profiles = [];
        if (queryKeyValuePairs.length > 0) {    // there was at least one query
            // have to find the "intersection" of all the arrays in profilesArrays array
            // Set cannot be used for this here, unfortuantely - each object is unique - even if the information is the same in them
            // and Set does not have a method with custom defined comparator function, however Array does --> someArray.find()
            if (profilesArrays.length == 1) {
                profiles = Array.from(profilesArrays[0]);    // if there was only 1 query, that is the result
            } else {
                const profilesArray = profilesArrays.pop();  // removing the last array from profilesArrays
                profilesArray.forEach(profile => {    // for each profile in profilesArray
                    let intersect = true;
                    profilesArrays.forEach(auArray => {  // check if profile can be found in all the other arrays in profilesArrays
                        const found = auArray.find(au => au.profileid == profile.profileid);   // found is an object or undefined (if not found)
                        intersect = intersect && found; // object is "truthy", undefined is "falsy"
                    })

                    // if intersect is still true, that means the profile was found in all arrays (a.k.a. in all the queries)
                    if (intersect) profiles.push(profile);
                })
            }
        } else {    // there was no query
            profiles = await Profile.readAll();   // call Profile.readAll() with no queryObj to get all profiles
        }
//  console.log('whatever');
        // respond with accounts array
        return res.send(JSON.stringify(profiles));

    } catch (err) {
        if (err.statusCode) {   // if error with statusCode 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode    
    }

    // return res.send(JSON.stringify({ message: `GET /api/profiles` }))
})

// GET /api/profiles/:profileid
//      query: -
//
router.get('/:profileid', async (req, res) => {
    // validate profileid in req.params
    // call Profile.readById(req.params.profileid)
    // respond with profile
    // if error respond with error

    try {
        // validate profileid in req.params
        const schema = Joi.object({
            profileid: Joi.number()
                .integer()
                .min(1)
                .required()
        })

        const { error } = schema.validate(req.params);
        if (error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: error }

        // call profile.readById(req.params.profileid)
        const profile = await Profile.readById(req.params.profileid);

        // respond with profile
        return res.send(JSON.stringify(profile));

    } catch (err) {
        if (err.statusCode) {   // if error with statusCode 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode
    }

    // return res.send(JSON.stringify({ message: `GET /api/profiles/${req.params.profileid}` }))
})


// *** PUT endpoints ***

// PUT [auth, admin, check] /api/profiles/:profileid
//      payload: { displayname, profiledesc}
//
router.put('/:profileid', [auth, admin, check], async (req, res) => {
    //   we want to allow changing displayname, profiledesc 
    //
    // validate profileid (req.params)
    // call Profile.readById(req.params.profileid)
    // overwrite profileById's properties with as of req.body (payload)
    // validate profileById
    // call Profile.readByName(profileById.displayname, profileById.profiledesc)
    // if profileById.profileid != profileByName.profileid --> CANNOT UPDATE, 403 Forbidden
    // call profileById.update() -- profileById has the updated info, that was overwritten by the payload
    // responde with profile
    // if error respond with error

    try {
        // validate profileid in req.params
        const schema = Joi.object({
            profileid: Joi.number()
                .integer()
                .min(1)
                .required()
        })

        let validationResult = schema.validate(req.params);
        if (validationResult.error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: validationResult.error }

        // call profile.readById(req.params.profileid)
        const profileById = await Profile.readById(req.params.profileid);  // profileById will hold the updated values before sent to DB

        // overwrite profileById's properties with as of req.body
        if (req.body.displayname) {
            profileById.displayname = req.body.displayname;
        }
        if (req.body.profiledesc) {
            profileById.profiledesc = req.body.profiledesc;
        }
        // validate profileById
        validationResult = Profile.validate(profileById);
        if (validationResult.error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: validationResult.error }

        // call Profile.readByName(profileById.displayname, profileById.profiledesc)
        let profileByName;
        try {
            profileByName = await Profile.readByName(profileById.displayname, profileById.profiledesc);
            // profileByName found --> so far OK, this could be the same profile we are working on (a.k.a. only biolink was updated)
        } catch (innerErr) {
            if (innerErr.statusCode == 404) {   // profileByName NOT found --> that is OK too, the name is changed to something that is not in the DB yet
                profileByName = profileById   // ... because there will be a comparison later (see below)
            } else {
                throw innerErr;    // this means a real error, throw innerErr "outward" to let the outer try-catch structure's catch handle it
            }
        }

        // if profileById.profileid != profileByName.profileid --> CANNOT UPDATE, 403 Forbidden
        if (profileById.profileid != profileByName.profileid) throw { statusCode: 403, errorMessage: `Cannot update profile with name: ${profileById.displayname} ${profileById.profiledesc}`, errorObj: {} }

        // call profileById.update()
        const profile = await profileById.update();

        // respond with (updated) profile
        return res.send(JSON.stringify(profile));

    } catch (err) {
        if (err.statusCode) {   // if error with statusCode 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode
    }

    // return res.send(JSON.stringify({ message: `PUT /api/profiles/${req.params.profileid}` }))
})





// |
// \/
// Not FIXED and finished 
// 


router.put('/own', [auth], async (req, res) => {

    //
    // validate profileid (req.params)
    // call Profile.readById(req.params.profileid)
    // overwrite profileById's properties with as of req.body (payload)
    // validate profileById
    // call Profile.readByName(profileById.displayname, profileById.profiledesc) 
    // if profileById.profileid != profileByName.profileid --> CANNOT UPDATE, 403 Forbidden
    // call profileById.update() -- profileById has the updated info, that was overwritten by the payload
    // responde with profile
    // if error respond with error

    try {
        
        // validate profileid in req.params
        const schema = Joi.object({
            profileid: Joi.number()
                .integer()
                .min(1)
                .required()
        })

        let validationResult = schema.validate(req.params);
        if (validationResult.error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: validationResult.error }

        // call profile.readById(req.params.profileid)
        const profileById = await Profile.readById(req.params.profileid);  // profileById will hold the updated values before sent to DB

        // overwrite profileById's properties with as of req.body
        if (req.body.displayname) {
            profileById.displayname = req.body.displayname;
        }
        if (req.body.profiledesc) {
            profileById.profiledesc = req.body.profiledesc;
        }
        // validate profileById
        validationResult = Profile.validate(profileById);
        if (validationResult.error) throw { statusCode: 400, errorMessage: `Badly formatted request`, errorObj: validationResult.error }


        let profileByName;
        try {
            profileByName = await Profile.readByName(profileById.displayname, profileById.profiledesc);
            // profileByName found --> so far OK, this could be the same profile we are working on (a.k.a. only biolink was updated)
        } catch (innerErr) {
            if (innerErr.statusCode == 404) {   // profileByName NOT found --> that is OK too, the name is changed to something that is not in the DB yet
                profileByName = profileById   // ... because there will be a comparison later (see below)
            } else {
                throw innerErr;    // this means a real error, throw innerErr "outward" to let the outer try-catch structure's catch handle it
            }
        }

        // if profileById.profileid != profileByName.profileid --> CANNOT UPDATE, 403 Forbidden
        if (profileById.profileid != profileByName.profileid) throw { statusCode: 403, errorMessage: `Cannot update profile with name: ${profileById.displayname} ${profileById.profiledesc}`, errorObj: {} }

        // call profileById.update()
        const profile = await profileById.update();

        // respond with (updated) profile
        return res.send(JSON.stringify(profile));

    } catch (err) {
        if (err.statusCode) {   // if error with statusCode 
            return res.status(err.statusCode).send(JSON.stringify(err));
        }
        return res.status(500).send(JSON.stringify(err));   // if no statusCode
    }

})




module.exports = router;