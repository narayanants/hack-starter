'use strict';

const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');

/**
 * GET /login
 * Login page.
 */

exports.getLogin = (req,res)=>{
    res.render('login',{
        title:'Login'
    });
};


/**
 * POST /login
 * Sign in using email and password
 */

exports.postLogin = (req,res,next)=>{
    req.assert('email','Email is not valid').isEmail();
    req.assert('password','Password cannot be empty').notEmpty();
    req.sanitize('email').normalizeEmail({remove_dots:false});

    const errors = req.validationErrors();
    if(errors){
        req.flash('errors',errors);
        return res.redirect('/login');
    }

    passport.authenticate('local',(err,user,info)=>{
        if(err){return next(err);}
        if(!user){
            req.flash('errors',info);
            return res.redirect('/login');
        }
        req.logIn(user,(err)=>{
            if(err){return next(err);}
            req.flash('success',{msg:'Success! You are currently logged in'});
            res.redirect(req.session.returnTo || '/');
        });
    })(req,res,next);
};  

/**
 * GET logout
 * log out.
 */

exports.getLogout = (req,res)=>{
    res.render('logout',{
        title: 'Logout'
    });
};

/**
 * GET /signup
 * Sign up page
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
    req.assert('email','Please enter a valid email address').isEmail();
    req.assert('password','Password should be 4 characters long').len(4);
    req.assert('confirmPassword','Passwords do not match').equals(req.body.password);
    
    const errors = req.validationErrors();
    if(errors){
        req.flash('errors',errors);
        return res.redirect('/signup');
    }

    const user = new User({
        email: req.body.email,
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
 * GET /account/profile
 * Profile page
 */

exports.getAccount = (req,res)=>{
    res.render('account/profile',{
        title: 'Account Management'
    });
};

/**
 * POST /account/profile
 * Update profile information
 */

exports.postUpdateProfile = (req,res,next)=>{
    req.assert('email','Email is not valid').isEmail();
    req.sanitize('email').normalizeEmail({remove_dots:false});

    const errors = req.validationErrors();
    if(errors){
        req.flash('errors',errors);
        return res.redirect('/account');
    }

    User.findById(req.user.id,(err,user)=>{
        if(err){return next(err);}
        user.email = req.body.email || '';
        user.profile.name = req.body.email || '';
        user.profile.gender = req.body.gender || '';
        user.profile.location = req.body.location || '';
        user.profile.website = req.body.website || '';
        user.save((err)=>{
            if(err){
                if(err.code === 11000){
                    req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
                    return res.redirect('/account');
                }
                return next(err);
            }
            req.flash('success',{msg:'Profile information updated successfully!'});
            res.redirect('/account');
        });
    });     
};

/**
 * POST /account/password
 * Update current password
 */

exports.postAccountPassword = (req,res,next)=>{
    req.assert('password','Password must be 4 characters long').len(4);
    req.assert('confirmPassword','Password do not match').equals(req.body.password);

    const errors = req.validationErrors();
    if(errors){
        req.flash('errors',errors);
        return res.redirect('/account');
    }

    User.findById(req.user.id,(err,user)=>{
        if(err){return next(err);}
        user.password = req.body.password;
        user.save((err)=>{
            req.flash('success', { msg: 'Password has been changed.' });
            res.redirect('/account');
        });
    });
};

/**
 * POST /account/delete
 * Delete user account
 */

exports.postDeleteAccount = (req,res,next)=>{
    User.remove({_id:req.body.id},(err)=>{
        if(err){return next(err);}
        req.logout();
        req.flash('info',{msg:'Your account has been deleted'});
        res.redirect('/');
    });
};

/**
 * GET /account/unlink/provider
 * Unlink OAuth Provider
 */

exports.getOauthUnlink = (req,res,next)=>{
    const provider = req.params.provider;
    User.findById(req.user.id,(err,user)=>{
        if(err){return next(err);}
        user[provider] = undefined;
        user.tokens = user.tokens.filter(token=> token.kind !== provider);
        user.save((err)=>{
            if(err){return next(err);}
            req.flash('info',{msg:`${provider} has been unlinked.`});
            res.redirect('/account');
        });
    });
};



