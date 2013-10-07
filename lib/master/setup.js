
var cluster = require('cluster'),
    Client = require('./Client.js');

for (var id in cluster.workers)
  new Client(cluster.workers[id]);

cluster.on('online', function(worker) {
  new Client(worker);
});
