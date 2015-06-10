/*
 * Created with Sublime Text 2.
 * User: 田想兵
 * Date: 2015-03-09
 * Time: 17:02:02
 * Contact: 55342775@qq.com
 * desc :绘画板
 */
;
var drawboard = document.getElementById("drawboard");
function send(content,type) {
	now = +new Date();
    //向comet_broadcast.asyn发送请求，消息体为文本框content中的内容，请求接收类为AsnyHandler
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
		img.src = result.msg;
		// $("body").append(img)
		img.onload = function() {
			ctx.clearRect(0, 0, $(drawboard).width(), $(drawboard).height());
			ctx.drawImage(img, 0, 0);
		}
	} else {
		addMsg(result);
	}
}
if (drawboard.getContext) {
	var ctx = drawboard.getContext("2d");
	var start = false;
	ctx.lineCap = "round";
	ctx.lineWidth = 3;
	ctx.strokeStyle = colorArr[Math.floor(colorArr.length * Math.random())];
	$(drawboard).bind("mousedown", function(e) {
		start = true;
		var x = e.layerX + 2;
		var y = e.layerY + 5;
		ctx.beginPath();
		ctx.moveTo(x, y);
	}).bind("mousemove", function(e) {
		if (start) {
			var x = e.layerX + 2;
			var y = e.layerY + 5;
			ctx.lineTo(x, y);
			ctx.stroke();
		}
	}).bind("mouseup", function(e) {
		start = false;
		ctx.closePath();
		if (isDraw) {
			send(drawboard.toDataURL("image/gif"), "draw");
		}
	});
} else {
	$(drawboard).hide();
}