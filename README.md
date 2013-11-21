# Strong Store Cluster

Strong Store for Cluster provides a key/value collection that can be accesses by
all processes in a node cluster.

For API documentation, see [strong-store-cluster API reference](api.md).

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
