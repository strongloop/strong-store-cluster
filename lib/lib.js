// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-store-cluster
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var cluster = require('cluster'),
    collection = require('./collection.js');

exports.collection = collection;

if (cluster.isMaster)
  require('./master/setup.js');
