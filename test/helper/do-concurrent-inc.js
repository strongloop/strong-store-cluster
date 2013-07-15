
exports.run = run;
exports.teardown = teardown;


var ROUNDS = 100;
assert = require('assert'),
cluster = require('cluster'),
store = require('../..');


function run(cb) {
  var left = ROUNDS,
      coll = store.collection('counter');

  increment();

  function increment() {
    coll.acquire('counter', function(err, lock, val) {
      assert(!err);

      if (!val)
        val = 1;
      else
        val++;

      lock.set(val);
      lock.release();

      if (--left > 0)
        increment();
      else
        cb();
    });
  }
}


function teardown() {
  if (cluster.isWorker)
    process._channel.unref();

  if (cluster.isMaster) {
    store.collection('counter').get('counter', function(err, value) {
      assert(value % ROUNDS === 0);
      assert(value >= ROUNDS);
    });
  }
}


