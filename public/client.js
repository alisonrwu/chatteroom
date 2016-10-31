$(document).ready(function(){
    var socket = io.connect();

    var $nameForm = $('#setName'); // cache static variables
    var $nameError = $('#nameError');
    var $nameBox = $('#username');

    var $users = $('#users');
    var $messageForm = $('#send-message');
    var $messageBox = $('#message');
    var $chat = $('#chat');

    //user login
    $nameForm.submit(function(e){
        e.preventDefault();
        socket.emit('new user', $nameBox.val(), function(data){//callback function
            if(data) {
                $('#nameWrap').hide();
                $('#contentWrap').show();
            } else {
                $nameError.html('That username is already taken! Try again.');
            }
        });
        $nameBox.val('');
    });

    // display usernames
    socket.on('usernames', function(data){
        var html = '';
        for(var i=0; i<data.length; i++){
            html += data[i] + '<br/>';
        }
        $users.html(html);
    });

    // chat box area
    $messageForm.submit(function(e){
        e.preventDefault();
        socket.emit('send message', $messageBox.val(), function(data){
            $chat.append('<span class="error"><b>' + data + "</span><br/>");
        }); //submit to server, and to other sockets
        $messageBox.val('');
    });

    function displayMsg(data, type){
        $chat.append('<span class="' + type + '"><b>' + data.username + ': </b>' + data.msg + "</span><br/>");
    }

    socket.on('load old msgs', function(docs){
        for(var i=docs.length-1; i>=0; i--){
            displayMsg(docs[i], 'msg');
        }
    });

    socket.on('new message', function(data){
        displayMsg(data, 'msg');
    });

    socket.on('whisper', function(data){
        displayMsg(data, 'whisper');
    });
});