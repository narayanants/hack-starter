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
 * Sign in using email and password
 */

exports.postLogin = (req,res,next)=>{
    req.assert('email','Email is not valid').isEmail();
    req.assert('name','Name cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();
    if(errors){
        req.flash('errors',errors);
        return res.redirect('/login');
    }

    passport.authenticate('login',(err,user,info)=>{
        if(err){return next(err);}
        if(!user){
            req.flash('errors',info);
            return res.redirect('/login');
        }
        req.logIn(user,(err)=>{
            if(err){return next(err);}
            req.flash('success', { msg: 'Success! You are logged in.' });
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
 * Signup page
 */

exports.getSignup = (req,res)=>{
    if(req.user){
        return res.redirect('/');
    }
    res.render('account/signup',{
        title: 'Create Account'
    });
};

/**
 * POST /signup
 * Create a new local account
 */

exports.postSignup = (req,res,next)=>{
    req.assert('email','Email is not valid').isEmail();
    req.assert('password','Password must be 4 characters long').len(4);
    req.assert('confirmPassword','Password do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();
    if(errors){
        req.flash('errors',errors);
        return res.redirect('/signup');
    }
    const user = new User({
        email:req.body.email,
        password: req.body.password
    });

    User.findOne({email:req.body.email},(err,existingUser)=>{
        if(err){return next(err);}
        if(existingUser){
            req.flash('errors', { msg: 'Account with that email address already exists.' });
            return res.redirect('/signup');
        }
        user.save((err)=>{
            if(err){return next(err);}
            req.logIn(user,(err)=>{
                if(err){return next(err);}
                res.redirect('/');
            });
        });
    });
};


/**
 * GET /profile
 * Profile Page
 */

exports.getAccount = (req,res)=>{
    res.render('account/profile',{
        title: 'Account Management'
    }); 
};

/**
 * POST account/profile
 * Update profile info
 */




