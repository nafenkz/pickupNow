var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const User = require('../models/user');
const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get('/', function(req, res, next) {
    User.find(function(err, users) {
        if (err) { return next(err); }
        res.json({'users': users});
    });
});

router.post("/", (req, res, next) => {
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length >= 1) {
          return res.status(409).json({
            message: "Mail exists"
          });
        } else {
          bycrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err
              });
            } else {
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash
              });
              user
                .save()
                .then(result => {
                  console.log(result);
                  res.status(201).json({
                    message: "User created"
                  });
                })
                .catch(err => {
                  console.log(err);
                  res.status(500).json({
                    error: err
                  });
                });
            }
          });
        }
    });
      /*.catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      })*/
  });

  router.post('/login', (req, res, next)=> {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
      if (user.length <1){
        return res.status(401).json({
          message: 'Authentication failed'
        });
      }
      bycrypt.compare(req.body.password, user[0].password, (err,result) => {
        if (err){
          return res.status(401).json({
            message: 'Authentication failed'
          });
        }
        if (result){
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.JWT_KEY,
            {
                expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: 'Authentication successful',
            token: token
          });
        }
        return res.status(401).json({
          message: 'Authentication failed'
        });
      });
    })
    
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
  });

  router.delete("/:userId", (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});
  module.exports = router;

