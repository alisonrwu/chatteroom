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



    // drawing canvas
    var $canvas = $('#canvas'); //jQuery Object
    var canvas = $canvas[0];    //HTML DOM Object
    // var canvas = document.getElementById('canvas') //HTML DOM Object
    var context = canvas.getContext("2d"); //returns drawing context, or null

    var xPoints = new Array();
    var yPoints = new Array();
    var clickDrag = new Array();
    var paint;

    function addPoint(x, y, dragging) {
        xPoints.push(x);
        yPoints.push(y);
        clickDrag.push(dragging);
    }

    function render(){
        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
        context.strokeStyle = "#9400d3"; //purple
        context.lineJoin = "round";
        context.lineWidth = 2;

        for(var i=0; i < xPoints.length; i++) {        
            context.beginPath();
            if(clickDrag[i] && i){
                context.moveTo(xPoints[i-1], yPoints[i-1]); //moves path, without creating line
            }else{
                context.moveTo(xPoints[i]-1, yPoints[i]);
            }
            context.lineTo(xPoints[i], yPoints[i]); //moves path, creates line to new point
            context.closePath();
            context.stroke(); //draws defined path
        }
    }

    $canvas.mousedown(function(e){
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        paint = true;
        addPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        render();
    });

    $canvas.mousemove(function(e){
        if(paint){
            addPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            render();
        }
    });

    $canvas.on('mouseup mouseleave', function(e){
        paint = false;
    });

});