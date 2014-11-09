var async = require('async');
var slugs = require('slugs');
var asciify = require('asciify-string');
var debug = require('debug')('haxio:import-event');
var util = require('util');
var request = require('request');
var cheerio = require('cheerio');
var config = require('../config');

var data = require('../data');
var DeckSlot = require('../data/models/deck-slot');

var source = config.get('urls:mtgtop8');

function isDate(item) {
  var matches = item.match(/(\d+)(-|\/)(\d+)(?:-|\/)(?:(\d+)\s+(\d+):(\d+)(?::(\d+))?(?:\.(\d+))?)?/);

  if (!item || item[2] !== '/') {
    return false;
  }

  return (new Date(item) !== 'Invalid Date');
}

function getFormatAndDate($, data, done) {
  var parts = $('td.S14').text().trim().split(' ');
  data.format = parts[0];

  for (var i = 1; i < parts.length; i++) {
    if (isDate(parts[i].trim())) {
      data.date = parts[i].trim();
    }
  };

  done(null, data);
}

function getDecks($, data, done) {
  data.decks = [];
  $('.chosen_tr .W14 a, .hover_tr .S14 a').each(function(i, elem) {
    data.decks.push($(this).attr('href').split('=')[2].split('&')[0]);
  });

  if(data.decks.length == 0) {
    //  try drop down format
    $('option').each(function(i, elem) {
      var id = $(this).attr('value');
      if(id) {
        data.decks.push(id);
      }
    });
  }

  done(null, data);
}

function getEvent($, data, done) {
  data.event = $('td.S18').text().trim();
  done(null, data);
}

function getCards($, data, done) {
  data.mainboard = [];
  data.sideboard = [];
  data.commander = [];
  $('td.O13').each(function(i, elem) {
    var section = $(this).text().toLowerCase();
    var cards = getCardsFromSection($, $(this));
    if(section === 'sideboard') {
      data.sideboard = data.sideboard.concat(cards);
    } else if(section === 'commander') {
      data.mainboard = data.commander.concat(cards);
    } else {
      data.mainboard = data.mainboard.concat(cards);
    }
  });

  done(null, data);
}

function getCardsFromSection($, section) {
  var cards = [];
  section.parent().parent().find('td.G14').each(function(i, elem) {
    var parts = $(this).text().trim().split(/\W+/);
    var card = { count: parts.shift(), name: parts.join(' ') };
    cards.push(card);
  });

  return cards;
}

function getDeckName($, data, done) {
  var deck = $('td.S16').text().trim();
  var startTrim = deck.indexOf('] ');
  if(startTrim > 0) {
    deck = deck.substr(startTrim + 2, deck.length);
  } else {
    deck = deck.substr(3, deck.length);    
  }

  var parts = deck.split('-');
  if(parts.length > 0) {
    data.deck = parts[0].trim();
  }

  if(parts.length > 1) {
    data.player = parts[1].trim();
  }
  
  done(null, data);
}

var parse = async.applyEach([getFormatAndDate, getEvent, getCards, getDeckName]);

function saveDeckSlot(deck, card, location, done) {
  DeckSlot.findOrInitialize({ where: { 
    EventId: deck.eventId, 
    DeckId: deck.deckId, 
    CardName: card.name, 
    CardLocation: location
  }}).spread(function(deckSlot) {
    deckSlot.DeckPlayer = deck.player;
    deckSlot.DeckFormat = deck.format;
    deckSlot.DeckDate = deck.date;
    deckSlot.DeckEvent = deck.event;
    deckSlot.CardSlug = slugs(asciify(card.name));
    if(deckSlot.CardCount != card.count) {
      deckSlot.CardCount = card.count;
    }
    
    if(!deckSlot.changed()) {
      return done();
    }

    deckSlot.save().complete(function(err) {
      done();
    });
  });
}

function fetchEvent(eventId, done) {
  var deckId = 0;
  request(util.format(source, eventId, deckId), function(err, res, body) {
    var $ = cheerio.load(body);
    var data = { eventId: eventId };
    getDecks($, data, function(err) {
      done(err, data);
    });
  });
}

function fetchDeck(eventId, deckId, done) {
  request(util.format(source, eventId, deckId), function(err, res, body) {
    if(err) {
      debug(eventId + '-' + deckId, err);
      return process.nextTick(fetchDeck.bind(this, eventId, deckId, done));
    }

    try {
      var $ = cheerio.load(body);
      var data = { eventId: eventId, deckId: deckId };
      parse($, data, function(err) {
        done(err, data);
      });
    } catch(e) {
      console.log('error!', body, e);
    }
  });
}

function processEvent(eventId, done) {
  fetchEvent(eventId, function(err, e) {
    async.each(e.decks, processDeck.bind(this, eventId), done);
  });
}

function processDeck(eventId, deckId, done) {
  fetchDeck(eventId, deckId, function(err, deck) {
    async.each(deck.mainboard, function(card, next) {
      saveDeckSlot(deck, card, 'mainboard', next);
    }, function(err) {
      if(deck.commander) {
        async.each(deck.commander, function(card, next) {
          saveDeckSlot(deck, card, 'commander', next);
        }, function(err) {
          debug('event ' + eventId, 'deck ' + deckId);
          done();
        })
      } else {
        async.each(deck.sideboard, function(card, next) {
          saveDeckSlot(deck, card, 'sideboard', next);
        }, function(err) {
          debug('event ' + eventId, 'deck ' + deckId);
          done();
        });
      }
    });
  });
}

if (!Number.isInteger) {
  Number.isInteger = function isInteger(nVal) {
    nVal = Number(nVal);
    return typeof nVal === 'number'
      && isFinite(nVal)
      && nVal > -9007199254740992
      && nVal < 9007199254740992
      && Math.floor(nVal) === nVal;
  };
}

if(process.argv.length < 3 || !Number.isInteger(process.argv[2])) {
  return debug('cannot import deck', 'you must supply an id to be processed');
}

var start = process.argv[2] * 1;
var end = start;

if(process.argv.length === 4) {
  if(!Number.isInteger(process.argv[3])) {
    return debug('cannot import deck', 'the max id is invalid');
  }

  end = process.argv[3] * 1;
}

var eventIds = [];

for(var i = start; i <= end; i++) {
  eventIds.push(i);
}

async.eachLimit(eventIds, 200, function(eventId, next) {
  processEvent(eventId, next);
}, function() {
  debug('done importing events');
  process.exit();
});
