
module.exports = Entry;


var assert = require('assert');


function Entry(collection, key) {
  this.collection = collection
  this.key = key;
  this.value = undefined;
  this.queue = [];
}

Entry.prototype.get = function(requestor, cb) {
  var self = this;

  if (!this.queue.length) {
    var value = self.value;
    process.nextTick(function() {
      cb(null, value);
    });

  } else {
    this.acquire(requestor, function(err) {
      self.release(requestor, noop);
      cb(null, self.value);
    });
  }
}

Entry.prototype.set = function(newValue, requestor, cb) {
  var self = this;

  if (!this.queue.length) {
    this.value = newValue;
    if (newValue === undefined)
      this.collection._remove(this.key);
    process.nextTick(cb);

  } else {
    this.acquire(requestor, function() {
      self.value = newValue;
      if (newValue !== undefined)
        self.release(requestor, cb);
      else {
        self.collection._remove(self.key);
        cb();
      }
    });
  }
}

Entry.prototype.acquire = function(requestor, cb) {
  var self = this;

  this.queue.push([cb, requestor]);

  if (this.queue.length === 1)
    process.nextTick(function() {
      cb(null, self.value);
    });
}

Entry.prototype.release = function(requestor, cb) {
  var self = this,
      queue = this.queue;

  process.nextTick(function() {
    assert.strictEqual(requestor, queue.shift()[1]);

    cb();

    if (queue.length)
      queue[0][0](null, self.value);
  });
}

Entry.prototype.setRelease = function(newValue, requestor, cb) {
  this.value = newValue;
  this.release(requestor, cb);
}
