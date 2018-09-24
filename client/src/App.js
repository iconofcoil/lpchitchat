import React from 'react'
import Axios from 'axios'
import firebase, { auth, provider } from './firebase.js';
import io from 'socket.io-client'

import MessageList from './components/MessageList'
import SendMessageForm from './components/SendMessageForm'
import RoomList from './components/RoomList'
import NewRoomForm from './components/NewRoomForm'

class App extends React.Component {
    
    constructor() {
        super()
        this.state = {
            roomId: null,
            user: null,
            username: null,
            messages: [],
            availableRooms: []
        }
        this.socket = io();
        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
        this.joinRoom = this.joinRoom.bind(this)
        this.leaveRoom = this.leaveRoom.bind(this)
        this.getRooms = this.getRooms.bind(this)
        this.createRoom = this.createRoom.bind(this)
    } 
    
    componentDidMount() {
        auth.onAuthStateChanged((user) => {
            if (user) {
              this.setState({
                  user,
                  username: user.email
              })

              this.getRooms()
            } 
          });

        // Message received, post it
        this.socket.on('RECEIVE_MESSAGE', message => {
            this.setState({
                messages: [...this.state.messages, message]
            })
        });
    }

    componentWillUnmount() {
        this.socket.close()
    }

    login() {
        auth.signInWithPopup(provider) 
          .then((result) => {
            const user = result.user;
            this.setState({
              user,
              username: user.email
            });
        });
    }    

    logout() {
        // Leave current room
        if (this.state.roomId) {
            this.leaveRoom(this.state.roomId, this.state.username)
        }

        auth.signOut()
          .then(() => {
            this.setState({
              user: null
            });
          });
    }

    createRoom(name) {
        Axios.post('/api/v1/rooms', { roomname: name })
             .then(res => {
                 var room = res.data;
                 this.joinRoom(room._id)
             })
             .catch(err => console.log('Error api create room: ', err))
    }
    
    getRooms() {
        this.setState({ availableRooms: [] })

       Axios.get('/api/v1/rooms')
            .then(res => {
                this.setState({ availableRooms: res.data })
            })
            .catch(err => console.log('Error api get rooms: ', err))
    }
    
    joinRoom(roomId) {
        // Leave current room
        if (this.state.roomId) {
            this.leaveRoom(this.state.roomId, this.state.username)
        }

        // Clear previous messages
        this.setState({ messages: [] })

        // Join room
        const params = '/join/' + roomId + '/' + this.state.username
        console.log('Params: ' + params)
        Axios.patch('/api/v1/rooms/user' + params )
            .then(res => {
                console.log('Join room: ', res.data)
            })
            .catch(err => console.log('Error api join room: ', err))

        // Get most recent messages in room
        Axios.get('/api/v1/messages', { params: { roomid: roomId } })
            .then(res => {
                this.setState({
                    roomId: roomId,
                    messages: res.data
                })
                // Update rooms
                this.getRooms()
            })
            .catch(err => console.log('Error api get messages: ', err))
    }

    leaveRoom(roomId, userName) {
        const params = '/leave/' + roomId + '/' + userName
        
        Axios.patch('/api/v1/rooms/user' + params)
            .then(res => {
                var room = res.data

                // No users? Archive room
                if (room.users.length == 0) {
                    Axios.post('/api/v1/archiverooms', { roomid: roomId })
                    .then(res => {
                        const params = roomId;
                        Axios.delete('/api/v1/rooms/' + params)
                             .then(res => {
                                //this.getRooms()
                             })
                             .catch(err => console.log('Error api delete room: ', err))
                    })
                    .catch(err => console.log('Error api create archive room: ', err))
                }
            })
            .catch(err => console.log('Error api leave room: ', err))
    }
    
    sendMessage(text) {
        Axios.post('/api/v1/messages', {
                username: this.state.username,
                text: text,
                roomid: this.state.roomId
             })
             .then(res => {
                 var message = res.data;
                 this.socket.emit('SEND_MESSAGE', message)
             })
             .catch(err => console.log('Error api create message: ', err))
    }

    render() {
        return (
            <div className="app">

                    {this.state.user ?
                        <div className="chat">
                            <RoomList
                                joinRoom={this.joinRoom}
                                rooms={[...this.state.availableRooms]}
                                roomId={this.state.roomId} />
                            <MessageList 
                                roomId={this.state.roomId}
                                messages={this.state.messages} />
                            <SendMessageForm
                                disabled={!this.state.roomId}
                                sendMessage={this.sendMessage} />
                            <NewRoomForm createRoom={this.createRoom} />
                            <div className="logout-form">
                                <form>
                                    <button className="logout-button" onClick={this.logout}>Log Out</button>
                                </form>
                            </div>
                        </div>
                        :
                        <div className="login-form">
                            <h2>LP ChitChat Login</h2>
                            <button className="login-button" onClick={this.login}>Log In</button>
                        </div>
                    }

            </div>
        );
    }
}

export default App