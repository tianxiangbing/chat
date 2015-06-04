var db = require('../db/mysql');
var express = require('express');
var router = express.Router();
/* GET users listing. */

router.get('/', function(req, res, next) {
	/* open db 
	db.open(function() {
		db.collection('users', {
			safe: true
		}, function(err,collection) {
			collection.find().toArray(function(e,docs){
				if (e) throw e;
				console.log(docs);
				res.render('index',{users:docs});
			});
		});
	});
	*/
	res.render('index',{title:"聊天室."});
});

module.exports = router;