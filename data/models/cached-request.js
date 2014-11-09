var data = require('../');
var sequelize = data.sequelize;
var Sequelize = data.Sequelize;

var CachedRequest = sequelize.define('CachedRequest', {
  'Url': Sequelize.STRING,
  'Response': Sequelize.TEXT,
  'Body': Sequelize.TEXT,
}, {
  tableName: 'CachedRequest'
});

module.exports = CachedRequest;
