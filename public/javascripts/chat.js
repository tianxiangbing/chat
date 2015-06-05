;
$(function() {
    var user = "";
    $("#okname").click(function() {
        user = $.trim($("#u").val());
        if (user.length == 0) {
            alert('请填写昵称');
            $("#u").focus();
            return false;
        };
        $.get('/getmsg', {}, function(result) {
            for (var i = 0, l = result.length; i < l; i++) {
                var data = result[i];
                data.user= data.uname;
                formatMsg(data);
            }
        }, 'json');
        socket.emit('user join', {
            user: user
        });
        $('#inputName').hide();
        $('#chat').show();
    });
    var socket = io();
    $('form').submit(function() {
        if ($("#u").val().length == 0) {
            alert('请填写昵称');
            return false;
        }
        if ($("#m").val().length == 0) {
            alert('内容不能为空!');
            return false;
        }
        socket.emit('chat message', {
            msg: $('#m').val(),
            user: $('#u').val()
        });
        $('#m').val('');
        return false;
    });

    function formatMsg(data) {
        if (data.type === 0) {
            $('#messages').append($('<li class="notice">系统通知：' + data.msg + '</li>'))
        } else {
            var cls = '';
            if (data.user == $("#u").val()) {
                cls = ' mine ';
            }
            $('#messages').append($('<li class="msg ' + cls + '"><p><b>' + data.user + '</b>：<span>(' + data.time + ')</span></p><div>' + data.msg + '</div></li>'))
        };
        if (data.counter) {
            $('#online').html('当前在线人数：' + data.counter + "人.");
            if (data.users) {
                var html = '';
                for (var i in data.users) {
                    html += '<li title="' + data.users[i] + '">' + data.users[i] + '</li>';
                }
                $('#userlist').html(html);
            }
        }
        $(window).scrollTop(9999);
    }
    socket.on('chat message', function(data) {
        formatMsg(data);
    });
    socket.on('hi', function() {});
});