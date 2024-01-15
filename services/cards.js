const ingredients = require('../data/ingredients.json')
const makeUnoCards = () => {
    // numberCards
    const numbers = ingredients.numbers.map(number => {
        return ingredients.colors.map((color, index) => {
            let card = color + '_' + number
            return card
        })
    }).flat()
    const numberCards = numbers.map(card => {
        return [card, card]
    }).flat()
    // actionCards
    const actions = ingredients.actions.map(action => {
        return ingredients.colors.map(color => {
            let card = color + '_' + action
            return card
        })
    }).flat()
    const actionCards = actions.map(card => {
        return [card, card]
    }).flat()
    const wildCards = ingredients.wildActions.map(card => {
        return [card, card, card, card, card, card]
    }).flat()
    const unoCards = [...numberCards, ...actionCards, ...wildCards]
    // const unoCards = [...numbers, ...actions, ...ingredients.wildActions]
    for (let i = 0; i < unoCards.length; i++) {
        const j = Math.floor(Math.random() * (i + 1));
        [unoCards[i], unoCards[j]] = [unoCards[j], unoCards[i]];
    }
    return unoCards
    // return res.status(200).json(unoCards)
}

const divideCards = (data) => {
    // const data = {
    //     count: 3,
    //     roomCode:'',
    //     users: ['nga', 'hong', 'danh']
    // }
    const userCards = {}
    for (let i = 0; i < data.users.length; i++) {
        userCards[data.users[i]] = []
    }
    const unoCards = makeUnoCards()
    const divideCards = unoCards.slice(0, data.count * 7)
    const residualCards = unoCards.slice(data.count * 7 + 1)
    const firstCard = unoCards[data.count * 7]
    for (let i = 0; i < divideCards.length; i++) {
        userCards[data.users[i % data.count]].push(divideCards[i])
    }
    return {
        count: divideCards.length,
        // divideCards,
        // userCards,
        userCards,
        residualCards,
        firstCard
    }
    // return res.status(200).json({
    //     count: divideCards.length,
    //     // divideCards,
    //     // userCards,
    //     userCards,
    //     residualCards,
    //     firstCard
    // })

}

module.exports = {
    makeUnoCards,
    divideCards
}