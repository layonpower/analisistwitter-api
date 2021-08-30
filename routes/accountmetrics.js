var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

//Models
var User = require('../models/User.js');

var db = mongoose.connection;


var twitterV2 = require("twitter-v2");
require('dotenv').config();


router.get('/:id', async function main(req, res, next) {

    //Seguidores de una cuenta  
    let followers= await get_followers(req.params.id);
    //TFF de una cuenta
    let TFF = await get_TFF(req.params.id);
    //seguidores de los seguiores
    //let followonk = await get_follower_Wonk (req.params.id);

    //ids tweet de cuenta por fecha
    fecha_ini='2021-07-31T00:00:00Z';
    fecha_fin='2021-08-21T00:00:00Z';
    let vamos= await get_user_tweets_byDate(req.params.id,fecha_ini,fecha_fin);

    const metrics = {
        seguidores: followers,
        //seguidoreswonk : followonk,
        tff : TFF,
        total: vamos.tweets_totales,
        id_tweets: vamos.ids

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


async function get_TFF(id) {

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
        let TFF=dato.public_metrics.followers_count/dato.public_metrics.following_count
        return (TFF);
  
      }
   
}


async function get_follower_Wonk(id) {

    const client = new twitterV2({
        bearer_token: process.env.BEARER_TOKEN ,
      });
    
    let seguir = 1;
    let token = 'X';
    let  id_users = [];
    let datos;
    let suma = 0;
    do {
        if (token =='X') {
            let { data,meta } = await 
            client.get('users/'+id+'/followers'
            );
            datos = data;
            datos.forEach((value) => {
                id_users.push(value.id);
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
                client.get('users/'+id+'/followers?pagination_token='+token 
                );
                datos = data;
                datos.forEach((value) => {
                    id_users.push(value.id);
                });
                if (meta.next_token){
                    token = meta.next_token;
                    delete meta.next_token;
                }
                else
                    seguir=0;
                
        }
        
    } while (seguir==1);
    console.log(id_users);
    console.log(id_users[0]);
    /*const followers = await get_followers(id_users[0]);
    suma = suma + followers;
    */

    //por cada id de usuario calculamos su número de seguidores
    for  (const value of id_users) {
        const followers = await get_followers(value);
        suma = suma + followers;
    }

    return (suma);
   
}


async function get_user_tweets_byDate(id, begin_date, end_date) {

    const client = new twitterV2({
        bearer_token: process.env.BEARER_TOKEN ,
      });
    
    let seguir = 1;
    let token = 'X';
    let  total = 0;
    let  id_tweets = [];
    let datos;
    do {
        if (token =='X') {
              let { data,meta } = await  client.get('users/'+id+'/tweets?start_time='+begin_date+'&end_time='+end_date
              );
              total=total + meta.result_count ;
              //console.log("IF " + total);
              //console.log(data);
              datos = data;
              datos.forEach((value) => {
                  id_tweets.push(value.id);
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
                  client.get('users/'+id+'/tweets?start_time='+begin_date+'&end_time='+end_date+'&pagination_token='+token 
                  );
                  total=total + meta.result_count ;
                  //console.log("else " + total);
                  datos = data;
                  datos.forEach((value) => {
                      id_tweets.push(value.id);
                  });
                  if (meta.next_token){
                      token = meta.next_token;
                      delete meta.next_token;
                  }
                  else
                      seguir=0;  
        }
              
    } while (seguir==1);
    console.log(total);
    console.log(id_tweets);
    let respuesta = {
        tweets_totales: total,
        ids: id_tweets

    }
    return(respuesta);
}


//router.get('/:id', main);


module.exports = router;