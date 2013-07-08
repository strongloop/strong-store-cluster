
module.exports = Collection;


var Entry = require('./Entry.js'),
    Lock = require('./Lock.js');


function Collection(name) {
  this.name = name;
  this.entries = {};
}

Collection.prototype._entry = function(key) {
  if (!this.entries[key])
    return this.entries[key] = new Entry(this);
  else
    return this.entries[key];
}

Collection.prototype._remove = function(key) {
  delete this.entries[key];
}

Collection.prototype.get = function(key, cb) {
  this._entry(key).get(-1, function(err, json) {
    if (err) cb(err)
    else if (!json) cb(null, undefined);
    else cb(null, JSON.parse(json));
  });
}

Collection.prototype.set = function(key, value, cb) {
  cb = cb || noop;
  this._entry(key).set(JSON.stringify(value), -1, cb);
}

Collection.prototype.del = function(key, cb) {
  cb = cb || noop;
  this._entry(key).set(undefined, -1, cb);
}

Collection.prototype.acquire = function(key, cb) {
  var self = this,
      entry = this._entry(key);

  entry.acquire(-1, function(err, json) {
    var lock = new Lock(entry, json);
    return cb(null, lock, lock.get());
  });
}


function noop() {
}
