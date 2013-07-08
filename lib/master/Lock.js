

module.exports = Lock;


function Lock(entry, json) {
  this._entry = entry;
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

  cb = cb || noop;
  this._released = true;

  if (!this._updated)
    this._entry.release(-1, cb);
  else
    this._entry.setRelease(this._json, -1, cb);
};


function noop() {
}
