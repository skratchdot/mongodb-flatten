# MongoDB - flatten.js #

[Project Page](http://skratchdot.com/projects/mongodb-flatten/)  
[Source Code](https://github.com/skratchdot/mongodb-flatten/)  
[Issues](https://github.com/skratchdot/mongodb-flatten/issues/)  

## Description: ##

This project provides a way to flatten documents into id/key/value
pairs. The flatten() function accepts a collectionName parameter.
This collection will be emptied, and the newly flattened data will
be stored there. If a collectionName is not passed, then a temporary
collection will be created with a name in the format: temp.flatten_TIMESTAMP.

## Usage: ##

```javascript
// Flatten all user documents, and store the results in: temp.flatten_TIMESTAMP
result = db.users.flatten();

// Flatten all user documents, and store the result in the users_flattened collection
result = db.users.flatten('users_flattened');

// Flatten user documents that have the first name of Bob. Store in a collection
result = db.users.find({ 'name.first' : 'Bob' }).flatten('users_flattened');

// Flatten the first 20 user documents into a dynamically named collection
result = db.users.find().limit(20).flatten();

// Get the number of keys in one document
db.users.find({
	'_id' : ObjectId('4f9c2374992274fc8d468675')
}).flatten().count();
```

## Installation: ##

Download: [flatten.js](https://github.com/skratchdot/mongodb-flatten/raw/master/flatten.js)

### Option 1 ###

Add this script to your .mongorc.js file.  

See: [http://www.mongodb.org/display/DOCS/Overview+-+The+MongoDB+Interactive+Shell#Overview-TheMongoDBInteractiveShell-.mongorc.js](http://www.mongodb.org/display/DOCS/Overview+-+The+MongoDB+Interactive+Shell#Overview-TheMongoDBInteractiveShell-.mongorc.js)

### Option 2 ###

Start the shell after executing this script  

    mongo --shell flatten.js
