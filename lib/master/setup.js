// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-store-cluster
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var cluster = require('cluster'),
    Client = require('./Client.js');

for (var i = 0; i < cluster.workers.length; i++)
  new Client(cluster.workers[i]);

cluster.on('online', function(worker) {
  new Client(worker);
});
