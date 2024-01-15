const express = require('express');
const http = require('http');
// const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
// const io = new Server(server);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors');
const { divideCards, makeUnoCards } = require('./services/cards');
const corsOptions = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
};

app.use(cors(corsOptions));

const rooms = {};
io.on('connection', (socket) => {
    // Handle join room request
    socket.on('join', ({ username, roomCode }) => {
        socket.join(roomCode);
        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                host: username,
                users: []
            };
        }
        if (rooms[roomCode].users.length !== 0 && rooms[roomCode].users.includes(username)) {
            socket.emit('joinStatus', "username is exist")
        } else {
            rooms[roomCode].users.push(username);
            // Notify the client that they have joined the room
            socket.emit('joinStatus', "user joined room successfully")
            io.to(roomCode).emit('joined', { username, roomCode, rooms: rooms[roomCode] });
        }

    });
    // Handle leave room request
    socket.on('leave', ({ username, roomCode }) => {
        console.log(username)
        if (username === rooms[roomCode].host) {
            rooms[roomCode].users.shift()
            rooms[roomCode].users = rooms[roomCode].users
            rooms[roomCode].host = rooms[roomCode].users[0] === undefined ? '' : rooms[roomCode].users[0]
            console.log('host leaved')
        } else if (username !== rooms[roomCode].host) {
            console.log('user leaved')
            const userIndex = rooms[roomCode].users.indexOf(username)
            console.log(userIndex)
            rooms[roomCode].users.splice(userIndex, 1)
            rooms[roomCode].users = rooms[roomCode].users
            rooms[roomCode].host = rooms[roomCode].host
            console.log(rooms[roomCode].users)
        }
        if (rooms[roomCode].users.length === 0) {
            delete rooms[roomCode]
        }
        socket.leave(roomCode);
        socket.emit('leaveStatus', 'leaved successfully')
        io.to(roomCode).emit('leaved', { username, roomCode, rooms: rooms[roomCode] });
        console.log(rooms)
    });
    // Handle start game request => divided card
    socket.on('start', (data) => {
        io.to(data.roomCode).emit('started', true)
        const dividedCard = divideCards(data)
        io.to(data.roomCode).emit('divided', dividedCard)
    })

    socket.on("disconnect", (roomCode) => {
        rooms[roomCode] = [];
        console.log('Client disconnected')
    })
})

// app.use('/uno', (req, res) => divideCards(req, res, {
//     count: 2,
//     users: ['nga', 'hong']
// }))
// app.use('/uno', (req, res) => makeUnoCards(req, res))

server.listen(8000, () => {
    console.log('Server is listening on port 8000');
});
