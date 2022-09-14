const express = require('express');
const app = express();

const env = require('dotenv').config();
const config = require('config');

const cors = require('cors');

const recipeauthors = require('./routes/recipeauthors');
const recipes = require('./routes/recipes');


app.use(express.json());
app.use(cors());
app.use('/api/recipeauthors', recipeauthors);
app.use('/api/recipes', recipes);


app.listen(config.get('port'), () => console.log(`Listening on port ${config.get('port')}...`)); 