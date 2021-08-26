var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

//Models
var Post = require('../models/Post.js');
var User = require('../models/User.js');

var db = mongoose.connection;

/* GET posts listing ordered by publicationdate. */
router.get('/', function (req, res, next) {
    Post.find().sort('-publicationdate').populate('user').exec(function(err, posts) {
      if (err) res.status(500).send(err);
      else res.status(200).json(posts);
    });
});

/* GET all posts from an user by user Id */
router.get('/all/:id', function (req, res, next) {
  Post.find({'user':req.params.id}).sort('-publicationdate').populate('user').exec(function (err, posts) {
      if (err) res.status(500).send(err);
      else res.status(200).json(posts);
    });
});

/* POST a new post*/
router.post('/', function (req, res, next) {
  User.findById(req.body.iduser, function (err, userinfo) {
    if (err) res.status(500).send(err);
    else{
      //Create Post instance
      var postInstance = new Post({
        user: req.body.iduser,
        title: req.body.title,
        description: req.body.description
      });
      //Add postInstance to user posts array
      userinfo.posts.push(postInstance);
      //Save post in users & posts
      userinfo.save(function (err) {
        if (err) res.status(500).send(err);
        else{
          postInstance.save(function (err) {
            if (err) res.status(500).send(err);
            res.sendStatus(200);
          });
        }
      });
    }
  });
});

/* PUT an existing post */
router.put('/:id', function (req, res, next) {
  Post.findByIdAndUpdate(req.params.id, req.body, function (err, postinfo) {
    if (err) res.status(500).send(err);
    else res.sendStatus(200);
  });
});

/* DELETE an existing post */
router.delete('/:id', function (req, res, next) {
  Post.findByIdAndDelete(req.params.id, function (err, postinfo) {
    if (err) res.status(500).send(err);
    else{
      User.findByIdAndUpdate(postinfo.user, {$pull: { posts : postinfo._id }}, function (err, userinfo) {
        if (err) res.status(500).send(err);
        else {
          res.sendStatus(200);
        }
      });
    }
  });
});

module.exports = router;