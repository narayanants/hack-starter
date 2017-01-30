/* Module Dependencies */
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const expressStatusMonitor = require('express-status-monitor');
const expressValidator = require('express-validator');
const logger = require('morgan')
const multer = require('multer');
const chalk = require('chalk');
const mongoose = require('monogoose');
const passport = require('passport');
const path = require('path');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const errorHandler = require('errorhandler');
const lusca = require('lusca');

const upload = multer({dest:path.join(__dirname,'uploads')});

//load env file
dotenv.load({path:'.env.example'});

//controllers Route Providers
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');

// load mongodb
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error',()=>{
    console.log('%s connection error. Could not connect to MongoDB',chalk.red(x));
    process.exit();
});

//Load passport config
const passportConfig = require('./config/passport');

//start express server
const app = express();

// express configuration

app.set('port',process.env.PORT || 3000);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');
app.use(compression());
app.use(flash());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(expressStatusMonitor());
app.use(expressValidator());
app.use(passport.initialize())
app.use(passport.session());
app.use(session({
    resave:true,
    saveUninitialized:true,
    secret:process.env.SESSION_SECRET,
    store:new MongoStore({
        url:process.env.MONGODB_URI || process.env.MONGOLAB_URI,
        autoReconnect:true
    })
}));
app.use(sass({
    src:path.join(__dirname,'public'),
    dest:path.join(__dirname,'public')
}));
app.use((req,res,next)=>{
    if(req.path === '/api/upload' && req.user){
        next();
    }else{
        lusca.csrf()(req,res,next);
    }
});
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req,res,next)=>{
    res.locals.user = req.user;
});

app.use((req,res,next)=>{
    if(req.user && req.path !== '/login' && req.path !== '/signup' &&  !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)){
        req.session.returnTo = req.path;
    }else if(req.user && req.path === '/account'){
        req.session.returnTo = req.path;
    }
    next();
});
app.use(express.static(path.join(__dirname,'public'),{maxAge:789798000}));

/* Primary App Routes */

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
app.get('/contact',userController.getContact);
app.post('/contact',userController.postContact);
app.get('/account',passportConfig.isAuthenticated,userController.getAccount);
app.post('/account/profile',passportConfig.isAuthenticated,userController.postAccountProfile);
app.post('/account/password',passportConfig.isAuthenticated,userController.postAccountPassword);
app.post('/account/delete',passportConfig.isAuthenticated,userController.postAccountDelete);
app.get('/account/unlink/:provider',passportConfig.isAuthenticated,userController.getAccountUnlink);

/* API example routes 
    lastfm,
    nyt 
    aviary
    steam
    stripe
    scraping
    twilio
    clockwork
    foursquare
    tumblr
    facebook
    github
    twitter
    linkedin
    instagram
    pinterest
    paypal
    lob
    upload
    google-maps


*/
app.get('/api',apiController.getApi);
app.get('/api/lastfm',apiController.getLastfm);
app.get('/api/nyt',apiController.getNewYorkTimes);
app.get('/api/aviary',apiController.getAviary);
app.get('/api/steam',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getSteam);
app.get('/api/stripe',apiController.getStripe);
app.post('/api/stripe',apiController.postStripe);
app.get('/api/scraping',apiController.getScraping);
app.get('/api/twilio',apiController.getTwilio);
app.post('/api/twilio',apiController.postTwilio);
app.get('/api/clockwork',apiController.getClockWork);
app.post('/api/clockwork',apiController.postClockWork);
app.get('/api/foursquare',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getFourSquare);
app.get('/api/facebook',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getFacebook);
app.get('/api/tumblr',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getTumblr);
app.get('/api/github',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getGithub);
app.get('/api/twitter',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getTwitter);
app.post('/api/twitter',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.postTwitter);
app.get('/api/linkedin',passportConfig.isAuthenticated,passportConfig.isAuthorized.apiController.getLinkedin);
app.get('/api/instagram',passportConfig.isAuthenticated,passportConfig.isAuthorized.apiController.getInstagram);
app.get('/api/pinterest',passportConfig.isAuthenticated,passportConfig.isAuthorized.apiController.getPinterest);
app.get('/api/pinterest',passportConfig.isAuthenticated,passportConfig.isAuthorized.apiController.postPinterest);
app.get('/api/paypal',apiController.getPaypal);
app.get('/api/paypal/success',apiController.getPaypalSuccess);
app.get('/api/paypal/cancel',apiController.getPaypalCancel);
app.get('/api/lob',apiController.getLob);
app.get('/api/upload',apiController.getFileUpload);
app.post('/api/upload',upload.single('myFile'),apiController.postFileUpload);
app.get('/api/google-maps',apiController.getGoogleMaps);

/* Oauth Authentication routes (Sign in) */

app.get('/auth/instagram',passport.authenticate('instagram'));
app.get('/auth/instagram/callback',passport.authenticate('instagram',{failureToRedirect:'/login'}),(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/facebook',passport.authenticate('facebook',{scope:['email','public_profile']}));
app.get('/auth/facebook/callback',passport.authenticate('facebook',{failureToRedirect:'/login'}),(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/github',passport.authenticate('github'));
app.get('/auth/github/callback',passportConfig.authenticate('github',{failureToRedirect:'/login'}),(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google',passport.authenticate('github',{scope:'profile_email'}));
app.get('/auth/google/callback',passportConfig.authenticate('google',{failureToRedirect:'/login'}),(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter',passport.authenticate('twitter'));
app.get('/auth/twitter/callback',passportConfig.authenticate('twitter',{failureToRedirect:'/login'}),(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin',passport.authenticate('linkedin',{state:'SOME STATE'}));
app.get('/auth/linkedin/callback',passportConfig.authenticate('twitter',{failureToRedirect:'/login'}),(req,res)=>{
    res.redirect(req.session.returnTo || '/');
});

/* Oauth authorization routes */

app.get('/auth/foursquare',passport.authorize('foursquare'));
app.get('/auth/foursquare/callback',passport.authorize('foursquare',{failureToRedirect:'/api'}),(req,res)=>{
    res.redirect('/api/foursquare');
});
app.get('/auth/tumblr',passport.authorize('tumblr'));
app.get('/auth/tumblr/callback',passport.authorize('tumblr',{failureToRedirect:'/api'}),(req,res)=>{
    res.redirect('/api/tumblr');
});
app.get('/auth/steam',passport.authorize('openid',{state:"SOME STATE"}));
app.get('/auth/steam/callback',passport.authorize('steam',{failureToRedirect:'/login'}),(req,res)=>{
    res.redirect('/api/foursquare');
});

app.get('/auth/pinterest',passport.authorize('pinterest',{scope:"read_profile write_profile"}));
app.get('/auth/pinterest/callback',passport.authorize('steam',{failureToRedirect:'/login'}),(req,res)=>{
    res.redirect('/api/pinterest');
});

/* Error Handlers */
app.use(errorHandler());

/* Start express server */
app.listen(app.get('port'),()=>{
    console.log('%s App is running in http://localhost:%d in %s mode',chalk.red('x'),app.get('port'),app.get('env'));
    console.log('Press Ctrl+C to stop');
});

module.exports = app;







