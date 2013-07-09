
var cluster = require('cluster'),
    Client = require('./Client.js');

for (var i = 0; i < cluster.workers.length; i++)
  new Client(cluster.workers[i]);

cluster.on('online', function(worker) {
  new Client(worker);
});
