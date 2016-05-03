// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-store-cluster
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

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
