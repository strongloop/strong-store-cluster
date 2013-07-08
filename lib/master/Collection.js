
module.exports = Collection;


var hasOwnProperty = Object.prototype.hasOwnProperty.call.bind(
        Object.prototype.hasOwnProperty);

var assert = require('assert'),
    inherits = require('util').inherits,
    EventEmitter = require('events').EventEmitter;

var Entry = require('./Entry.js'),
    Lock = require('./Lock.js');


function Collection(name) {
  this._name = name;
  this._entries = {};
}

inherits(Collection, EventEmitter);

Collection.prototype._entry = function(key) {
  if (!hasOwnProperty(this._entries, key)) {
    return this._entries[key] = new Entry(this, key);
  } else {
    return this._entries[key];
  }
}

Collection.prototype._remove = function(key) {
  assert(hasOwnProperty(this._entries, key));
  delete this._entries[key];
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

Collection.prototype._applyConfig = function(config) {
  config = config || {};

  for (var key in config) {
    if (!hasOwnProperty(config, key))
      continue;

    switch (key) {
      default:
        throw new Error('Unspported configuration option: ' + key);
    }
  }
}

Collection.prototype.configure = function(config) {
  try {
    this._applyConfig(config);
  } catch (err) {
    this.emit('error', err);
  }
}


function noop() {
}
