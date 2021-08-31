var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

//Models
var User = require('../models/User.js');

var db = mongoose.connection;


var twitterV2 = require("twitter-v2");
require('dotenv').config();


router.get('/:id', async function main(req, res, next) {

    //alcance potencial
    let alcance = await get_alcance(req.params.id);
    //interaccion de un tweet  
    let interaction= await get_interaction(req.params.id);
    //tasa de interaccion
    let tasa_interaction= await get_tasa_interacion(req.params.id);
    const metrics = {
        reach: alcance,
        interaccion: interaction,
        interaction_rate: tasa_interaction
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
  
      //console.log(data);
      let dato= data[0];
      let interaccion = dato.public_metrics.retweet_count + dato.public_metrics.reply_count + dato.public_metrics.like_count;
      /*let interaccion;
      console.log(dato.public_metrics.referenced_tweets.type);
      if (dato.public_metrics.referenced_tweets.type=='retweeted')
         interaccion=0;
      else
         interaccion = dato.public_metrics.retweet_count + dato.public_metrics.reply_count + dato.public_metrics.like_count;
     */
      return (interaccion);
  
    
   
}

async function get_reach(id) {

  const client = new twitterV2({
      bearer_token: process.env.BEARER_TOKEN ,
    });
  
    const { data,errors } = await client.get('users'
    , {  
    ids: id
    , user: {
              fields: ['id','public_metrics','name'],
            }
    }
    );


    //console.log(data);
    let dato= data[0];
    let reach=dato.public_metrics.followers_count;
    return (reach);

}
 
async function get_author(id) {

  const client = new twitterV2({
      bearer_token: process.env.BEARER_TOKEN ,
    });
  
    const { data,errors } = await client.get('tweets'
    , {  
    ids: id
    , tweet: {
              fields: ['id','public_metrics','author_id'],
            }
    }
    );


    //console.log(data);
    let dato= data[0];
    let autor=dato.author_id;
    return (autor);

}

async function get_alcance(id){
  let autor= await get_author(id);
  let alcance= await get_reach(autor);
  console.log(alcance);
  console.log(autor);
  return(alcance);

}

async function get_tasa_interacion(id) {
   
  let interacion = await get_interaction(id);
  let reach= await get_alcance(id);
  //console.log(datos.tweets_totales);
  let rate = interacion/reach;
  return (rate);
 
}

module.exports = router,get_interaction;