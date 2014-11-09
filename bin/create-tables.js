var debug = require('debug')('haxio:create-tables');
var data = require('../data');
//var Oracle = require('../data/models/oracle');
//var CachedRequest = require('../data/models/cached-request');
var DeckSlot = require('../data/models/deck-slot');

data.sync({ force: true }, function(err) {
 if (err) {
   debug('problem creating tables', err);
 } else {
   debug('tables created successfully');
 }

 process.exit();
});