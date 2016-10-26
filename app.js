var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    usernames = []; //keep track of all users online

server.listen(3000); //listen to port 3000

//create route
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

//when a client connects
io.sockets.on('connection', function(socket){

	socket.on('new user', function(data, callback){
		if (usernames.indexOf(data) != -1){ //check if valid username
			callback(false); //not valid
		} else {
			callback(true); //valid
			socket.username = data; //add as property of socket
			usernames.push(socket.username);
			updateUsernames();	
		}
	});

	function updateUsernames(){
		io.sockets.emit('usernames', usernames);
	}

	socket.on('send message', function(data){
		// socket.broadcast.emit('new message', data); //to everyone but me
												 //to everyone including me
		io.sockets.emit('new message', {msg: data, name: socket.username}); //stored in every socket
	});

	socket.on('disconnect', function(data){
		if (!socket.username) return;
		//get rid of 1 element in usernames[]
		usernames.splice(usernames.indexOf(socket.username),1);
		updateUsernames();
	});
});