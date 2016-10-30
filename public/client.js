$(document).ready(function(){
	var socket = io.connect();

    var $nameForm = $('#setName');
    var $nameError = $('#nameError');
    var $nameBox = $('#username');

    var $users = $('#users');
	var $messageForm = $('#send-message'); // cache static variables
	var $messageBox = $('#message');
	var $chat = $('#chat');

    $nameForm.submit(function(e){
        e.preventDefault();
        socket.emit('new user', $nameBox.val(), function(data){
            //callback function
            if(data) { //if valid username
                $('#nameWrap').hide();
                $('#contentWrap').show();
            } else {
                $nameError.html('That username is already taken! Try again.');
            }
        });
        $nameBox.val('');
    });

    //display usernames
    socket.on('usernames', function(data){
        var html = '';
        for(i=0; i<data.length; i++){
            html += data[i] + '<br/>';
        }
        $users.html(html);
    });

    // chat box area
    $messageForm.submit(function(e){
     e.preventDefault();
     socket.emit('send message', $messageBox.val(), function(data){
        $chat.append('<span class="error"><b>' + data + "</span><br/>");
        }); //submit to server
		$messageBox.val(''); //clear message box
	});

    socket.on('new message', function(data){
     $chat.append('<span class="msg"><b>' + data.name + ': </b>' + data.msg + "</span><br/>");
 });

    socket.on('whisper', function(data){
        $chat.append('<span class="whisper"><b>' + data.name + ': </b>' + data.msg + "</span><br/>");
    });
});