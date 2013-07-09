
module.exports = Collection;


var hasOwnProperty = Object.prototype.hasOwnProperty;

var assert = require('assert'),
    inherits = require('util').inherits,
    EventEmitter = require('events').EventEmitter;

var Entry = require('./Entry.js'),
    KeyLock = require('./KeyLock.js');


function Collection(name) {
  this._name = name;
  this._entries = {};
  this._count = 0;
  this._expireKeys = null;
  this._expireKeysTimer = null;

  this._sweep = this._sweep.bind(this);
}

inherits(Collection, EventEmitter);

Collection.prototype._entry = function(key) {
  if (!hasOwnProperty.call(this._entries, key)) {
    if (!this._count++ && this._expireKeys)
      this._startExpireKeysTimer();

    return this._entries[key] = new Entry(this, key);
  } else {
    return this._entries[key];
  }
};

Collection.prototype._remove = function(key) {
  assert(hasOwnProperty.call(this._entries, key));
  delete this._entries[key];

  if (!--this._count && this.expireKeys)
    this._stopExpireKeysTimer();
};

Collection.prototype.get = function(key, cb) {
  this._entry(key).get(-1, function(err, json) {
    if (err)
      cb(err);
    else if (!json)
      cb(null, undefined);
    else
      cb(null, JSON.parse(json));
  });
};

Collection.prototype.set = function(key, value, cb) {
  cb = cb || noop;
  this._entry(key).set(JSON.stringify(value), -1, cb);
};

Collection.prototype.del = function(key, cb) {
  cb = cb || noop;
  this._entry(key).set(undefined, -1, cb);
};

Collection.prototype.acquire = function(key, cb) {
  var self = this,
      entry = this._entry(key);

  entry.acquire(-1, function(err, json) {
    var lock = new KeyLock(entry, json);
    return cb(null, lock, lock.get());
  });
};

Collection.prototype._applyConfig = function(config) {
  config = config || {};

  for (var key in config) {
    if (!hasOwnProperty.call(config, key))
      continue;

    switch (key) {
      case 'expireKeys':
        if (config.expireKeys === this._expireKeys)
          break;

        this._stopExpireKeysTimer();
        this._expireKeys = config.expireKeys;
        this._startExpireKeysTimer();
        break;

      default:
        throw new Error('Unspported configuration option: ' + key);
    }
  }
};

Collection.prototype._startExpireKeysTimer = function() {
  assert(!this._expireKeysTimer);

  if (!this._expireKeys || !this._count)
    return;

  var interval = Math.ceil(this._expireKeys * 1000 / 2);

  this._expireKeysTimer = setInterval(this._sweep, interval);
  this._expireKeysTimer.unref();
};

Collection.prototype._stopExpireKeysTimer = function() {
  if (!this._expireKeysTimer)
    return;

  clearInterval(this._expireKeysTimer);
  this._expireKeysTimer = null;
};

Collection.prototype._sweep = function() {
  var entries = this._entries,
      key;

  for (key in entries) {
    if (!hasOwnProperty.call(entries, key))
      continue;

    if (entries[key].age(1) > 2)
      this._remove(key);
  }

  if (!this._count)
    this._stopExpireKeysTimer();
};

Collection.prototype.configure = function(config) {
  var self = this;

  try {
    this._applyConfig(config);

  } catch (err) {
    process.nextTick(function() {
      self.emit('error', err);
    });
  }

  return this;
};


function noop() {
}
