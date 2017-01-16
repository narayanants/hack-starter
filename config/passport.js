const _ = require('lodash');
const passport = require('passport');
const request = require('request');
const LocalStrategy = require('passport-local').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const OpenIDStrategy = require('passport-openid').Strategy;
const OAuthStrategy = require('passport-oauth').OAuthStrategy;
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

const User = require('../models/User');

passport.serializeUser((user,done)=>{
    done(null,user.id);
});

passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
        done(err,user);
    });
});

/* Sign in using email and password */

passport.use(new LocalStrategy({usernameField:'email'},(email,password,done)=>{
    User.findOne({email:email.toLowerCase()},(err,user)=>{
        if(err) {return done(err);}
        if(!user){
            return done(null,false,{msg:`Email ${email} not found!`});
        }
        user.comparePassword(password,(err,isMatch)=>{
            if(err) { return done(err);}
            if(isMatch){
                return done(null,user);
            }
            return done(null,false,{msg:'Invalid email or password'});
        });
    });
}));


