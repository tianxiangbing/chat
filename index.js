#!/usr/bin/env node

/*
 * Created with Sublime Text 2.
 * User: 田想兵
 * Date: 2015-06-04
 * 网址:http://www.lovewebgames.com
 * 聊天室：http://chat.lovewebgames.com
 * Time: 17:02:02
 * Contact: 55342775@qq.com
 */
/**
 * Module dependencies.
 */

var app = require('./app');
var debug = require('debug')('web:server');
var http = require('http');

var db = require('./db/mysql');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '8090');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

var io = require('socket.io')(server);

var users = {};
var counter = 0;
var xss = require('xss');

io.on('connection', function(socket) {
	console.log('a user connected.');
	var username = "";
	socket.broadcast.emit('hi', {})
	socket.on('disconnect', function() {
		console.log('user disconnected.');
	});
	socket.on('chat message', function(data) {
		var msg= data.msg
		var data = {};
		data.user = xss( username || data.user);
		users[username] = data.user;
		data.msg =  xss(msg);
		data.time = +new Date();
		sendmsg(data);
		insertData(data);
	});
	socket.on('user join', function(data) {
		counter++;
		username = xss(data.user);
		users[username] = xss(username);
		console.log('join:' + data.user);
		data.type = 0;
		data.users = users;
		data.counter = counter;
		data.msg = "欢迎<b>" + data.user + "</b>进入聊天室";
		sendmsg(data);
	});
	socket.on('disconnect', function() {
		console.log('disconnect')
		if (username) {
			counter--;
			delete users[username]
			sendmsg({
				type: 0,
				msg: "用户<b>" + username + "</b>离开聊天室",
				counter:counter,
				users:users
			})
		}
	});
});
//插入数据库
function insertData(data) {
	var conn = db.connect();
	var post = {
		msg: data.msg,
		uname: data.user
		,time:data.time.toString()
	};
	var query = conn.query('insert into chatmsg set ?', post, function(err,result) {
		console.log(err);
		console.log(result)
	})
	console.log(query.sql);
	conn.end();
}

function sendmsg(data) {
	io.emit('chat message', data);
}

io.emit('some event', {
	for: "everyone"
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	var addr = server.address();
	var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	debug('Listening on ' + bind);
}