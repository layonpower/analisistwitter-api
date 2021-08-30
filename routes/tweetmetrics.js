var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

//Models
var User = require('../models/User.js');

var db = mongoose.connection;


var twitterV2 = require("twitter-v2");
require('dotenv').config();


router.get('/:id', async function main(req, res, next) {

    //interaccion de un tweet  
    let interaction= await get_interaction(req.params.id);
    const metrics = {
        interaccion: interaction
    };
    let respuesta = JSON.stringify(metrics);
    //console.log("new version" +followers);
    res.status(200).json(respuesta);

    //}
  });



async function get_interaction(id) {

    const client = new twitterV2({
        bearer_token: process.env.BEARER_TOKEN ,
      });
    
      const { data,errors } = await client.get('tweets'
      , {  
      ids: id
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
      else{
        //console.log(data);
        let dato= data[0];
        let interaccion = dato.public_metrics.retweet_count + dato.public_metrics.reply_count + dato.public_metrics.like_count;
        return (interaccion);
  
      }
   
}

module.exports = router;