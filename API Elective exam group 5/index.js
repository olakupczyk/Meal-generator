const express = require('express');
const app = express();

const env = require('dotenv').config();
const config = require('config');

const cors = require('cors');

const setResHeaderJSON = require('./middleware/setResHeaderJSON');

const profiles = require('./routes/profiles');
const recipes = require('./routes/recipes');

const login = require('./routes/login');
const accounts = require('./routes/accounts');


app.use(express.json());
app.use(setResHeaderJSON);
const corsOptions = {
    exposedHeaders: ['x-authentication-token']
}
app.use(cors(corsOptions));


app.use('/api/profiles', profiles);
app.use('/api/recipes', recipes);



app.use('/api/accounts/login', login);
app.use('/api/accounts', accounts);
app.use('/api/profiles', profiles);


app.listen(config.get('port'), console.log(`Listening on port: ${config.get('port')}...`));



// // the api 'app' is built with the express routing framework
// const express = require('express');
// const app = express();

// // requiring environment and configuration
// const env = require('dotenv').config();     // dotenv's config method reads and initialises the environment variables
//                                             // in the .env file in the root folder
// const config = require('config');   // the config module will automatically look for the configuration
//                                     // settings in the ./config folder

// // requiring route handlers
// const login = require('./routes/login');
// const accounts = require('./routes/accounts');

// // request pipeline
// // app.use() adds functions to the request pipeline; where 'next()' calls the next function in te pipeline
// app.use(express.json());    // express.json() parses the JSON string in the request body into the req.body object

// app.use('/api/accounts/login', login);  // route handlers will be called when the url's first part
//                                         // (after the server:port) is matched with the specified routing rule (/pattern)
// app.use('/api/accounts', accounts);     // order matters: the more specific rules should be defined first

// // starting api 'app' to listen on port
// app.listen(config.get('port'), () => console.log(`Listening on port ${config.get('port')}...`));

// // *** .env *** config ***
// // since neither the .env nor the config's .json files can be commented, will do it here
// //
// // .env:
// //      environment variables are 'key'='value' pairs, i.e. PORT=2090
// //      keep secrets in the environment, as it lives outside your codebase
// //      dotenv module emulates an environment defined by the .env file
// //      the .env file is in the project's root folder
// //      NEVER submit your .env file to public repository (add it to the .gitignore list)
// //
// // config:
// //      the module allows for easy management of differenet configurations, e.g. test environment, production environment, etc.
// //      config's json files live in the ./config folder
// //      currently we have only 1 environment specified: default
// //      the custom-environment-variables.json file has to AND may contain only 'key':'value' pairs, where the 'value' is an environment variable
// //      the current configuration (default) is a merge of the default.json and custom-environment-variables.json files
// //      the 'dbConfig_UCN' configuration variable is an object that follows the structure of the mssql module's DB connection string
// //          "dbConfig_UCN": {
// //              "user": "DB_USER",
// //              "password": "DB_PASSWORD",
// //              "database": "DB_NAME",
// //              "server": "DB_HOST",
// //              "options": {
// //                  "encrypt": true,
// //                  "trustServerCertificate": true
// //              }
// //          } 