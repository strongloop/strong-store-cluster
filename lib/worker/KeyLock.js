
module.exports = KeyLock;


var request = require('./request.js');


function KeyLock(collection, key, json) {
  this._collection = collection;
  this._key = key;
  this._json = json;
  this._updated = false;
  this._released = false;
}

KeyLock.prototype.get = function() {
  if (!this._json)
    return undefined;
  else
    return JSON.parse(this._json);
};

KeyLock.prototype.set = function(newValue) {
  if (this._released)
    throw new Error("Can't set after releasing a lock.");

  this._json = JSON.stringify(newValue);
  this._updated = true;
};

KeyLock.prototype.del = function() {
  if (this._released)
    throw new Error("Can't delete after releasing a lock.");

  this._json = undefined;
  this._updated = true;
};

KeyLock.prototype.release = function(cb) {
  if (this._released)
    throw new Error('KeyLock has already been released.');

  this._released = true;

  if (!this._updated)
    this._collection._request('release', this._key, null, cb && afterRelease);
  else
    this._collection._request('setRelease',
                              this._key,
                              { json: this._json },
                              cb && afterRelease);

  function afterRelease(err, msg) {
    return cb(err);
  }
};
