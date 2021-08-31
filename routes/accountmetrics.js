var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

//Models
var User = require('../models/User.js');

var db = mongoose.connection;


//var tweetMetrics = require('./tweetmetrics');

var twitterV2 = require("twitter-v2");
require('dotenv').config();


router.get('/:id', async function main(req, res, next) {

    //fechas de analisis
    const fecha_ini='2021-07-31T00:00:00Z';
    const fecha_fin='2021-08-21T00:00:00Z';

    //ALCANCE
    //Seguidores de una cuenta  
    let followers= await get_followers(req.params.id);
    //seguidores de los seguiores
    //let followonk = await get_follower_Wonk (req.params.id);
    //Tasa de tuits por dia
    let tweet_dia= await get_tweets_bydate(req.params.id,fecha_ini,fecha_fin);
    
    //RELEVANCIA
    //TFF de una cuenta
    let TFF = await get_TFF(req.params.id);
    //ratio RT por tweet
    let tasa_rt= await get_RT_rate(req.params.id,fecha_ini,fecha_fin);
    

    //COMPROMISO - ENGAGEMENT
    //Compromiso por tweet
    let tasa_compromiso= await get_engagement_bytweet(req.params.id,fecha_ini,fecha_fin);
    //Tasa de participación
    let tasa_participacion= await get_participation_rate(req.params.id,fecha_ini,fecha_fin);
    

    const metrics = {
        seguidores: followers,
        //seguidoreswonk : followonk,
        tweet_day : tweet_dia
        //tff : TFF,
        //rt_rate : tasa_rt,
        //engagement_rate: tasa_compromiso,
        //participation_rate: tasa_participacion

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
    //console.log(id_users);
    //console.log(id_users[0]);
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
    //console.log(total);
    //console.log(id_tweets);
    let respuesta = {
        tweets_totales: total,
        ids: id_tweets

    }
    return(respuesta);
}


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


async function get_RT(id) {

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
        let RT = dato.public_metrics.retweet_count;
        return (RT);
  
      }
   
}

async function get_tweets_bydate(id, begin_date, end_date) {
   
    let suma = 0;
    let rt = 0;
    //calcular numero de días entre dos fechas
    //lo que haremos es pasarle fechas y pasarlas al formato ISO 8601 W con  .toISOString()
    //por ahora hardcode para probar
    let dias = 7;

    //console.log("han pasado "+dias);

    datos = await get_user_tweets_byDate (id, begin_date, end_date);
    console.log (datos.tweets_totales);
    console.log(dias);
    rt = datos.tweets_totales/dias;
    return (rt);
   
}

async function get_RT_rate(id, begin_date, end_date) {
   
    let suma = 0;
    let rt_rate = 0;
    datos = await get_user_tweets_byDate (id, begin_date, end_date);
    //let tweets = datos.ids;
    //por cada id de usuario calculamos su número de seguidores
    for  (const value of datos.ids) {
        const interacion = await get_RT(value);
        suma = suma + interacion;
    }
   // console.log(suma);
    //console.log(datos.tweets_totales);
    rt_rate = suma/datos.tweets_totales;
    return (rt_rate);
   
}

async function get_engagement_bytweet(id, begin_date, end_date) {
   
    let suma = 0;
    let engagement_rate = 0;
    datos = await get_user_tweets_byDate (id, begin_date, end_date);
    //let tweets = datos.ids;
    //por cada id de usuario calculamos su número de seguidores
    for  (const value of datos.ids) {
        const interacion = await get_interaction(value);
        suma = suma + interacion;
    }
   // console.log(suma);
    //console.log(datos.tweets_totales);
    engagement_rate = suma/datos.tweets_totales;
    return (engagement_rate);
   
}


async function get_participation_rate(id, begin_date, end_date) {
   
    let suma = 0;
    let participation_rate = 0;
    let followers;
    datos = await get_user_tweets_byDate (id, begin_date, end_date);
    //let tweets = datos.ids;
    //por cada id de usuario calculamos su número de seguidores
    for  (const value of datos.ids) {
        const interacion = await get_interaction(value);
        suma = suma + interacion;
    }
    console.log(suma);
    followers = await get_followers(id); 
    //console.log(datos.tweets_totales);
    participation_rate = suma/followers;
    return (participation_rate);
   
}



//router.get('/:id', main);


module.exports = router;