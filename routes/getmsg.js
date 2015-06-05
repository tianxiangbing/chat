var express = require('express');
var router = express.Router();
var db = require('../db/mysql');
/* GET users listing. */

router.get('/', function(req, res, next) {
	var conn = db.connect();
	conn.query('select * from chatmsg order by time asc limit 0,20 ', function(err, result) {
		console.log('err:' + err);
		console.log(result)
		if (!err) {
			res.send(result)
		} else {
			res.send('[]');
		}
	});
	conn.end();
});

module.exports = router;