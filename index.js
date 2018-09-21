const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const http = require('http').Server(app);
const path = require('path');
//const io = require('socket.io')(http);
const mongoose = require('mongoose');
const generatePassword = require('password-generator');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// MONGO DB - Mongoose

// Connection string
var dbUrl = 'mongodb://usuario:usuario1@ds163402.mlab.com:63402/chatroom'

// Models
var Room = mongoose.model('Room', { _id : String, name : String, created : String, users : [String] })
var Message = mongoose.model('Message', { _id: String, username : String, text : String, created : String, room_id : String })

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

// API: GET messages
app.get('/api/v1/messages', (req, res) => {
  var roomId = req.query.roomid;
  Message.find({ room_id: roomId }).sort({ created: 1 }).limit(20).exec((err, messages) => {
   res.send(messages)
  })
  //res.send(req.query.roomid)
})

// DEMO
app.get('/api/passwords', (req, res) => {
  const count = 5;

  // Generate some passwords
  const passwords = Array.from(Array(count).keys()).map(i =>
    generatePassword(12, false)
  )

  // Return them as json
  res.json(passwords);

  console.log(`Sent ${count} passwords`);
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Chitchat server Listening on port ${port}'));
