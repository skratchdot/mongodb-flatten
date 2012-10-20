/*global DBCollection, DBQuery, print */
/*jslint devel: false, unparam: true, nomen: true, maxerr: 50, indent: 4, plusplus: true */
/**
 * MongoDB - flatten.js
 * 
 *      Version: 1.1
 *         Date: October 20, 2012
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
		currentId = null, currentDate = null, currentTick = null, previousTick = null;

	// Assumes that currentTick is a Date, and currentId is a number
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
	 * @param {} db - the current mongo database. We will return db.getCollection(collectionName)
	 * @param {} arr - loop through this array flattening items, and storing them in collectionName
	 * @param {string} collectionName - the name of the collection in which the results will be stored
	 */
	flatten = function (db, arr, collectionName) {
		var collection, i;

		// If an invalid name is passed, create a temporary collection
		if (typeof collectionName !== 'string' || collectionName.length === 0) {
			collectionName = 'temp.flatten_' + new Date().getTime();
		}

		// Print some debug info
		print('Flattening ' + arr.length + ' document(s) into the "' + collectionName + '" collection.');

		// Get our collection
		collection = db.getCollection(collectionName);

		// Empty our collection
		collection.remove();

		// Initialize some global counters/variables
		previousTick = new Date().getTime();
		currentId = 0;

		// Loop through all our objects, inserting records into our collection
		for (i = 0; i < arr.length; i++) {
			// Output some debugging info if needed
			currentDate = new Date();
			currentTick = currentDate.getTime();
			if (currentTick - previousTick > 1000) {
				print('Flattened ' + i + ' document(s) and ' + currentId + ' key(s) at ' + currentDate);
				previousTick = currentTick;
			}

			// There's a chance documents don't have
			// _id values (capped collections, internal collections)
			if (!arr[i].hasOwnProperty('_id')) {
				arr[i]._id = 'unknown';
			}

			// Insert key/value pairs into our new collection
			emitKeys(collection, arr[i]._id, arr[i], '');
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
		return flatten(this._db, this.toArray(), collectionName);
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