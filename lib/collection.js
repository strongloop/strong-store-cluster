
module.exports = collection;


var hasOwnProperty = Object.prototype.hasOwnProperty;

var cluster = require('cluster');

if (cluster.isMaster)
  var Collection = require('./master/Collection.js');
else
  var Collection = require('./worker/Collection.js');


var collections = {};

function collection(name) {
  if (!hasOwnProperty.call(collections, name))
    return collections[name] = new Collection(name);
  else
    return collections[name];
}
