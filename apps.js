/* Module Dependencies */

const express = require('express');
const compression = require('compression');
const session = require('express-session');
const flash = require('express-flash');
const expressStatusMonitor = require('express-status-monitor');
const expressValidator = require('express-validator');
const logger = require('morgan');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const lusca = require('lusca');
const errorHandler = require('errorhandler');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({dest:path.join(__dirname,'public')});


/* Load .env variables */
dotenv.load({path:'.env.example'});

/* Load Passport config */
const passportConfig = require('./config/passport');

/* Configuration files */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');


/* Start Express Server */
const app = express();

/* connect to MongoDB */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection('error',()=>{
    console.log('%s MongoDB connection error. Please check connection.');
    process.exit(1);
});

/* Express Configuration */

app.set('port',process.env.PORT || 3000);
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
app.use(expressStatusMonitor());
app.use(expressValidator());
app.use(compression());
app.use(flash());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
    resave:true,
    saveUninitialized:true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: process.env.MONGODB_URI || MONGOLAB_URI,
        autoReconnect:true
    })
}));
app.use(sass({
    src:path.join(__dirname,'public'),
    dest:path.join(__dirname,'public')
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
    req.locals.user = req.user;
    next();
});
app.use((req,res,next)=>{
      if (!req.user &&
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
app.post('/forogot',userController.postForgot);
app.get('/reset/:token',userController.getReset);
app.post('/reset/:token',userController.postReset);
app.get('/signup',userController.getSignup);
app.post('/signup',userController.postSignup);
app.get('/contact',contactController.getContact);
app.post('/contact',contactController.postContact);
app.get('/account',passportConfig.getAccount);
app.post('/account/profile',passportConfig.isAuthenticated,userController.postUpdateProfile);
app.post('/account/password',passportConfig.isAuthenticated,userController.postUpdatePassword);
app.post('/account/delete',passportConfig.isAuthenticated,userController.postDeleteAccount);
app.get('/unlink/:provider',passportConfig.isAuthenticated,userController.getOauthUnlink);

/* API examples routes */

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
app.get('/api/lob',apiController.getLob);
app.get('/api/upload',apiController.getUpload);
app.post('/api/upload',upload.single('myFile'),apiController.postFileUpload);
app.get('/api/pinterest',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.getPinterest);
app.post('/api/pinterest',passportConfig.isAuthenticated,passportConfig.isAuthorized,apiController.postPinterest);
app.get('/api/google-maps',apiController.getGoogleMaps);



















        

