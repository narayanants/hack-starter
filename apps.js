/* Module Depedencies */

const express = require('express');
const compression = require('compression');
const session = require('express-session');
const flash = require('express-session');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const multer = require('multer');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const errorHandler =  require('errorhandler');
const chalk = require('chalk');
const lusca = require('lusca');
const sass = require('node-sass-middleware');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);

const upload = multer({dest:path.join(__dirname,'uploads')});

/* Load env file which contains API keys and pass */
dotenv.load({path:'.env.example'});

/* Controller for the app */

const homeController =  require('./controllers/home');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');
const userController = require('./controllers/user');

