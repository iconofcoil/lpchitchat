import React from 'react'
import Axios from 'axios'
import firebase, { auth, provider } from './firebase.js';
import { Button } from 'react-bootstrap';

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
            username: '',
            messages: [],
            joinableRooms: [],
            joinedRooms: []
        }
        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
        this.joinRoom = this.joinRoom.bind(this)
        this.getRooms = this.getRooms.bind(this)
        this.createRoom = this.createRoom.bind(this)
    } 
    
    componentDidMount() {
        auth.onAuthStateChanged((user) => {
            if (user) {
              this.setState({ user })
              this.getRooms()
            } 
          });
    }

    login() {
        auth.signInWithPopup(provider) 
          .then((result) => {
            const user = result.user;
            this.setState({
              user,
              username: user.email
            });
            console.log('Nombre usuario: ', this.state.username)
        });
    }    

    logout() {
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
       Axios.get('/api/v1/rooms')
            .then(res => {
                this.setState({ joinableRooms: res.data })
            })
            .catch(err => console.log('Error api get rooms: ', err))
    }
    
    joinRoom(roomId) {
        // Clear previous messages
        this.setState({ messages: [] })

        // Get most recent messages in room
        Axios.get('/api/v1/messages', { params: { roomid: roomId } })
            .then(res => {
                console.log('Messages: ', res.data);
                this.setState({
                    roomId: roomId,
                    messages: res.data
                })
                this.getRooms()
            })
            .catch(err => console.log('Error api get messages: ', err))
    }
    
    sendMessage(text) {
        const userName = this.state.username
        console.log('User name: ', this.state.username)
        Axios.post('/api/v1/messages', { username: userName, text: text, roomid: this.state.roomId })
             .then(res => {
                 var message = res.data;
                 this.setState({ messages: [...this.state.messages, message] })
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
                                rooms={[...this.state.joinableRooms, ...this.state.joinedRooms]}
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
                                    <button onClick={this.logout}>Log Out</button>
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