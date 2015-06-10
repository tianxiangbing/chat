var express = require('express');
var router = express.Router();
/* GET users listing. */

router.get('/', function(req, res, next) {
	res.render('index',{title:"绝情谷聊天室"});
});

module.exports = router;