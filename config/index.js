/**
 * Created by wanfranck on 20.11.16.
 */
var nconf = require('nconf');
var path = require('path');

nconf.argv()
    .env()
    .file({ file: path.join(__dirname, 'config.json') });

module.exports = nconf;