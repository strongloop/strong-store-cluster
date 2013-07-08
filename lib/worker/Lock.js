
module.exports = Lock;


var request = require('./request.js');


function Lock(collection, key, json) {
  this._collection = collection;
  this._key = key;
  this._json = json;
  this._updated = false;
  this._released = false;
}

Lock.prototype.get = function() {
  if (!this._json)
    return undefined;
  else
    return JSON.parse(this._json);
}

Lock.prototype.set = function(newValue) {
  if (this._released)
    throw new Error("Can't set after releasing a lock.");

  this._json = JSON.stringify(newValue);
  this._updated = true;
}

Lock.prototype.del = function() {
  if (this._released)
    throw new Error("Can't delete after releasing a lock.");

  this._json = undefined;
  this._updated = true;
}

Lock.prototype.release = function(cb) {
  if (this._released)
    throw new Error("Lock has already been released.");

  this._released = true;

  if (!this._updated)
    this._collection._request('release', this._key, null, callback(cb));
  else
    this._collection._request('setRelease',
                              this._key,
                              { json: JSON.stringify(this._json) },
                              callback(cb));
};


function callback(userCallback) {
  if (!userCallback)
    return null;
  else
    return function(err, msg) {
             if (err)
               userCallback(err);
             else if (msg.err)
               userCallback(err);
             else if (!msg.json)
               userCallback(null);
             else
               userCallback(null);
           };
}
