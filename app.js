var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server),
    users = {}; //keep track of all users online

server.listen(3000); //listen to port 3000

app.use('/public', express.static(__dirname + '/public'));

//create route
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

//when a client connects
io.sockets.on('connection', function(socket){

	socket.on('new user', function(data, callback){ //callback since sending data back to client
		if (data in users){ //check if valid username
			callback(false);
		} else {
			callback(true);
			socket.username = data; //add as property of socket
			users[socket.username] = socket;
			// usernames.push(socket.username);
			updateUsernames();	
		}
	});

	function updateUsernames(){
		io.sockets.emit('usernames', Object.keys(users));
	}

	socket.on('send message', function(data, callback){
		var msg = data.trim();

		// socket.broadcast.emit('new message', data); //to everyone but me
	 	// io.sockets.emit('new message', data); //to everyone including me

		// send a whisper
		if(msg.substr(0,3) === '/w ') {
			msg = msg.substr(3);
			var index = msg.indexOf(' ');
			if(index !== -1){
				var name = msg.substring(0, index);
				var msg = msg.substring(index+1);
				if(name in users){
					users[name].emit('whisper', {msg: msg, name: socket.username});
					users[socket.username].emit('whisper', {msg: msg, name: socket.username});
					console.log('Whisper!');
				} else{
					callback('Error! Enter a valid user.');
				}
			} else{
				callback('Error! Please enter a message for your whisper.');
			}
		// send a message
	} else {
			io.sockets.emit('new message', {msg: msg, name: socket.username}); //stored in every socket
		}
	});

	socket.on('disconnect', function(data){
		if (!socket.username) return;
		//get rid of 1 element in usernames[]
		delete users[socket.username];
		// usernames.splice(usernames.indexOf(socket.username),1);
		updateUsernames();
	});
});