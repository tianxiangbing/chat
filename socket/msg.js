var db = require('../db/mysql');
var sio = require('socket.io');
var IO = function(server) {
	var io = sio.listen(server)
	var users = {},
		usocket = {};
	var counter = 0;
	var home = {};
	var xss = require('xss');
	var drawlist = ['杯子', '苹果', '香蕉', '花',"乌龟","大象","飞机","手枪","蛋糕","火车","椅子","桌子","大树"];
	var quest = "";
	var interval = null;
	// 添加或更新白名单中的标签 标签名（小写） = ['允许的属性列表（小写）']
	xss.whiteList['img'] = ['src'];
	// 删除默认的白名单标签
	delete xss.whiteList['div'];
	// 自定义处理不在白名单中的标签
	xss.onIgnoreTag = function(tag, html) {
		// tag：当前标签名（小写），如：a
		// html：当前标签的HTML代码，如：<a href="ooxx">
		// 返回新的标签HTML代码，如果想使用默认的处理方式，不返回任何值即可
		// 比如将标签替换为[removed]：return '[removed]';
		// 以下为默认的处理代码：
		return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function Quest() {
		//随机出题
		outQuest();
		//interval = setInterval(outQuest, 60000);
	}

	function outQuest() {
		quest = drawlist[Math.floor(drawlist.length * Math.random())];
		console.log("quest:" + quest)
		home.socket.emit('quest', quest);
		sendmsg({
			type: 0,
			msg: "有个傻逼在画画，快来猜他画的是什么玩意儿。它可能会画( "+ drawlist.join(',')+")"
		});
		setTimeout(function() {
			homeLeave(home.name);
		}, 30000)
	}

	io.on('connection', function(socket) {
		console.log('a user connected.');
		var username = "";
		socket.broadcast.emit('hi', {})
		socket.on('disconnect', function() {
			console.log('user disconnected.');
		});
		socket.on('chat message', function(data) {
			var msg = data.msg
			data.user = xss(username || data.user);
			users[username] = data.user;
			data.msg = xss(msg);
			data.time = +new Date();
			console.log(data)
			if (!data.to) {
				console.log('public')
				sendmsg(data);
			} else {
				data.type = 2; //悄悄话
				console.log("one")
				sendUserMsg(data);
			}
			insertData(data);
			if(data.msg == quest && username !==home.name){
				sendmsg({
					type: 0,
					msg: "恭喜"+username+"猜出题目。为他贺彩!!同时【"+home.name+"】画得也有模有样！"
				});
				homeLeave(home.name);
			}
		});
		socket.on('user join', function(data) {
			counter++;
			username = xss(data.user);
			users[username] = username;
			usocket[username] = socket;
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
				delete users[username];
				delete usocket[username];
				if (home.name == username) {
					homeLeave(username);
				}
				sendmsg({
					type: 0,
					msg: "用户<b>" + username + "</b>离开聊天室",
					counter: counter,
					users: users
				})
			}
		});
		//绘画
		socket.on("draw", function(data) {
			if (data.user == home.name) {
				io.emit('draw', data);
			}
		})
		socket.on("home", function(data) {
			console.log('home:' + home.name)
			var user = data.user;
			if( !users[home.name] ){
				home = {};
			}
			if (!home.name) {
				home.name = user;
				home.socket = socket;
				usocket[user].emit('sys' + user, {
					user: user,
					msg: "当前房主(" + home.name + ");等他退出后，你就可以申请房主了."
				});
				Quest();
			} else {
				usocket[user].emit('sys' + user, {
					user: home.name,
					msg: "当前已经有房主(" + home.name + ");等他退出后，你就可以申请房主了."
				});
			}
			console.log('home:' + home.name)
		});
		socket.on('home leave', function(uname) {
			homeLeave(uname);
		})
	});

	function homeLeave(uname) {
		if (home.name && home.name == uname) {
			home = {};
			io.emit('home leave', uname);
		}
	}
	//插入数据库
	function insertData(data) {
		var conn = db.connect();
		var post = {
			msg: data.msg,
			uname: data.user,
			time: data.time.toString(),
			to: data.to
		};
		var query = conn.query('insert into chatmsg set ?', post, function(err, result) {
			console.log(err);
			console.log(result)
		})
		console.log(query.sql);
		conn.end();
	}

	function sendmsg(data) {
		io.emit('chat message', data);
	}

	function sendUserMsg(data) {
		if (data.to in usocket) {
			console.log('================')
			console.log('to' + data.to, data);
			usocket[data.to].emit('to' + data.to, data);
			usocket[data.user].emit('to' + data.user, data);
			console.log('================')
		}
	}
	/*
	io.emit('some event', {
		for: "everyone"
	});
	*/
}
module.exports = IO;