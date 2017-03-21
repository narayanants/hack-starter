'use strict';

const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');

/**
 * GET /login
 * Login Page.
 */

exports.getLogin = (req,res)=>{
    if(req.user){
        return res.redirect('/');
    }
    res.render('login',{
        title: 'Login'
    });
};


/**
 * POST /login
 * sign in using email and password
 */

exports.postLogin  = (req,res,next)=>{
    req.assert('email','Email is not valid').isEmail();
    req.assert('password','Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({remove_dots:false});

    const errors = req.validationErrors();
    if(errors){
        req.flash('errors',errors);
        return res.redirectTo('/login');
    }
    passport.authenticate('local',(err,user,info)=>{
        if(err){return next(err);}
        if(!user){
            req.flash('errors',errors);
            return res.redirect('/login');
        }
        req.logIn(user,(err)=>{
            if(err){return next(err);}
            req.flash('success','Success! You are logged in!');
            res.redirect(req.session.returnTo || '/');
        });
    })(req,res,next);
};  


/**
 * GET /logout
 * Log out.
 */

exports.logout = (req,res)=>{
    req.logout();
    res.redirect('/');
};

/**
 * GET /signup
 * Signup page. 
 */

exports.getSignup = (req,res)=>{
    if(req.user){
        return res.redirect('/');
    }
    res.render('account/signup',{
        title: 'Signup'
    });
};

