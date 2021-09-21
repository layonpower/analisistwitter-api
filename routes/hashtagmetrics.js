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
    let alcance = await get_reach_byhashtag(req.params.id);
    const metrics = {
        reach: alcance
    };
    let respuesta = JSON.stringify(metrics);
    //console.log("new version" +followers);
    res.status(200).json(respuesta);

    //}
});

async function get_followers(id) {

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
  
      
      if (errors) {
        console.log('Errors:', errors);
        res.status(230).json(errors);
        //return;
      }
      else{
        //console.log(data);
        let dato= data[0];
        let followers=dato.public_metrics.followers_count;
        return (followers);
  
      }
   
}


async function get_reach_byhashtag(hashtag) {

    const client = new twitterV2({
        bearer_token: process.env.BEARER_TOKEN ,
      });
    
    let seguir = 1;
    let token = 'X';
    let  total = 0;
    let  id_authors = [];
    let datos;
    let suma = 0;

    
    do {
        if (token =='X') {
              let { data,meta } = await  client.get('tweets/search/recent?query='+hashtag
              , {  
                tweet: {
                         fields: ['author_id'],
                       }
               }
              );
              total=total + meta.result_count ;
              //console.log("IF " + total);
              //console.log(data);
              datos = data;
              datos.forEach((value) => {
                id_authors.push(value.author_id);
              });
              if (meta.next_token){
                  token = meta.next_token;
                  delete meta.next_token;
              }
              else
                  seguir=0;
        }
        else {
                  let { data,meta } = await 
                  client.get('tweets/search/recent?query='+hashtag+'&next_token='+token 
                  , {  
                    tweet: {
                             fields: ['author_id'],
                           }
                   }
                  );
                  total=total + meta.result_count ;
                  //console.log("else " + total);
                  datos = data;
                  datos.forEach((value) => {
                      id_authors.push(value.author_id);
                  });
                  if (meta.next_token){
                      token = meta.next_token;
                      delete meta.next_token;
                  }
                  else
                      seguir=0;  
        }
              
    } while (seguir==1);
    //console.log(id_authors);

    //por cada id de usuario calculamos su número de seguidores
    for  (const id of id_authors) {
        const followers = await get_followers(id);
        suma = suma + followers;
    }
    
    return (suma);

}
  



  module.exports = router;