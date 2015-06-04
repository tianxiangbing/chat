var mongodb = require('mongodb');
var mongodbServer = new mongodb.Server('localhost', 27017, {
	auto_reconnect: true,
	poolSize: 10
});
var db = new mongodb.Db('chat', mongodbServer);
module.exports = db