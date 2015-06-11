/*
 * Created with Sublime Text 2.
 * User: 田想兵
 * Date: 2015-03-09
 * Time: 17:02:02
 * Contact: 55342775@qq.com
 * desc :绘画板
 */
;
var Draw = {
	init: function(socket, user) {
		var drawboard = document.getElementById("drawboard");
		var ishome = false; //是否是房主

		function send(content, type) {
			now = +new Date();
			//向comet_broadcast.asyn发送请求，消息体为文本框content中的内容，请求接收类为AsnyHandler
			socket.emit('draw', {
				data: content,
				type: type,
				user: user
			});
		};
		$('#home').click(function() {
			socket.emit('home', {
				user: user
			})
		});
		socket.on('draw', function(data) {
			//console.log(data);
			ProcessingData(data);
		});
		socket.on('quest',function(quest){
			$('#messages').append($('<li class="notice">系统通知，您要画的是：' +quest + '</li>'));
			$('#messages').scrollTop(99999);
		})
		socket.on('sys' + user, function(data) {
			if (data.user == user) {
				ishome = true;
				$('#leave').show();
				$('#clear').show();
			} else {
				ishome = false;
				$('#clear').hide();
				$('#leave').hide();
			}
			$('#showHome').html('当前是<b>' + data.user + '</b>在画画，猜猜他在画什么？')
			$('#messages').append($('<li class="notice">系统通知：' + data.msg + '</li>'));
			$('#messages').scrollTop(99999);
		});
		$('#leave').click(function() {
			//下位
			socket.emit("home leave", user);
			$('#leave').hide();
			ishome = false;
		});
		$('#clear').click(function(){
			if (ishome) {
				var ctx = drawboard.getContext("2d");
				ctx.clearRect(0, 0, $(drawboard).width(), $(drawboard).height());
				send("", "clear");
			}
		});
		socket.on('home leave', function(username) {
			$('#showHome').html('当前无人在画画，快来申请作画让其他人猜吧？')
		});

		if (drawboard.getContext) {
			var ctx = drawboard.getContext("2d");
			var start = false;
			ctx.lineCap = "round";
			ctx.lineWidth = 2;
			ctx.strokeStyle = "blue";
			$(drawboard).bind("mousedown", function(e) {
				if (!ishome) return;
				start = true;
				var x = e.offsetX;
				var y = e.offsetY + 18;
				ctx.beginPath();
				ctx.moveTo(x, y);
			}).bind("mousemove", function(e) {
				if (start) {
					var x = e.offsetX;
					var y = e.offsetY + 18;
					ctx.lineTo(x, y);
					ctx.stroke();
				}
			}).bind("mouseup", function(e) {
				start = false;
				ctx.closePath();
				send(drawboard.toDataURL("image/gif"), "draw");
			}).bind('mouseout', function(e) {
				if (start) {
					start = false;
					ctx.closePath();
					send(drawboard.toDataURL("image/gif"), "draw");
				}
			});
		} else {
			$(drawboard).hide();
		}

		function ProcessingData(result) {
			if (result.type == "clear") {
				var ctx = drawboard.getContext("2d");
				ctx.clearRect(0, 0, $(drawboard).width(), $(drawboard).height());
				return true;
			}
			if (result.type == "draw" && drawboard.getContext) {
				var ctx = drawboard.getContext("2d");
				var img = document.createElement("img");
				img.src = result.data;
				img.onload = function() {
					ctx.clearRect(0, 0, $(drawboard).width(), $(drawboard).height());
					ctx.drawImage(img, 0, 0);
				}
			}
		}
	}
}