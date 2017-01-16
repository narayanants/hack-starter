/* Module dependencies */
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const expressStatusMonitor = require('express-status-monitor');
const expressValidator = require('express-validator');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const path = require('path');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({dest:path.join(__dirname,'uploads')});

/* dot env config file */
dotenv.load({path:'.env.example'});

/* Controllers (route handlers) */ 

const homeController = require('./controllers/home');
const apiController = require('./controllers/api');
const userController = require('./controllers/user');
const contactController = require('./controllers/contact');

const passportConfig = require('./config/passport');

/* Create Express server */
const app = express();

/* Connect to MongoDB */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error',()=>{
    console.log('%s MongoDB connection error.Please make sure MongoDB is running.',chalk.red('X'));
    process.exit();
});

/* Express Config */ 

app.set('port',process.env.PORT || 3000);
app.set('views',path.join(__dirname,'views'))
app.set('view engine','pug');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(flash());
app.use(compression());
app.use(expressStatusMonitor());
app.use(expressValidator());
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
    resave:true,
    saveUninitialized:true,
    secret:process.env.SESSION_SECRET,
    store:new MongoStore({
        url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
        autoReconnect:true
    })
}));
app.use(sass({
    src:path.join(__dirname,'uploads'),
    dest:path.join(__dirname,'uploads')
}));
app.use((req,res,next)=>{
    if(req.path === '/api/upload'){
        next();
    }else{
        lusca.csrf()(req,res,next);
    }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req,res,next)=>{
    if(!req.user &&
        req.path !== '/login' &&
        req.path !== '/signup' &&
        !req.path.match(/^\/auth/) &&
        !req.path.match(/\./)){
            req.session.returnTo = req.path;
        }else if(req.user && req.path === '/account'){
            req.session.returnTo = req.path;
        }
        next();
});
app.use(express.static(path.join(__dirname,'public'),{maxAge:31557600000}));

/* Primary app routes */

app.get('/',homeController.index);
app.get('/login',userController.getLogin);
app.post('/login',userController.postLogin);
app.get('/logout',userController.getLogout);
app.get('/forgot',userController.getForgot);
app.post('/forgot',userController.postForgot);
app.get('/reset/:token',userController.getReset);
app.post('/reset/:token',userController.postReset);
app.get('/signup',userController.getSignup);
app.post('/signup',userController.postSignup);
app.get('/contact',contactController.getContact);
app.post('/contact',contactController.postContact);
app.post('/account/profile',passportConfig.isAuthenticated,userController.postUpdateProfile);
app.post('/account/password',passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete',passportConfig.isAuthenticated,userController.postDeleteAccount);
app.get('/account/unlink/:provider',passportConfig.isAuthenticated,userController.getOauthUnlink);


/* API example routes */
app.get('/api',apiController.getApi);
app.get('/api/lastfm',apiController.getLastfm);
app.get('/api/nyt',apiController.getNewYorkTimes);
app.get('/api/aviary',apiController.getAviary);
app.get('/api/steam',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getSteam);
app.get('/api/stripe',apiController.getStripe);
app.post('/api/stripe',apiController.postStripe);
app.get('/api/scraping',apiController.geScraping);
app.get('/api/clockwork',apiController.getClockwork);
app.post('/api/clockwork',apiController.postClockwork);
app.get('/api/foursquare',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getFoursquare);
app.get('/api/tumblr',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getTumblr);
app.get('/api/facebook',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getFacebook);
app.get('/api/github',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getGithub);
app.get('/api/twitter',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getTwitter);
app.post('/api/twitter',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.postTwitter);
app.get('/api/linkedin',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getLinkedin);
app.get('/api/instagram',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getInstagram);
app.get('/api/paypal',apiController.getPaypal);
app.get('/api/paypal/success',apiController.getPaypalSuccess);
app.get('/api/paypal/cancel',apiController.getPaypalCancel);
app.get('/api/lob',apiController.getlob);
app.get('/api/upload',apiController.getFileUpload);
app.post('/api/upload',upload('myFile'),apiController.postFileUpload);
app.get('/api/pinterest',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getPinterest);
app.post('/api/pinterest',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.postPinterest);
app.get('/api/google-maps',apiController.getGoogleMaps);

/* Oauth authentication routes */

app.get('/auth/instagram',passport.authenticate('instagram'));
app.get('/auth/instagram/callback',passport.authenticate('instagram',{failureRedirect:'/login'}),(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/facebook',passport.authenticate('facebook',{scope:['email','public_profile']}));
app.get('/auth/facebook/callback',passport.authenticate('facebook'),{failureRedirect:'/login'},(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/github',passport.authenticate('github'));
app.get('/auth/github/callback',passport.authenticate('github',{failureRedirect:'/login'}),(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google',passport.authenticate('google',{scope:'profile email'}));
app.get('/auth/google/callback',passport.authenticate('google'),{failureRedirect:'/login'},(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter',passport.authenticate('twitter'));
app.get('/auth/twitter/callback',passport.authenticate('twitter',{failureRedirect:'/login'}),(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin',passport.authenticate('linkedin',{state:'SOME STATE'}));
app.get('/auth/linkedin/callback',passport.authenticate('linkedin'),{failureRedirect:'/login'},(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});

/* Oauth authorization routes */
app.get('/auth/foursquare',passport.authorize('foursquare'));
app.get('/auth/foursquare/callback',passport.authorize('foursquare',{failureRedirect:'/api'}),(req,res)=>{
    res.redirect('/api/foursquare');
});
app.get('/auth/tumblr',passport.authorize('tumblr'));
app.get('/auth/tumblr/callback',passport.authorize('tumblr',{failureRedirect:'/api'}),(req,res)=>{
    res.redirect('/api/tumblr');
});
app.get('/auth/steam',passport.authorize('steam',{state:'SOME STATE'}));
app.get('/auth/steam/callback',passport.authorize('steam',{failureRedirect:'/login'}),(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/pinterest',passport.authorize('pinterest',{scope:'read_public write_public'}));
app.get('/auth/pinterest/callback',passport.authorize('pinterest',{failureRedirect:'/login'}),(req,res)=>{
    res.redirect('/api/pinterest');
});


/* Error handlers */ 
app.use(errorHandler());

/* Start Express server */
app.listen(app.get('port'),()=>{
    console.log('%s App is running at http://localhost:%id in %s',chalk.green('✓'),app.get('port'),app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

module.exports = app;





