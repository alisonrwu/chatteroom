var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	mongoose = require('mongoose'),
    users = {}; //keep track of all users online

server.listen(3000); //listen to port 3000

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/chat', function(err){
	if(err)
		console.log("Couldn't connect to mongodb: " + err);
	else
		console.log('Connected to mongodb');
});

var chatSchema = mongoose.Schema({ //uses BSON, similar to JSON
	// username: {first: String, last: String}, like JSON objects
	username: String,
	msg: String,
	created: {type: Date, default: Date.now}
});
var Chat = mongoose.model('Message', chatSchema);

app.use('/public', express.static(__dirname + '/public'));

//create route
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

//when a client connects
io.sockets.on('connection', function(socket){
	var query = Chat.find({});
	query.sort('-created').limit(8).exec(function(err, docs){
		if(err) throw err;
		console.log('Sending old messages!');
		socket.emit('load old msgs', docs);
	});

	socket.on('new user', function(data, callback){ //callback since sending data back to client
		if (data in users){
			callback(false);
		} else {
			callback(true);
			socket.username = data; //add as property of socket
			users[socket.username] = socket;
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
					users[name].emit('whisper', {msg: msg, username: socket.username});
					users[socket.username].emit('whisper', {msg: msg, username: socket.username});
					console.log('Whisper!');
				} else{
					callback('Error! Enter a valid user.');
				}
			} else{
				callback('Error! Please enter a message for your whisper.');
			}
		
		// send a message
		} else {
			var newMsg = new Chat({msg: msg, username: socket.username});
			newMsg.save(function(err){
				if(err) throw err;
				io.sockets.emit('new message', {msg: msg, username: socket.username});
			});
		}
	});

	socket.on('disconnect', function(data){
		if (!socket.username) return;
		delete users[socket.username];
		updateUsernames();
	});
});