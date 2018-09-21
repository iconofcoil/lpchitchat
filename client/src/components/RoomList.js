import React from 'react'

class RoomList extends React.Component {
    render () {
        const orderedRooms = [...this.props.rooms].sort((a, b) => a._id > b._id)
        return (
            <div className="rooms-list">
                <ul>
                    <h3>ROOMS</h3>
                    {orderedRooms.map((room, index) => {
                        const active = this.props.roomId === room._id ? "active" : "";
                        return (
                            <li key={room._id} className={"room " + active}>
                                <a
                                    onClick={ () => this.props.joinRoom(room._id) }
                                    href="#">
                                    # {room.name}
                                </a>
                            </li>
                        )
                      }
                    )}
                </ul>
            </div>
        )
    }
}

export default RoomList