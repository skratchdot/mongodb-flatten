/*global DBCollection: false, emit: false */
/*jslint devel: false, unparam: true, nomen: true, maxerr: 50, indent: 4 */
/**
 * MongoDB - flatten.js
 * 
 *      Version: 1.0
 *         Date: April 29, 2012
 *      Project: http://skratchdot.github.com/mongodb-flatten/
 *  Source Code: https://github.com/skratchdot/mongodb-flatten/
 *       Issues: https://github.com/skratchdot/mongodb-flatten/issues/
 * Dependencies: MongoDB v1.8+
 * 
 * Description:
 * 
 * The flatten() function is a mapReduce that flattens documents into
 * key/value pairs.  Since this is a mapReduce, you can access the 
 * keys via 'value.data.k' and the values via 'value.data.v'.
 * 
 * Usage:
 * 
 * // Flatten all user documents, and return the result inline.
 * result = db.users.flatten();
 * 
 * // Flatten all user documents, and store the result in the users_flattened collection
 * result = db.users.flatten('users_flattened');
 * 
 * // Flatten user documents that have the first name of Bob. Store in a collection
 * db.users.flatten({
 *     'out' : 'users_flattened',
 *     'query' : { 'name.first' : 'Bob' }
 * });
 * 
 * // Get the number of keys in one document
 * db.users.flatten({
 *     query : { '_id' : ObjectId('4f9c2374992274fc8d468675') }
 * }).results[0].value.data.length;
 * 
 * Copyright (c) 2012 SKRATCHDOT.COM
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
(function () {
	'use strict';

	/**
	 * @function
	 * @name flatten
	 * @memberOf DBCollection
	 * @param {object} optionsOrOutString This function accepts the same options as mapReduce
	 */
	DBCollection.prototype.flatten = function (optionsOrOutString) {
		var map, reduce, options = {};

		// Declare our map function
		// This will emit keyStrings for all the simple values (aka non-object and non-array)
		map = function () {
			var emitKeys = function (id, node, keyString) {
				var key, newKey, type = typeof (node);
				if (type === 'object' || type === 'array') {
					for (key in node) {
						if (node.hasOwnProperty(key)) {
							newKey = (keyString === '' ? key : keyString + '.' + key);
							if (newKey === '_id') {
								emit(id, {k : '_id', v : node[key]});
							} else {
								emitKeys(id, node[key], newKey);
							}
						}
					}
				} else {
					emit(id, {k : keyString, v : node});
				}
			};
			emitKeys(this._id, this, '');
		};

		// Declare our reduce function
		reduce = function (key, values) {
			return { data : values };
		};

		// Start to setup our options struct
		if (typeof optionsOrOutString === 'object') {
			options = optionsOrOutString;
		} else if (typeof optionsOrOutString === 'string') {
			options.out = optionsOrOutString;
		}

		// The default value for out is 'inline'
		if (!options.hasOwnProperty('out')) {
			options.out = { inline : 1 };
		}

		// Make sure to override certain options
		options.map = map;
		options.reduce = reduce;
		options.mapreduce = this._shortName;

		// Execute and return
		return this.mapReduce(map, reduce, options);
	};

}());