var path = require('path');
var nconf = require('nconf');
var configPath = path.join(__dirname, 'config.json');

nconf.argv().env('_').file({ file: configPath });

module.exports = nconf;