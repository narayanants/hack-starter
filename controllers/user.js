'use strict';

const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');

/**
 * GET /login
 * Login homepage
 */

exports.getLogin  = (req,res)=>{
    if(req.user){
        return res.redirect('/');
    }
    res.render('account/login',{
        title: 'Login'
    });
};


/**
 * POST /login
 * Sign in using email and password
 */

exports.postLogin = (req,res)=>{
    req.assert('email','Email is not valid').isEmail();
    req.assert('password','Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeUser({remove_dots:false});

    const errors = req.validationErrors();
    if(errors){
        req.flash('errors',errors);
        return res.redirect('/login');
    }

    passport.authenticate('local',(err,user,info)=>{
        
    });
};