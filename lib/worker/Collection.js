
module.exports = Collection;


var inherits = require('util').inherits,
    EventEmitter = require('events').EventEmitter,
    KeyLock = require('./KeyLock.js'),
    request = require('./request.js');


function Collection(name) {
  this._name = name;
}

inherits(Collection, EventEmitter);

Collection.prototype.get = function(key, cb) {
  this._request('get', key, null, function(err, msg) {
    if (err)
      return cb(err);
    else if (!msg.json)
      return cb(null, undefined);
    else
      return cb(null, JSON.parse(msg.json));
  });
};

Collection.prototype.set = function(key, value, cb) {
  var data = { json: JSON.stringify(value) };
  this._request('set', key, data, cb && function(err, msg) {
    return cb(err);
  });
};

Collection.prototype.del = function(key, cb) {
  return this._request('set', key, null, cb && function(err, msg) {
    return cb(err);
  });
};

Collection.prototype.acquire = function(key, cb) {
  var self = this;

  this._request('acquire', key, null, function(err, msg) {
    if (err)
      return cb(err);

    var json = msg.json;
    var lock = new KeyLock(self, key, json);
    cb(null, lock, lock.get());
  });
};

Collection.prototype.configure = function(config) {
  var self = this;

  this._request('configure', null, { config: config }, function(err, msg) {
    if (err)
      self.emit('error', err);
  });

  return this;
};

// This function clobbers `data` if specified
Collection.prototype._request = function(method, key, data, cb) {
  request(method, this._name, key, data, cb);
};
