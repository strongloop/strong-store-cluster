
exports.run = run;
exports.teardown = teardown;


var assert = require('assert'),
    cluster = require('cluster'),
    store = require('../..');


function run(cb) {
  var testsRun = 0;

  testWith('test1', 'key1', 'zulis', onDone);
  testWith('test2', 'quux', 'stoll', onDone);
  testWith('test2', 'key1', 'urals', onDone);
  testWith('test2', 'key2', 'quipp', onDone);

  function onDone() {
    if (++testsRun === 4)
      cb();
  }
}


function testWith(collectionName, key, testValue, cb) {
  var coll = store.collection(collectionName);

  coll.get(key, function(err, value) {
    assert(!err);
    assert(value === undefined);

    coll.set(key, testValue, function(err) {
      assert(!err);

      coll.get(key, function(err, value) {
        assert(!err);
        assert(value === testValue);

        coll.del(key, function(err) {
          assert(!err);

          coll.get(key, function(err, value) {
            assert(!err);
            assert(value === undefined);

            cb();
          });
        });
      });
    });
  });
}



function teardown() {
  if (cluster.isWorker)
    process._channel.unref();
}
