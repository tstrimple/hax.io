var data = require('../');
var sequelize = data.sequelize;
var Sequelize = data.Sequelize;

var Oracle = sequelize.define('Oracle', {
  'Name': { type: Sequelize.STRING, unique: true },
  'Slug': { type: Sequelize.STRING, unique: true },
  'ManaCost': Sequelize.STRING,
  'ConvertedManaCost': Sequelize.STRING,
  'Colors': Sequelize.ARRAY(Sequelize.STRING),
  'Type': Sequelize.STRING,
  'Rarity': Sequelize.STRING,
  'Text': Sequelize.TEXT,
  'Power': Sequelize.STRING,
  'Toughness': Sequelize.STRING,
  'Layout': Sequelize.STRING
}, {
  tableName: 'Oracle'
});

module.exports = Oracle;
