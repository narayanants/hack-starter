const _ = require('lodash');
const passport = require('passport');
const request = require('request');
const InstagramStrategy = require('passport-instagram').Strategy;
const LocalStrategy = require('passport-local').Strategy;
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
  done(null,user);
});

passport.deserializeUser((id,done)=>{
  User.findById(id,(err,user)=>{
    done(err,user);
  });
});


/* Sign in using Email and Password */

passport.use(new LocalStrategy({usernameField:'email'},(email,password,done)=>{
  User.findOne({email:email.toLowerCase()},(err,user)=>{
    if(err){return done(err);}
    if(!user){
      return done(null,false,{msg:`Email ${email} not found`});
    }
    user.comparePassword(password,(err,isMatch)=>{
      if(err){return done(err);}
      if(isMatch){
        return done(null,user);
      }
      return done(null,false,{msg: 'Invalid email or password'});
    });
  });
}));


/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */


passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_ID,
  clientSecret: process.env.FACEBOOK_SECRET,
  callbackURL: '/auth/facebook/callback',
<<<<<<< HEAD
  profileFields: ['name', 'email', 'link', 'locale', 'timezone'],
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    User.findOne({ facebook: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
=======
  profileFields:['name','email','link','locale','timezone'],
  passReqToCallback:true
},(req,accessToken,refreshToken,profile,done)=>{
  if(req.user){
    User.findOne({facebook:profile.id},(err,existingUser)=>{
      if(err){return done(err);}
      if(!existingUser){
>>>>>>> 700bdb2054ce1fb339e45f606c614cb9e2f4c8b0
        req.flash('errors', { msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {
          if (err) { return done(err); }
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken });
          user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
          user.save((err) => {
            req.flash('info', { msg: 'Facebook account has been linked.' });
            done(err,user);
          });
        });
      }
    });
<<<<<<< HEAD
  } else {
    User.findOne({ facebook: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        return done(null, existingUser);
      }
      User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
        if (err) { return done(err); }
        if (existingEmailUser) {
=======
  }else{
    User.findOne({facebook:profile.id},(err,existingUser)=>{
      if(err){return done(err);}
      if(existingUser){
        return done(null,existingUser);
      }
      user.findById(req.user.id,(err,existingEmailUser)=>{
        if(err){return done(err);}
        if(existingEmailUser){
>>>>>>> 700bdb2054ce1fb339e45f606c614cb9e2f4c8b0
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.' });
          done(err);
        } else {
          const user = new User();
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken });
          user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
          user.profile.gender = profile._json.gender;
          user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
<<<<<<< HEAD
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          user.save((err) => {
            done(err, user);
=======
          user.profile.location = (profile._json.location)? profile._json.location.name : '';
          user.save((err)=>{
            done(err,user);
>>>>>>> 700bdb2054ce1fb339e45f606c614cb9e2f4c8b0
          });
        }
      });
    });
  }
<<<<<<< HEAD
}));
=======
}));  
>>>>>>> 700bdb2054ce1fb339e45f606c614cb9e2f4c8b0

