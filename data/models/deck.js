var data = require('../');
var sequelize = data.sequelize;
var Sequelize = data.Sequelize;

var Deck = sequelize.define('Deck', {
  'ExternalId': Sequelize.INTEGER,
  'Name': Sequelize.STRING,
  'Player': Sequelize.STRING,
  'Format': Sequelize.STRING,
  'Date': Sequelize.STRING,
  'Event': Sequelize.STRING,
}, {
  tableName: 'Deck'
});

module.exports = Oracle;
