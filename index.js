const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http').Server(app);
const path = require('path');
const io = require('socket.io')(http);
const mongoose = require('mongoose');

const generatePassword = require('password-generator');
const app = express();

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// MONGO DB - Mongoose

// Connection
var dbUrl = 'mongodb://usuario:usuario1@ds163402.mlab.com:63402/chatroom'

// Models
var Room = mongoose.model('Room', { _id : String, name : String, created : String, users : [String]})
var Message = mongoose.model('Message', {username : String, text : String, created : String, room : String})


// API v1

// GET rooms
app.get('/api/v1/rooms', (req, res) => {
  Room.find({}, (err, rooms) => {
    res.send(rooms)
  })
})

// GET messages
app.get('/api/v1/messages', (req, res) => {
  var roomName = req.query.roomname;

  Message.find({ room: roomName }).sort({ created: 1 }).limit(20).exec((err, messages) => {
   res.send(messages)
  })
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

// Connection to database
mongoose.connect(dbUrl, {useMongoClient : true}, (err) => {
  console.log('mongodb connected', err);
})

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Chitchat server Listening on port ${port}'));
