const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// const dotenv= require('dotenv').config();
const mongoose =require('mongoose')

const adminRouter = require('./routes/admin');
const indexRouter = require('./routes/index');
const errorRouter = require('./routes/error');
const { session } = require('express-session');
const Session = require('express-session');
const hbs=require= require('express-handlebars')
const app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(Session({secret:"Key",cookie:{maxAge:6000000000}}))

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/error',errorRouter)
app.use('*/', errorRouter);



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
  res.render('error');
});

module.exports = app;
