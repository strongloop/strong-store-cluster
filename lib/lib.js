
var cluster = require('cluster'),
    collection = require('./collection.js');

exports.collection = collection;

if (cluster.isMaster)
  require('./master/setup.js');
