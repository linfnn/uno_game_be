const playAgain = (io, rooms, username, roomCode, playAgainArr) => {
    // rooms=rooms
    if (playAgainArr.length >= 2 && playAgainArr.indexOf(rooms.host) !== -1) {
        return io.to(roomCode).emit('playedAgain', {
            username,
            roomCode,
            rooms: {
                host: rooms.host,
                users: playAgainArr
            },
            message: 'Host played again. Can start game now'
        });
    }
    else if (rooms.again.length < 2 || playAgainArr.indexOf(rooms.host) === -1) {
        return io.to(roomCode).emit('playedAgain', {
            username,
            roomCode,
            rooms: {
                host: username === rooms.host ? rooms.host : '',
                users: playAgainArr
            },
            message: 'Please wait for host or more players to start the game'
        })
    }
}

const testPlayAgain = (req, res, username, roomCode, rooms, playAgainArr) => {
    // data={username,roomCode,rooms}
    if (playAgainArr.length >= 2 && playAgainArr.indexOf(rooms.host) !== -1) {
        return res.status(200).json({
            username,
            roomCode,
            rooms: {
                host: rooms.host,
                users: playAgainArr
            },
            message: 'Host played again. Can start game now'
        });
    }
    else if (playAgainArr.length < 2 || playAgainArr.indexOf(rooms.host) === -1) {
        return res.status(200).json({
            username,
            roomCode,
            rooms: {
                host: username === rooms.host ? rooms.host : '',
                users: playAgainArr
            },
            message: 'Please wait for host or more players to start the game'
        })
    }
}
module.exports = { playAgain, testPlayAgain }