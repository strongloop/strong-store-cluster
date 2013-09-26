var assert = require('assert');
var cluster = require('cluster');
var VERSION = require('./package.json').version;

if(cluster._strongStoreCluster) {
  assert(
    cluster._strongStoreCluster.VERSION === VERSION,
    'Multiple versions of strong-strore-cluster are being initialized.\n' +
    'This version ' + VERSION + ' is incompatible with already initialized\n' +
    'version ' + cluster._strongStoreCluster.VERSION + '.\n'
  );
  module.exports = cluster._strongStoreCluster;
  return;
}

module.exports = require('./lib/lib.js');
module.exports.VERSION = VERSION;
cluster._strongStoreCluster = module.exports;
