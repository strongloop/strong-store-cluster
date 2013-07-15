
exports.run = run;
exports.teardown = teardown;


var assert = require('assert'),
    cluster = require('cluster'),
    store = require('../..');


function run(cb) {
  var testsRun = 0;

  testWith('test1', 'key1', {foo: 'zulis'}, onDone);
  testWith('test2', 'quux', ['stoll'], onDone);
  testWith('test2', 'key1', 'urals', onDone);
  testWith('test2', 'key2', 42, onDone);

  function onDone() {
    if (++testsRun === 4)
      cb();
  }
}


function testWith(collectionName, key, testValue, cb) {
  var coll = store.collection(collectionName);

  coll.set(key, testValue, function(err, value) {
    assert(!err);

    coll.acquire(key, function(err, lock, value) {
      assert(!err);

      assert.deepEqual(testValue, value);
      assert.deepEqual(testValue, lock.get());

      // Non-primitive values should be deep-cloned.
      if (typeof testValue === 'object') {
        assert(testValue !== value);
        assert(testValue !== lock.get());
      }

      lock.set('other');
      assert('other' === lock.get());

      lock.release(function(err) {
        assert(!err);
      });

      coll.acquire(key, function(err, lock, value) {
        assert(!err);

        assert('other' === value);
        assert('other' === lock.get());

        lock.del();
        assert(undefined === lock.get());

        lock.release(function(err) {
          assert(!err);
        });

        coll.get(key, function(err, value) {
          assert(!err);
          assert(undefined === value);

          // That was it!
          cb();
        });
      });
    });
  });
}


function teardown() {
  if (cluster.isWorker)
    process._channel.unref();
}
