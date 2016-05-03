// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-store-cluster
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

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

