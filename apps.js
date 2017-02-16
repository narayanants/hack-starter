/* Module Dependencies */

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const compression = require('compression');
const flash = require('express-flash');
const expressStatusMonitor = require('express-status-monitor');
const expressValidator = require('express-validator');
const logger = require('morgan');
const dotenv = require('dotenv');
const chalk = require('chalk');
const MongoStore = require('connect-mongo')(session);
const sass = require('node-sass-middleware');
const mongoose = require('mongoose');
const passport =  require('passport');
const multer = require('multer');
const lusca = require(lusca);
const path = require('path');

const upload = multer({dest:path.join(__dirname,'uploads')});

dotenv.load({path:'.env.example'});
const passportConfig = require('./config/passport');

const homeController = require('./controllers/home');
const apiController = require('./controllers/api');
const userController = require('./controllers/user');
const contactController = require('./controllers/contact');

/* MongoDB connection */

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error',()=>{
    console.log('%s MongoDB connection error. Please make sure MongoDB is runnning!');
    process.exit();
});

/* Express configuration */

app.set('port',process.env.PORT || 3000);
app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
app.use(expressStatusMonitor());
app.use(ExpressValidator());
app.use(compression());
app.use(flash());
app.use(bodyParser.json(true));
app.use(bodyParser.urlencoded({extended:false}));
app.use(logger('dev'));
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
    resave:true,
    saveUninitialized:true,
    secret:process.env.SESSION_SECRET,
    store: new MongoStore({
        url:process.env.MONGODB_URI || process.env.MONGODB_URI,
        autoReconnect:true
    })
}));
app.use(sass{
    src:path.join(__dirname,'public'),
    dest:path.join(__dirname,'public')
});
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
    res.locals.user = req.user;
});
// After successful login, redirect to intended page
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








