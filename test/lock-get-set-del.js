// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-store-cluster
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var helper = require('./helper/cluster-helper');

suite('lock-get-set-del', function() {
  test('master', function(cb) {
    helper.run('do-lock-get-set-del', true, 0, 1, cb);
  });

  test('worker', function(cb) {
    helper.run('do-lock-get-set-del', false, 1, 1, cb);
  });
});
