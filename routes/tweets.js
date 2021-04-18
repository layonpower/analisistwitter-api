var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

//Models
var User = require('../models/User.js');

var db = mongoose.connection;


var twitterV2 = require("twitter-v2");
require('dotenv').config();


async function main(req, res, next) {
    const client = new twitterV2({
      bearer_token: process.env.BEARER_TOKEN ,
    });
  
    const { data } = await client.get('tweets'
    , { 
    ids: '1370805087254290432' 
    , tweet: {
              fields: ['entities', 'public_metrics', 'author_id'],
            }
    }
    );
    //console.log(data);
    res.status(200).json(data);
  }

router.get('/', main);


module.exports = router;
