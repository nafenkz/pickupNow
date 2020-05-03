/* eslint-disable indent */
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

//Return a list of persons 
router.get('/', function(req, res, next) {
    User.find(function(err, users) {
        if (err) { return next(err); }
        res.json({'users': users});
    });
});

// sign up request
router.post('/', function(req, res, next){
    User.find({ email:req.body.email})
    .exec()
    .then(user =>{
        if(user.length>=1){
            return res.status(409).json({
                message: 'this email has already been used' 
            });
        }else{
             bcrypt.hash(req.body.password, 10,(err,hash) =>{
            if(err){
                return res.status(500).json({
                    error:err                   
                });
            }else{
                const user= new User({
                name:req.body.name,
                 email: req.body.email,
                 password: hash
                });
                user
                .save()
                .then(result =>{
                    console.log(result);
                    res.status(201).json({
                    message:'user is created'
                    }); 
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error:err
                    });
                });
            }
        }); 
       
        }
    });

        
           
});

router.delete('/:id', function(req, res, next) {
    var id = req.params.id;
    User.findOneAndDelete({_id: id}, function(err, user) {
        if (err) { return next(err); }
        if (user === null) {
            return res.status(404).json({'message': 'user not found'});
        }
        res.json(user);
    });
});
module.exports = router;