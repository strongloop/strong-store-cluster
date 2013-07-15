
module.exports = Entry;


var assert = require('assert');


function Entry(collection, key) {
  this._collection = collection;
  this._key = key;
  this._value = undefined;
  this._queue = [];
  this._age = 0;
}

Entry.prototype.get = function(requestor, cb) {
  var self = this;

  if (!this._queue.length) {
    var value = self._value;
    self._age = 0;

    process.nextTick(function() {
      cb(null, value);
    });

  } else {
    this.acquire(requestor, function(err) {
      self.release(requestor, noop);
      cb(null, self._value);
    });
  }
};

Entry.prototype.set = function(newValue, requestor, cb) {
  var self = this;

  if (!this._queue.length) {
    this._value = newValue;
    this._age = 0;

    if (newValue === undefined)
      this._collection._remove(this._key);

    process.nextTick(cb);

  } else {
    this.acquire(requestor, function() {
      self._value = newValue;

      if (newValue !== undefined)
        self.release(requestor, cb);
      else {
        self._collection._remove(self._key);
        cb();
      }
    });
  }
};

Entry.prototype.acquire = function(requestor, cb) {
  var self = this;

  this._queue.push([cb, requestor]);

  if (this._queue.length === 1) {
    process.nextTick(function() {
      cb(null, self._value);
    });
  }
};

Entry.prototype.release = function(requestor, cb) {
  var self = this,
      queue = this._queue;

  setImmediate(function() {
    assert.strictEqual(requestor, queue.shift()[1]);

    self._age = 0;
    cb();

    if (queue.length)
      queue[0][0](null, self._value);
  });
};

Entry.prototype.setRelease = function(newValue, requestor, cb) {
  this._value = newValue;
  this.release(requestor, cb);
};


Entry.prototype.age = function(d) {
  if (this._queue.length)
    return this._age = 0;
  else
    return this._age += (d || 0);
};


function noop() {
}
