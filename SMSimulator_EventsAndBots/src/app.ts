var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var admin = require('firebase-admin');
var functions = require('firebase-functions');
let serviceAccount = require('../keys/stock-market-sim-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


import IndexMiddleWare, * as indexRouter from './classes/index';
import BotManager from './classes/BotManager';
import EventManager from './classes/EventManager';


var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const cors = require('cors');
const db = admin.firestore();
app.use(cors({ origin: true, credentials: true }));
app.use('/', indexRouter.default);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});


let botManager = new BotManager("4G64kNtxl6f5DoQQFJkw",db);
let eventManager = new EventManager("4G64kNtxl6f5DoQQFJkw",db);




export = app;