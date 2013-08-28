# Strong Store Cluster

Strong Store for Cluster provides a key/value collection that can be accesses by
all processes in a node cluster.

## Example

```javascript
// get the collection and give it a name
var collection = require('strong-store-cluster').collection('test');

// don't let keys expire, ever - the number represents seconds
collection.configure({ expireKeys: 0 });

collection.set('ThisIsMyKey', { a: 0, b: 'Hiya', c: { d: 99}}, function(err) {
  if (err) {
    console.error('There was an error');
    return;
  }

  collection.get('ThisIsMyKey', function(err, obj) {
    if (err) {
      console.error('There was an error in collection.get.');
      return;
    }

    console.log('The object: ',obj);
  });
});
```

## API documentation

### store.collection(name)

Returns a Collection object which lets you share data between node processes.

### Class: Collection

A `Collection` instance provides access to a shared key-value store
shared by multiple node instances.

How collections are named and stored is determined by the storage backend. The
`strong-store-cluster` implementation stores collections in the master process
(if you're using cluster), and accepts any arbitrary string as a collection
name.

A `Collection` object is also an `EventEmitter`.


#### collection.configure([options])

* `options` (`Object`) contains configurations options to be changed
  * `expireKeys` (`Number`) seconds after which keys in this
    collection are to be expired.

Set configuration options for the collection.

Currently only one configurable option is supported: `expireKeys`. When set
to a nonzero value, keys will automatically expire after they've not been
read or updated for some time. The timeout is specified in seconds. There's no
guarantee that the key will be discared after exactly that number of seconds
has passed. However keys will never be automatically deleted _sooner_ than what
the `expireKeys` setting allows.

It is perfectly legal to call the `configure` method from multiple node
processes (e.g. both in a worker and in the master process). However you
should be careful to set the _same_ option values every time, otherwise the
effect is undefined.


#### collection.get(key, callback)

* `key` (`String`) key to retrieve
* `callback` (`Function`) called when the value has been retrieved

Read the value associated with a particular key. The callback is called with
two arguments, `(err, value)`. When the key wasn't found in the collection, it
is automatically created and it's `value` is set to `undefined`.


#### collection.set(key, [value], [callback])

* `key` (`String`) key to set or update
* `value` (`object`) value to associate with the key
* `callback` (`Function`) called when the value has been retrieved

Set the value associated with `key`. The `value` must be either undefined or
a value that can be serialized with JSON.stringify.

When the `value` parameter is omitted or set to `undefined`, the key is
deleted, so effectively it's the same as calling `collection.del(key)`.

The `callback` function receives only one argument, `err`. When the
callback is omitted, the master process does not send a confirmation
after updating the key, and any errors are silently ignored.


#### collection.del(key, [callback])

* `key` (`String`) key to delete
* `callback` (`Function`) called when the value has been retrieved

Delete a key from the collection.

This operation is the equivalent of setting the key to `undefined`.

The `callback` function receives only one argument, `err`. When the
callback is omitted, the master process does not send a confirmation
after deleting the key, and any errors are silently ignored.


#### collection.acquire(key, callback)

* `key` (`String`) key to delete
* `callback` (`Function`) called when the key has been locked

Lock a key for exclusive read and write access.

The `acquire` methods waits until it can grab an exclusive lock on the
specified key. When the lock is acquired, no other process can read, write or
delete this particular key. When the lock is no longer needed, it should be
relinquished with `keylock.release()`.

Three parameters are passed to the `callback` function:
`(err, keylock, value)`. The `keylock` argument receives a `KeyLock` class
instance, which lets you read and manipulate the key's value as well as
eventually release the lock. The `value` argument is set to the initial value
associated with the key.


#### Event: 'error'

* `err` (`Error`)

The error event is emitted whenever an unrecoverable error is encountered.

### Class: KeyLock

A `KeyLock` instance represents a key that has been locked. The `KeyLock`
class implements methods that lets you manipulate the key and release
the lock.


#### keylock.get()

* Returns: (`Object`) value that's currently associated with the key

This function returns the value that's currently associated with the locked
key.

Initially this is the same as the `value` argument that was passed to the
`collection.acquire()` callback, but it does immediately reflect changes that
are made with `keylock.set()` and `keylock.del()`.


#### keylock.set([value])

Updates the value associated with a locked key.

The change isn't pushed back to the master process immediately; the change
is committed when the lock is released again. The change however is reflected
immediately in the return value from `keylock.get()`.

After the lock has been released, the key can no longer be updated through the
`KeyLock` instance. Any attempt to do so will make it throw.

Setting the value to `undefined` marks the key for deletion, e.g. it's
equivalent to `keylock.del()`.


#### keylock.del()

Mark a locked key for deletion. See `keylock.set()`.


#### keylock.release([callback])

Release the lock that protects a key. If the key was updated with
`keylock.set()` or `keylock.del()`, these changes are committed.

When a lock has been released, it is no longer possible to manipulate the
key using `KeyLock` methods. Releasing the lock twice isn't allowed either.
The `get()` method will still work but it won't reflect any value changes
that were made after releasing.

The `callback` function receives only one argument, `err`. When the
callback is omitted, the master process does not send a confirmation
after releasing the key, and any errors are silently ignored.
