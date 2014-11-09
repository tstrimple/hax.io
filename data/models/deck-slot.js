var data = require('../');
var sequelize = data.sequelize;
var Sequelize = data.Sequelize;

var DeckSlot = sequelize.define('DeckSlot', {
  'EventId': { type: Sequelize.INTEGER, unique: 'compositeIndex'},
  'DeckId': { type: Sequelize.INTEGER, unique: 'compositeIndex'},
  'CardName': { type: Sequelize.STRING, unique: 'compositeIndex'},
  'CardLocation': { type: Sequelize.STRING, unique: 'compositeIndex'}, // mainboard, sideboard, commander
  'DeckName': Sequelize.STRING,
  'DeckPlayer': Sequelize.STRING,
  'DeckFormat': Sequelize.STRING,
  'DeckDate': Sequelize.STRING,
  'DeckEvent': Sequelize.STRING,
  'CardSlug': Sequelize.STRING,
  'CardCount': Sequelize.INTEGER,
}, {
  tableName: 'DeckSlot'
});

module.exports = DeckSlot;
