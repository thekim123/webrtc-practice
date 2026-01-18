const WebSocket = require("ws");
const wss = new WebSocket.Server({port:8080});

const rooms = {};

wss.on("connection", (socket) => {
    console.log('user connected');
    socket.on('message', (msg) => {
        data = JSON.parse(msg);
        switch(data.type){
            case 'join':
                {
                    const {roomId} = data;
                    if(!rooms[roomId]){
                        rooms[roomId] = new Set();
                    }
                    
                    rooms[roomId].add(socket);
                    socket.roomId = roomId; // save room id for the user
                    console.log(`User Joined: ${roomId}`);
                    break;
                }
            case 'signal':
                {
                    const { roomId, signalData} = data;
                    rooms[roomId].forEach((client) => {
                        if(client !== socket && client.readyState === WebSocket.OPEN){
                            client.send(JSON.stringify(signalData));
                        }
                    });

                    break;
                }

            default:
                console.log(`Unknown message type: {data.type}`);
        }
    });

    socket.on('close', () => {
        const inRoomId = socket.roomId;
        if(inRoomId){
            rooms[inRoomId].delete(socket);
            console.log(`User disconnected from room ${inRoomId}`);
            if(rooms[inRoomId].size === 0){
                delete rooms[inRoomId];
                console.log(`Room deleted ${inRoomId}`);
            }
        }
    })

});