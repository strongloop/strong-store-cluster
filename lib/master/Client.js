

module.exports = Client;


var collection = require('../collection.js');


function Client(worker) {
  this._worker = worker;
  this._id = worker.id;
  this._locks = {};

  this._onMessage = this.onMessage.bind(this);

  worker.on('message', this._onMessage);
}

Client.prototype.onMessage = function(msg) {
  if (msg.type === 'DSM_REQUEST')
    this[msg.method](msg);
};

Client.prototype.get = function(msg) {
  var self = this,
      entry = collection(msg.collection)._entry(msg.key);

  entry.get(this._id, function(err, json) {
    if (err) self._sendError(msg, err);
    else self._sendReply(msg, { json: json });
  });
};

Client.prototype.set = function(msg) {
  var self = this,
      entry = collection(msg.collection)._entry(msg.key);

  entry.set(msg.json, this._id, function(err) {
    if (err) self._sendError(msg, err);
    else self._sendReply(msg);
  });
};

Client.prototype.acquire = function(msg) {
  var self = this,
      entry = collection(msg.collection)._entry(msg.key);

  entry.acquire(this._id, function(err, json) {
    if (err) self._sendError(msg, err);
    else self._sendReply(msg, { json: json });
  });
};

Client.prototype.release = function(msg) {
  var self = this,
      entry = collection(msg.collection)._entry(msg.key);

  entry.release(this._id, function(err, json) {
    if (err) self._sendError(msg, err);
    else self._sendReply(msg);
  });
};

Client.prototype.setRelease = function(msg) {
  var self = this,
      entry = collection(msg.collection)._entry(msg.key);

  entry.setRelease(msg.json, this._id, function(err) {
    if (err) self._sendError(msg, err);
    else self._sendReply(msg);
  });
};

Client.prototype.configure = function(msg) {
  var coll = collection(msg.collection),
      err = undefined;

  try {
    coll._applyConfig(msg.config);
    this._sendReply(msg);
  } catch (err) {
    this._sendError(msg, err);
  }
};

// This function clobbers the data argument if specified!
Client.prototype._sendReply = function(msg, data) {
  if (!msg.requestId)
    return;

  data = data || {};
  data.type = 'DSM_REPLY';
  data.requestId = msg.requestId;
  data.err = undefined;
  this._worker.send(data);
};

Client.prototype._sendError = function(msg, err) {
  if (!msg.requestId)
    return;

  var data = {};
  data.type = 'DSM_REPLY';
  data.requestId = msg.requestId;
  data.err = err;
  this._worker.send(data);
};
