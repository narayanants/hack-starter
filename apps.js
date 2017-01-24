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