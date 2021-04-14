var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

//Models
var User = require('../models/User.js');

var db = mongoose.connection;

/* GET users listing ordered by creationdate. */
router.get('/', function (req, res, next) {
    User.find().sort('-creationdate').exec(function(err, users) {
      if (err) res.status(500).send(err);
      else res.status(200).json(users);
    });
});

/* GET single user by Id */
router.get('/:id', function (req, res, next) {
  User.findById(req.params.id, function (err, userinfo) {
    if (err) res.status(500).send(err);
    //if (err) return next(err);
    else res.status(200).json(userinfo);
  });
});

/* POST a new user*/
router.post('/', function (req, res, next) {
  User.create(req.body, function (err, userinfo) {
    if (err) res.status(500).send(err);
    else res.sendStatus(200);
  });
});

/* PUT an existing user */
router.put('/:id', function (req, res, next) {
  User.findByIdAndUpdate(req.params.id, req.body, function (err, userinfo) {
    if (err) res.status(500).send(err);
    else res.sendStatus(200);
  });
});


/* DELETE an existing user */
router.delete('/:id', function (req, res, next) {
  User.findByIdAndDelete(req.params.id, function (err, userinfo) {
    if (err) res.status(500).send(err);
    else res.sendStatus(200);
  });
});

/* Check if user exists */
router.post('/signin', function (req, res, next) {
  User.findOne({username: req.body.username}, function (err, user) {
    if (err) res.status(500).send(err);
    // If user exists...
		if (user!=null){
    	user.comparePassword(req.body.password,function(err, isMatch){
        // If password is correct...
        if (isMatch)
          res.status(200).send({message: 'ok', role: user.role, id: user._id});
        else
          res.send({message: 'Credenciales inválidas'});
      });
    }else{
      res.send({message: 'Credenciales inválidas'});
    }
  });
});

module.exports = router;
