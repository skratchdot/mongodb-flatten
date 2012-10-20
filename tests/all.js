(function () {
	var t = db.jstests_all;
	t.drop();

	// insert 1 document
	t.save( { a : { b : 'foo', c : 'bar' }, d : 42, e : 'foo' } );

	// now we can query since we stored our results in a collection
	r = t.flatten('jstests_all_results');
	assert.eq( 1, r.distinct('i').length ) // There is 1 document
	assert.eq( 5, r.find().count() ); // There are 5 keys

	// search for keys
	assert.eq( 1, r.find({'k':'_id'}).count() );
	assert.eq( 1, r.find({'k':'a.b'}).count() );
	assert.eq( 1, r.find({'k':'a.c'}).count() );
	assert.eq( 1, r.find({'k':'d'}).count() );

	// these keys shouldn't exist
	assert.eq( 0, r.find({'k':'a'}).count() );
	assert.eq( 0, r.find({'k':'f'}).count() );

	// search for values
	assert.eq( 2, r.find({'v':'foo'}).count() ); // a.b==='foo' && e==='foo'
	assert.eq( 1, r.find({'v':'bar'}).count() );
	assert.eq( 1, r.find({'v':42}).count() );

	// these values don't exist
	assert.eq( 0, r.find({'k':'foobar'}).count() );
	assert.eq( 0, r.find({'k':111}).count() );

	t.drop();
	db.jstests_all_results.drop();
}());