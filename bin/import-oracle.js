var async = require('async');
var slugs = require('slugs');
var asciify = require('asciify-string');
var debug = require('debug')('haxio:import-oracle');
var util = require('util');
var request = require('request');
var config = require('../config');

var data = require('../data');
var Oracle = require('../data/models/oracle');
var CachedRequest = require('../data/models/cached-request');

function cachedRequest(url, callback) {
  CachedRequest.find({ where: { url: url }}).complete(function(err, doc) {
    if(err || !doc) {
      request(url, function(err, res, body) {
        if(!err) {
          var cache = CachedRequest.build({ 
            Url: url, 
            Response: JSON.stringify(res), 
            Body: body});
          cache.save();
        }

        return callback(err, res, body);
      });
    } else {
      return callback(null, JSON.parse(doc.Response), doc.Body);
    }
  });
}

function arrayAreEqual(arr1, arr2) {
  if(!arr1 || !arr2) {
    return false;
  }

  if (arr1.length == arr2.length && arr1.every(function(u, i) { return u === arr2[i]; })) {
    return true;
  }

  debug(arr1, arr2);
  return false;
}

cachedRequest(config.get('urls:oracle'), function(err, res, body) {
  if(err || res.statusCode != 200) {
    return debug('error fetching cards', err);
  }

  var cards = JSON.parse(body);
  async.eachLimit(Object.keys(cards), 20, function(name, done) {
    var card = cards[name];
    var slug = slugs(asciify(name));
    card.colors = card.colors || [];

    Oracle.findOrInitialize({ where: { Slug: slug }}).spread(function(oracle) {
      oracle.Name = card.name;
      oracle.Slug = slug;
      oracle.ManaCost = card.manaCost || ''; 
      oracle.ConvertedManaCost = card.cmc ? card.cmc.toString() : '0';
      oracle.Type = card.type || '';
      oracle.Rarity = card.rarity || '';
      oracle.Text = card.text || '';
      oracle.Power = card.power || '';
      oracle.Toughness = card.toughness || '';
      oracle.Layout = card.layout || '';

      if(!arrayAreEqual(oracle.Colors, card.colors)) {
        oracle.Colors = card.colors;
      }

      if(!oracle.changed()) {
        return done();
      }


      debug(oracle.ConvertedManaCost, card.cmc);
      oracle.save().complete(function(err) {
        debug(oracle.Name, err || '');
        done();
      });
    });
  }, function(err) {
    debug('done processing cards', err || '');
    process.exit();
  });

});

