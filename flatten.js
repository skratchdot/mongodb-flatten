/*global DBCollection, DBQuery, print */
/*jslint devel: false, unparam: true, nomen: true, maxerr: 50, indent: 4, plusplus: true */
/**
 * MongoDB - flatten.js
 * 
 *      Version: 1.3
 *         Date: October 22, 2012
 *      Project: http://skratchdot.com/projects/mongodb-flatten/
 *  Source Code: https://github.com/skratchdot/mongodb-flatten/
 *       Issues: https://github.com/skratchdot/mongodb-flatten/issues/
 * Dependencies: MongoDB v1.8+
 * 
 * Copyright (c) 2012 SKRATCHDOT.COM
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function () {
	'use strict';

	var currentDb, emitKeys, insertKey, flatten,
		statusDelayInMs = 10000,
		currentId = null, currentDate = null, currentTick = null, previousTick = null;

	/**
	 * @function
	 * @name insertKey
	 * @memberOf anonymous
	 * @param {DBCollection} collection - the collection we are storing our flattened data in
	 * @param {ObjectId/object} id - the id of the document being flattened
	 * @param {string} key - the flattened key
	 * @param {any} value - the value of the flattened key
	 */
	insertKey = function (collection, id, key, value) {
		// Increment our currentId
		currentId = currentId + 1;

		// Insert document into our collection
		collection.insert({
			'_id' : currentId,
			'i' : id,
			'k' : key,
			'v' : value
		});
	};

	/**
	 * @function
	 * @name emitKeys
	 * @memberOf anonymous
	 * @param {DBCollection} collection - the collection we are storing our flattened data in
	 * @param {ObjectId/object} id - the id of the document being flattened
	 * @param {object} node - the current node being flattened. initially this is the entire document
	 * @param {string} keyString - the current key/path. will be built recursively. initially an empty string.
	 */
	emitKeys = function (collection, id, node, keyString) {
		var key, newKey, type = typeof (node);
		if (type === 'object' || type === 'array') {
			for (key in node) {
				if (node.hasOwnProperty(key)) {
					newKey = (keyString === '' ? key : keyString + '.' + key);
					if (newKey === '_id') {
						insertKey(collection, id, '_id', node[key]);
					} else {
						emitKeys(collection, id, node[key], newKey);
					}
				}
			}
		} else {
			insertKey(collection, id, keyString, node);
		}
	};

	/**
	 * @function
	 * @name flatten
	 * @memberOf anonymous
	 * @param {DBQuery} query - the current DBQuery object/cursor
	 * @param {string} collectionName - the name of the collection in which the results will be stored
	 */
	flatten = function (query, collectionName) {
		var collection, i, numDocs = query.size(), currentDoc, currentDocNum;

		// If an invalid name is passed, create a temporary collection
		if (typeof collectionName !== 'string' || collectionName.length === 0) {
			collectionName = 'temp.flatten_' + new Date().getTime();
		}

		// Print some debug info
		print('Flattening ' + numDocs + ' document(s) into the "' + collectionName + '" collection.');

		// Get our collection
		collection = query._db.getCollection(collectionName);

		// Empty our collection
		collection.drop();

		// Index our collection to speed up lookups
		collection.ensureIndex({i : 1});
		collection.ensureIndex({k : 1});
		collection.ensureIndex({v : 1});

		// Initialize some global counters/variables
		previousTick = new Date().getTime();
		currentId = 0;
		currentDocNum = 0;

		// Loop through all our objects, inserting records into our collection
		while (query.hasNext()) {
			// The current document we are processing
			currentDoc = query.next();
			currentDocNum++;

			// Output some debugging info if needed
			currentDate = new Date();
			currentTick = currentDate.getTime();
			if (currentTick - previousTick > statusDelayInMs) {
				print('Flattened ' + currentDocNum + ' of ' + numDocs + ' document(s) and ' + currentId + ' key(s) at ' + currentDate);
				previousTick = currentTick;
			}

			// There's a chance documents don't have
			// _id values (capped collections, internal collections)
			if (!currentDoc.hasOwnProperty('_id')) {
				currentDoc._id = 'unknown';
			}

			// Insert key/value pairs into our new collection
			emitKeys(collection, currentDoc._id, currentDoc, '');
		}

		return collection;
	};

	/**
	 * @function
	 * @name flatten
	 * @memberOf DBQuery
	 * @param {string} collectionName - the name of the collection in which the results will be stored
	 */
	DBQuery.prototype.flatten = function (collectionName) {
		return flatten(this, collectionName);
	};

	/**
	 * @function
	 * @name flatten
	 * @memberOf DBCollection
	 * @param {string} collectionName - the name of the collection in which the results will be stored
	 */
	DBCollection.prototype.flatten = function (collectionName) {
		return this.find().flatten(collectionName);
	};

}());