// Nhận bộ bải của phòng

const { pickSuitCards } = require("./cards")
const { getTurn } = require("./turns")

// Nhận lá vừa đánh, xét điều kiện chọn là phù hợp và next turn
const playCard = (users, roomCards, pileCard, index, cardIndex, color) => {
    // roomCards = cards[data.roomCode]
    // users = rooms[data.roomCode].users
    roomCards.pileCard = pileCard
    const currentUserCard = roomCards.userCards[users[index]]
    currentUserCard.splice(cardIndex, 1)
    if (currentUserCard.length === 0) {
        return {
            roomCards,
            won: true
        }
    } else {
        const splitCard = pileCard.includes('_') ? pileCard.split('_') : pileCard
        if (splitCard.includes('reverse')) {
            console.log('reverse card')
            roomCards.variable.draw = 1
            roomCards.variable.reverse += 1
            roomCards.variable.jump = roomCards.variable.reverse % 2 === 0 ? '+1' : '-1'
            // roomCards.variable.double = false
            // roomCards.variable.color = ''
            return playResult(users, index, roomCards, pileCard)
            // return roomCards.variable
        }
        if (splitCard.includes('skip')) {
            console.log('skip card')
            roomCards.variable.draw = 1
            // roomCards.variable.double = true
            roomCards.variable.jump = roomCards.variable.reverse % 2 === 0 ? '+2' : '-2'
            // roomCards.variable.color = ''
            // return roomCards.variable
            return playResult(users, index, roomCards, pileCard)
        }
        if (splitCard === 'wild' || splitCard === 'drawFour' || !splitCard.includes('skip') || !splitCard.includes('reverse')) {
            console.log('wild & drawFour card')
            roomCards.variable.jump = roomCards.variable.reverse % 2 === 0 ? '+1' : '-1'
            // roomCards.variable.double = false
            if (splitCard === 'drawFour') {
                roomCards.variable.draw === 1 ? roomCards.variable.draw += 3 : roomCards.variable.draw += 4
                roomCards.variable.color = color
                // return roomCards.variable
                return playResult(users, index, roomCards, pileCard)
            }
            if (splitCard.includes('draw') && typeof splitCard !== 'string') {
                roomCards.variable.draw === 1 ? roomCards.variable.draw += 1 : roomCards.variable.draw += 2
                roomCards.variable.color = color
                // return roomCards.variable
                return playResult(users, index, roomCards, pileCard)
            }
            if (splitCard === 'wild') {
                roomCards.variable.color = color
                // return roomCards.variable
                return playResult(users, index, roomCards, pileCard)
            }
            if (splitCard !== 'drawFour' && !splitCard.includes('draw') && splitCard !== 'wild') {
                roomCards.variable.draw = 1
                // roomCards.variable.color = ''
                // return roomCards.variable
                return playResult(users, index, roomCards, pileCard)
            }
            // return roomCards.variable
            return playResult(users, index, roomCards, pileCard)
        }
        console.log('variable at playCard func: ', roomCards.variable)
    }
}

const drawCard = (users, roomCards, pileCard, index, auto) => {
    // roomCards = cards[data.roomCode]
    // users = rooms[data.roomCode].users
    console.log('currentUserIndex: ', index)
    const currentUser = roomCards.userCards[users[index]]
    const drawCards = roomCards.residualCards.splice(0, roomCards.variable.draw)
    currentUser.push(...drawCards)
    if (roomCards.variable.draw === 1) {
        const currentUser = getTurn(users, index - 1, roomCards.variable.reverse % 2 === 0 ? '+1' : '-1')
        const suitCards = pickSuitCards(roomCards.userCards[currentUser], pileCard, roomCards.variable.color)
        if (auto === false && suitCards.length !== 0) {
            return drawResult(roomCards, pileCard, currentUser, drawCards)
        }
        else {
            const nextUser = getTurn(users, index, roomCards.variable.reverse % 2 === 0 ? '+1' : '-1')
            return drawResult(roomCards, pileCard, nextUser, drawCards)
        }
    }
    else {
        const nextUser = getTurn(users, index, roomCards.variable.reverse % 2 === 0 ? '+1' : '-1')
        // roomCards.variable.draw = 1
        // roomCards.variable.color = pileCard.includes('_') ? pileCard[0] : color
        // console.log('variable draw', roomCards.variable.draw)
        // console.log('drawCards: ', drawCards)
        console.log('variable at drawCard func: ', roomCards.variable)
        return drawResult(roomCards, pileCard, nextUser, drawCards)
    }
}

const drawResult = (roomCards, pileCard, nextUser, drawCards) => {
    return {
        roomCards,
        nextUser,
        pileCard,
        draw: drawCards,
        suitCards: pickSuitCards(roomCards.userCards[nextUser], pileCard, roomCards.variable.color)
    }
}
const playResult = (users, index, roomCards, pileCard) => {
    const nextUser = getTurn(users, index, roomCards.variable.jump)
    return {
        roomCards,
        nextUser,
        pileCard,
        won: false,
        suitCards: pickSuitCards(roomCards.userCards[nextUser], pileCard, pileCard === 'wild' ? roomCards.variable.color : '')
    }
}

module.exports = {
    playCard,
    drawCard,
    playResult
}