import React from 'react'
import Chatkit from '@pusher/chatkit'
import Axios from 'axios'
import MessageList from './components/MessageList'
import SendMessageForm from './components/SendMessageForm'
import RoomList from './components/RoomList'
import NewRoomForm from './components/NewRoomForm'

import { tokenUrl, instanceLocator } from './config'

class App extends React.Component {
    
    constructor() {
        super()
        this.state = {
            roomId: null,
            messages: [],
            joinableRooms: [],
            joinedRooms: []
        }
        this.sendMessage = this.sendMessage.bind(this)
        this.joinRoom = this.joinRoom.bind(this)
        this.getRooms = this.getRooms.bind(this)
        this.createRoom = this.createRoom.bind(this)
    } 
    
    componentDidMount() {
        const chatManager = new Chatkit.ChatManager({
            instanceLocator,
            userId: 'perborgen',
            tokenProvider: new Chatkit.TokenProvider({
                url: tokenUrl
            })
        })
        
        chatManager.connect()
        .then(currentUser => {
            this.currentUser = currentUser
            this.getRooms()
        })
        .catch(err => console.log('error on connecting: ', err))
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
                console.log('Rooms: ', res.data);
                this.setState({ joinableRooms: res.data })
            })
            .catch(err => console.log('Error api get rooms: ', err))
    }
    
    joinRoom(roomId) {
        // Clear previous messages
        this.setState({ messages: [] })
        console.log('Room Id selected: ', roomId)

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
        console.log('Mensaje: ', text)
        console.log('Msj Cuarto: ', this.state.roomId)
        Axios.post('/api/v1/messages', { username: 'frontend', text: text, roomid: this.state.roomId })
             .then(res => {
                 var message = res.data;
                 this.setState({ messages: [...this.state.messages, message] })
             })
             .catch(err => console.log('Error api create message: ', err))
    }
    
    render() {
        return (
            <div className="app">
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
            </div>
        );
    }
}

export default App