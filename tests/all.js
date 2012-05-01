(function () {
	var t = db.jstests_all;
	t.drop();

	t.save( { a : { b : 'foo', c : 'bar' }, d : 42 } );

	// result can't really be queried b/c it's not a real collection
	r = t.flatten();
	assert.eq( 1, r.find().length );

	// now we can query since we stored our results in a collection
	r = t.flatten('jstests_all_results');
	assert.eq( 1, r.find().count() );
	// search for keys
	assert.eq( 1, r.find({'value.data.k':'_id'}).count() );
	assert.eq( 1, r.find({'value.data.k':'a.b'}).count() );
	assert.eq( 1, r.find({'value.data.k':'a.c'}).count() );
	assert.eq( 1, r.find({'value.data.k':'d'}).count() );
	// these keys shouldn't exist
	assert.eq( 0, r.find({'value.data.k':'a'}).count() );
	assert.eq( 0, r.find({'value.data.k':'e'}).count() );
	assert.eq( 0, r.find({'value.data.k':'e'}).count() );
	// search for values
	assert.eq( 1, r.find({'value.data.v':'foo'}).count() );
	assert.eq( 1, r.find({'value.data.v':'bar'}).count() );
	assert.eq( 1, r.find({'value.data.v':42}).count() );
	// these values don't exist
	assert.eq( 0, r.find({'value.data.k':'foobar'}).count() );
	assert.eq( 0, r.find({'value.data.k':111}).count() );

	t.drop();
	db.jstests_all_results.drop();
}());