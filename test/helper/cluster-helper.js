

var assert = require('assert'),
    cluster = require('cluster');


if (!process.env.CLUSTER_TEST) {
  // We're require()'d by the test harness. Export a function that start
  // the test.

  exports.run = function(filename, inMaster, workers, concurrency, cb) {
    assert(filename);
    assert(inMaster || workers);
    assert(concurrency > 0);

    var env = {};
    for (var key in process.env)
      env[key] = process.env[key];

    env.CLUSTER_TEST = require.resolve('./' + filename);
    env.CLUSTER_TEST_IN_MASTER = inMaster;
    env.CLUSTER_TEST_WORKERS = workers;
    env.CLUSTER_TEST_CONCURRENCY = concurrency;

    var cp = require('child_process').fork(module.filename,
                                           {env: env, stdio: 'inherit'});

    cp.on('exit', function(exitCode, termSig) {
      assert(exitCode === 0);
      assert(!termSig);

      cb();
    });
  };

} else {
  // We're being spawned as a standalone process. Execute the test and/or spawn
  // cluster workers that do.

  var filename = process.env.CLUSTER_TEST,
      inMaster = !!+process.env.CLUSTER_TEST_IN_MASTER,
      workers = ~~ + process.env.CLUSTER_TEST_WORKERS,
      concurrency = ~~ + process.env.CLUSTER_TEST_CONCURRENCY;

  var test = require(filename);

  // Both the master and the worker have .setup() always called once.
  test.setup && test.setup();

  var waiting = 0;

  // If we're the master process, spawn a number of workers.
  if (cluster.isMaster && workers) {
    for (var i = 0; i < workers; i++)
      var worker = cluster.fork();

    waiting += workers;

    cluster.on('exit', function(worker, exitCode, termSig) {
      assert(exitCode === 0);
      assert(!termSig);

      done();
    });
  }

  // If we're either a worker, or the master is supposed to run the tests,
  // run the test cases.
  if (cluster.isWorker || inMaster) {
    waiting += concurrency;

    for (var i = 0; i < concurrency; i++)
      test.run(done);
  }
}


function done() {
  assert(--waiting >= 0);
  if (waiting === 0)
    return test.teardown && test.teardown();
}

