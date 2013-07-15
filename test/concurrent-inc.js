
var helper = require('./helper/cluster-helper');

suite('concurrent increment', function() {
  test('master only', function(cb) {
    helper.run('do-concurrent-inc', true, 0, 4, cb);
  });

  test('four workers', function(cb) {
    helper.run('do-concurrent-inc', false, 4, 4, cb);
  });

  test('master and four workers', function(cb) {
    helper.run('do-concurrent-inc', true, 4, 4, cb);
  });
});

