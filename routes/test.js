var express = require('express');
var router = express.Router();
var db = require('../db/conn');

/* GET users listing. */
router.get('/', function(req, res, next) {
	db.open(function() {
		db.collection('users', {
			safe: true
		}, function(err,collection) {
			collection.find().toArray(function(e,docs){
				if (e) throw e;
				console.log(docs);
				res.render('test',{users:docs});
			});
		});
	});
	//res.render('test');
});

module.exports = router;