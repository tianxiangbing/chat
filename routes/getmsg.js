var express = require('express');
var router = express.Router();
var db = require('../db/mysql');
/* GET users listing. */

router.get('/', function(req, res, next) {
	var conn = db.connect();
	var query = conn.query('select * from chatmsg  where uname="'+req.query.name+'" or `to` =""  or `to` is null or `to`="'+req.query.name+'" order by time desc limit 0,20 ', function(err, result) {
		console.log('err:' + err);
		console.log(result)
		if (!err) {
			res.send(result)
		} else {
			res.send('[]');
		}
	});
	console.log(query.sql);
	conn.end();
});

module.exports = router;