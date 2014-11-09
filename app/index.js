var express = require('express');
var app = express();
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var debug = require('debug')('haxio');
var data = require('../data');
var config = require('../config/');

/** EXPRESS MIDDLEWARE  **/
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var session = require('express-session');
var logger = require('morgan');
var errorHandler = require('errorhandler');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon());
app.use(logger(config.get('log:format')));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.use(session(config.get('session')));

app.use(express.static(path.join(__dirname, 'public')));

/** EXPRESS ROUTES **/
var home = require('./controllers/home');

app.use('/', home);

if (config.env === 'development') {
  app.use(errorHandler());
}

server.listen(config.get('port'), function() {
  debug('http server listening', config.get('port'));
});
