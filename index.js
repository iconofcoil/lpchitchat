const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const http = require('http').Server(app);
const path = require('path');
const mongoose = require('mongoose');
const io = require('socket.io')(http);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// MONGO DB - Mongoose

// Connection string
var dbUrl = 'mongodb://usuario:usuario1@ds163402.mlab.com:63402/chatroom'

// Models
var Room = mongoose.model('Room', { _id: mongoose.Schema.Types.ObjectId, name : String, created : String, users : [String] })
var Message = mongoose.model('Message', { _id: mongoose.Schema.Types.ObjectId, username : String, text : String, created : String, room_id : String })

// Connection to database
mongoose.connect(dbUrl, (err) => {
  console.log('Error on mongodb connect: ', err);
})

// RESTful API v1

// API: GET rooms
app.get('/api/v1/rooms', (req, res) => {
  Room.find({}, (err, rooms) => {
    res.send(rooms)
  })
})

// API: POST create room
app.post('/api/v1/rooms', (req, res) => {
  var roomName = req.body.roomname;

  var d = new Date();
  var isoDate = d.toISOString();
  var newRoom = new Room({
    _id: new mongoose.Types.ObjectId(),
    name: roomName,
    created: isoDate,
    users: []
  });

  newRoom.save((err, room) => {
    if (err) res.sendStatus(500)
    else res.send(room)
  })
})

// API: POST create message
app.post('/api/v1/messages', (req, res) => {
  var userName = req.body.username;
  var text = req.body.text;
  var roomId = req.body.roomid;

  var d = new Date();
  var isoDate = d.toISOString();
  var newMsg = new Message({
    _id: new mongoose.Types.ObjectId(),
    username: userName,
    text: text,
    created: isoDate,
    room_id: roomId
  });

  newMsg.save((err, message) => {
    if (err) res.sendStatus(500)
    else res.send(message)
  })
})

// API: GET messages
app.get('/api/v1/messages', (req, res) => {
  var roomId = req.query.roomid;
  Message.find({ room_id: roomId }).sort({ created: 1 }).limit(20).exec((err, messages) => {
   res.send(messages)
  })
})

// The "catch all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

// Socket Connection
// UI Stuff
//io.on('connection', socket => {
  // Fire 'send' event for updating message list
//  socket.on('user message', data => {
//      io.emit('send', data);
//  });
//});

// Fire server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Chitchat server listening on port 5000'));
