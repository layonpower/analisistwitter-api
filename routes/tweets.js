var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

//Models
var User = require('../models/User.js');

var db = mongoose.connection;


var twitterV2 = require("twitter-v2");
require('dotenv').config();


router.get('/:id', async function main(req, res, next) {
    const client = new twitterV2({
      bearer_token: process.env.BEARER_TOKEN ,
    });
  
    const { data,errors } = await client.get('tweets'
    , { 
    ids: req.params.id
    , tweet: {
              fields: ['entities', 'public_metrics', 'author_id'],
            }
    }
    );

    if (errors) {
      console.log('Errors:', errors);
      res.status(230).json(errors);
      //return;
    }
    else
      //console.log(data);
      res.status(200).json(data);
  });


//router.get('/:id', main);


module.exports = router;
