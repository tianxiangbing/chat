;
$(function() {
    var user = "";
    var socket = null;
    $("#u").keydown(function(e) {
        if (e.keyCode == 13) {
            $("#okname").click();
        }
    })
    $("#okname").click(function() {
        user = $.trim($("#u").val());
        if (user.length == 0) {
            alert('请填写昵称');
            $("#u").focus();
            return false;
        };
        socket = io();
        socket.on('chat message', function(data) {
            formatMsg(data);
        });
        Draw.init(socket,user);
        $.get('/getmsg', {
            name: user
        }, function(result) {
            var html = '';
            for (var i = result.length - 1; i >= 0; i--) {
                var data = result[i];
                data.user = data.uname;
                var cls = '';
                if (data.user == $("#u").val()) {
                    cls = ' mine ';
                }
                html += '<li class="msg ' + cls + '"><p><b>' + data.user + '</b>：<span>(' + formatTime(data.time) + ')</span></p><div>' + data.msg + '</div></li>';
            }
            $('#messages').prepend(html);
            $('#messages').scrollTop(99999);
        }, 'json');
        $('#inputName').hide();
        $('#chat').show();
        socket.emit('user join', {
            user: user
        });
        //私聊
        // console.log('to'+user)
        socket.on('to' + user, function(data) {
            //console.log(data);
            formatMsg(data);
        })
    });
    $('#users').on('click', 'li', function() {
        var v = $(this).html();
        if ($('#sel_obj option[value="' + v + '"]').size()) {
            $('#sel_obj').val(v)
        } else {
            $('#sel_obj').append('<option value="' + v + '">' + v + '</option>');
            $('#sel_obj').val(v);
        }
    });
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
            user: user,
            to: $('#sel_obj').val()
        });
        $('#m').val('');
        return false;
    });

    function formatMsg(data) {
        if (data.type === 0) {
            $('#messages').append($('<li class="notice">系统通知：' + data.msg + '</li>'))
        } else {
            var cls = '',
                type = "";
            if (data.user == user) {
                cls += ' mine ';
            }
            if (data.type === 2) {
                cls += " private ";
                type = "（悄悄话）"
            }
            $('#messages').append($('<li class="msg ' + cls + '"><p><b>' + data.user + type + '</b>：<span>(' + formatTime(data.time) + ')</span></p><div>' + data.msg + '</div></li>'))
        };
        if (data.counter) {
            $('#online').html('当前在线人数：' + data.counter + "人.");
            if (data.users) {
                var html = '';
                for (var i in data.users) {
                    html += '<li title="' + i + '">' + i + '</li>';
                }
                $('#userlist').html(html);
            }
        }
        $('#messages').scrollTop(99999);
    }

    function formatTime(time) {
        var d = new Date(parseInt(time));
        var str = "";
        str += d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        return str;
    }
});