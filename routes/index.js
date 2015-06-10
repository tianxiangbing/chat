var express = require('express');
var router = express.Router();
var socket = require('../socket/msg');
/* GET users listing. */

router.get('/', function(req, res, next) {
	res.render('index',{title:"无情谷聊天室"});
});

module.exports = router;