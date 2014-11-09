var Sequelize = require('sequelize');
var debug = require('debug')('haxio:database');
var trace = require('debug')('haxio:database:trace');
var config = require('../config');

var sequelize = new Sequelize(
  config.get('database:name'), 
  config.get('database:user'),  
  config.get('database:pass'), { 
    host: config.get('database:host'),
    port: config.get('database:port'),
    dialect: config.get('database:dialect'),
    logging: trace });
 
sequelize
  .authenticate()
  .complete(function(err) {
    if (err) {
      debug('database connection error', err);
    } else {
      debug('database connection successful');
    }
  });

function sync(options, done) {
  sequelize
  .sync(options)
  .complete(done);
}

exports.sequelize = sequelize;
exports.Sequelize = Sequelize;
exports.sync = sync;
