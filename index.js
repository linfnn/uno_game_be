const express = require('express');
const http = require('http');
// const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
// const io = new Server(server);
const io = require('socket.io')(server, {
    cors: {
        origin: "https://uno-game-jlpw.onrender.com",
        methods: ["GET", "POST"]
    }
});
// http://localhost:3000
// https://uno-game-jlpw.onrender.com
const cors = require('cors');
const { divideCards, pickSuitCards } = require('./services/cards');
// const { getTurn } = require('./services/turns');
const { playCard, drawCard, playResult } = require('./services/rules');
const { playAgain } = require('./services/playAgain');
const corsOptions = {
    origin: "https://uno-game-jlpw.onrender.com",
    methods: ["GET", "POST"]
};

app.use(cors(corsOptions));

const rooms = {};
const cards = {};
const playAgainObj = {}
io.on('connection', (socket) => {
    // Handle join room request
    socket.on('join', ({ username, roomCode }) => {
        socket.join(roomCode);
        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                host: username,
                users: [],
                again: []
            };
        }
        if (rooms[roomCode].users.length !== 0 && rooms[roomCode].users.includes(username)) {
            socket.emit('joinStatus', "username is exist")
        } else {
            rooms[roomCode].users.push(username);
            // Notify the client that they have joined the room
            socket.emit('joinStatus', "user joined room successfully")
            io.to(roomCode).emit('joined', {
                username, roomCode, rooms: {
                    host: rooms[roomCode].host,
                    users: rooms[roomCode].users
                }
            });
        }

    });
    // Handle leave room request
    socket.on('leave', ({ username, roomCode, leaveFrom, users, pileCard, index }) => {
        console.log('received request')
        console.log({ username, roomCode, leaveFrom })
        if (rooms[roomCode]?.users?.length === 0) {
            delete rooms[roomCode]
        }
        if (username === rooms[roomCode]?.host) {
            rooms[roomCode].users.shift()
            rooms[roomCode].users = rooms[roomCode].users
            rooms[roomCode].host = rooms[roomCode].users[0] === undefined ? '' : rooms[roomCode].users[0]
            console.log('host leaved')
        } else if (username !== rooms[roomCode]?.host) {
            console.log('user leaved')
            const userIndex = rooms[roomCode]?.users?.indexOf(username)
            console.log(userIndex)
            if (userIndex !== -1) {
                rooms[roomCode]?.users.splice(userIndex, 1)
                // rooms[roomCode]?.users = rooms[roomCode].users
                // rooms[roomCode]?.host = rooms[roomCode].host
            }
        }
        // if (leaveFrom === 'playingRoom' && users !== undefined && rooms[roomCode]?.users?.length > 1) {
        //     const passed = playResult(users, index, cards[roomCode], pileCard)
        //     io.to(roomCode).emit('passed', 'user successfully passed')
        //     io.to(roomCode).emit('nextTurn', {
        //         nextUser: {
        //             username: passed.nextUser,
        //             index: rooms[roomCode].users.indexOf(passed.nextUser)
        //         },
        //         suitCards: passed.suitCards,
        //         pileCard: passed.pileCard,
        //         draw: passed.draw?.length,
        //         residualCards: cards[roomCode].residualCards,
        //         wildColor: cards[roomCode].variable.color,
        //         prevUser: {
        //             username: rooms[roomCode].users[index],
        //             cards: cards[roomCode].userCards[rooms[roomCode].users[index]]
        //         }
        //     })
        // }
        socket.leave(roomCode);
        socket.emit('leaveStatus', 'leaved successfully')
        io.to(roomCode).emit('leaved', { username, roomCode, rooms: rooms[roomCode], leaveFrom: leaveFrom });
        console.log(rooms)
    });
    // Handle start game request => divided card
    socket.on('start', (data) => {
        io.to(data.roomCode).emit('started', true)
        rooms[data.roomCode].users = data.users
        const dividedCard = divideCards(data)
        cards[data.roomCode] = dividedCard
        cards[data.roomCode].variable = {
            reverse: 0,
            jump: '+1',
            draw: 1,
            color: ''
        }
        io.to(data.roomCode).emit('divided', cards[data.roomCode])

        // gửi đi lượt ra bài đầu tiên
        io.to(data.roomCode).emit('firstTurn', {
            user: rooms[data.roomCode].host,
            suitCards: pickSuitCards(cards[data.roomCode].userCards[rooms[data.roomCode].host], cards[data.roomCode].pileCard)
        })
        console.log('received starting request')
    })

    // data = {roomCode:'1', pileCard:'y_3', index:1,color} drawFour chưa truyền color
    socket.on('play', (data) => {
        console.log('received playing card request')
        cards[data.roomCode].variable.color = data.pileCard.includes('_') ? data.pileCard[0] : data?.color
        const played = playCard(rooms[data.roomCode].users, cards[data.roomCode], data.pileCard, data.index, data.cardIndex, cards[data.roomCode].variable.color)

        console.log('variable at play event: ', cards[data.roomCode].variable)
        if (rooms[data.roomCode].users.length === 2) {
            cards[data.roomCode].variable.reverse = 0
            cards[data.roomCode].variable.jump = '+1'
        }
        if (played.won === true) {
            io.to(data.roomCode).emit('played', 'valid card & won the game')
            io.to(data.roomCode).emit('won', {
                pileCard: data.pileCard,
                winner: rooms[data.roomCode].users[data.index]
            })
            delete rooms[data.roomCode]
            delete cards[data.roomCode]
        } else {
            io.to(data.roomCode).emit('played', 'valid card')
            io.to(data.roomCode).emit('nextTurn', {
                nextUser: {
                    username: played.nextUser,
                    index: rooms[data.roomCode].users.indexOf(played.nextUser)
                },
                suitCards: played.suitCards,
                pileCard: played.pileCard,
                residualCards: cards[data.roomCode].residualCards,
                wildColor: cards[data.roomCode].variable.color,
                draw: cards[data.roomCode].variable.draw,
                prevUser: {
                    username: rooms[data.roomCode].users[data.index],
                    cards: cards[data.roomCode].userCards[rooms[data.roomCode].users[data.index]]
                }
            })
        }
    })
    // data = {roomCode:'1',pileCard:'drawFour', draw:6, index:1, color}
    socket.on('draw', (data) => {
        console.log('received drawwing card request')
        cards[data.roomCode].variable.color = data.pileCard.includes('_') ? data.pileCard[0] : data?.color
        const drew = drawCard(rooms[data.roomCode].users, cards[data.roomCode], data.pileCard, data.index, data.auto)
        cards[data.roomCode].variable.draw = 1
        console.log('variable at draw event: ', cards[data.roomCode].variable)
        io.to(data.roomCode).emit('drew', 'user successfully drew')
        console.log(drew.nextUser)
        io.to(data.roomCode).emit('nextTurn', {
            nextUser: {
                username: drew.nextUser,
                index: rooms[data.roomCode].users.indexOf(drew.nextUser)
            },
            suitCards: drew.suitCards,
            pileCard: drew.pileCard,
            draw: drew.draw?.length,
            residualCards: cards[data.roomCode].residualCards,
            wildColor: cards[data.roomCode].variable.color,
            prevUser: {
                username: rooms[data.roomCode].users[data.index],
                cards: cards[data.roomCode].userCards[rooms[data.roomCode].users[data.index]]
            }
        })
    })
    socket.on('pass', (data) => {
        io.to(data.roomCode).emit('passed', 'user successfully passed')
        const passed = playResult(rooms[data.roomCode].users, data.index, cards[data.roomCode], data.pileCard)
        io.to(data.roomCode).emit('nextTurn', {
            nextUser: {
                username: passed.nextUser,
                index: rooms[data.roomCode].users.indexOf(passed.nextUser)
            },
            suitCards: passed.suitCards,
            pileCard: passed.pileCard,
            draw: passed.draw?.length,
            residualCards: cards[data.roomCode].residualCards,
            wildColor: cards[data.roomCode].variable.color,
            prevUser: {
                username: rooms[data.roomCode].users[data.index],
                cards: cards[data.roomCode].userCards[rooms[data.roomCode].users[data.index]]
            }
        })
    })
    socket.on('playAgain', ({ username, roomCode }) => {
        // socket.join(roomCode);
        // const roomCodeBackUp = rooms[roomCode].users
        rooms[roomCode].again.push(username)
        if (rooms[roomCode].again.length > rooms[roomCode].users.length) {
            playAgainObj[roomCode] = {}
            // Đếm số lần xuất hiện của mỗi phần tử
            rooms[roomCode].again.forEach(function (element) {
                playAgainObj[roomCode][element] = (playAgainObj[roomCode][element] || 0) + 1;
            });

            // Tạo mảng mới từ các phần tử xuất hiện nhiều hơn 1 lần
            var newPlayAgainArr = Object.keys(playAgainObj[roomCode]).filter(function (element) {
                return playAgainObj[roomCode][element] > 1;
            });
            playAgain(io, rooms[roomCode], username, roomCode, newPlayAgainArr)
        } else {
            playAgain(io, rooms[roomCode], username, roomCode, rooms[roomCode].again)
        }


    })
    socket.on("disconnect", () => {
        // const newArr = []
        // for (var key in rooms) {
        //     rooms[key].roomCode = key
        //     newArr.push(rooms[key])
        // }
        // const room = newArr.find(room => room?.userId?.includes(socket.id))
        // if (room) {
        //     const roomCode = room.roomCode
        //     const index = room.userId.indexOf(socket.id)
        //     console.log('index: ', index)
        //     const userOfIndex = room?.users[index]
        //     if (room.users.length === room.userId.length) {
        //         rooms[roomCode].userId.splice(index, 1)
        //         rooms[roomCode].users.splice(index, 1)
        //         if (room.users.length === 0) {
        //             delete rooms[roomCode]
        //         }
        //         if (room.host === userOfIndex && room.users.length !== 0) {
        //             rooms[roomCode].host = rooms[roomCode].users[0]
        //         }
        //     }
        //     io.to(roomCode).emit('left', { username: userOfIndex, roomCode, rooms: rooms[roomCode] })
        // }
        // console.log('newRoom: ', rooms)
        console.log('Client disconnected', socket.id)
    })
})

// app.use('/uno', (req, res) => divideCards(req, res, {
//     count: 3,
//     roomCode: '',
//     users: ['nga', 'hong', 'danh']
// }))
// app.use('/suitCards', (req, res) => testSuitCards(req, res))
// app.use('/turn', (req, res) => getTurn(req, res, ['nga', 'hong', 'nobi', 'danh'], 2, '-1'))
// app.use('/playAgain/:username', (req, res) => {
//     const username = req.params.username
//     const testRoom = {
//         roomCode: 12,
//         host: 'nga',
//         users: ['nga', 'hong', 'nobi'],
//         again: ['nga', 'hong', 'nobi']
//     }
//     testRoom.again.push(username)
//     if (testRoom.again.length > testRoom.users.length) {
//         playAgainObj[testRoom.roomCode] = {}
//         // Đếm số lần xuất hiện của mỗi phần tử
//         testRoom.again.forEach(function (element) {
//             playAgainObj[testRoom.roomCode][element] = (playAgainObj[testRoom.roomCode][element] || 0) + 1;
//         });

//         // Tạo mảng mới từ các phần tử xuất hiện nhiều hơn 1 lần
//         var newPlayAgainArr = Object.keys(playAgainObj[testRoom.roomCode]).filter(function (element) {
//             return playAgainObj[testRoom.roomCode][element] > 1;
//         });
//         testPlayAgain(req, res, username, testRoom.roomCode, testRoom, newPlayAgainArr)
//     } else {
//         testPlayAgain(req, res, username, testRoom.roomCode, testRoom, testRoom.again)
//     }
// })
server.listen(8000, () => {
    console.log('Server is listening on port 8000');
});
