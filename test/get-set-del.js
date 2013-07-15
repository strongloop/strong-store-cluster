
var helper = require('./helper/cluster-helper');

suite('get-set-del', function() {
  test('master', function(cb) {
    helper.run('do-get-set-del', true, 0, 1, cb);
  });

  test('worker', function(cb) {
    helper.run('do-get-set-del', false, 1, 1, cb);
  });
});
