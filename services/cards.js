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
    const divideCards = unoCards.slice(0, data.count * 2)
    var i = data.count * 2
    while (i < unoCards.length && (unoCards[i] === 'wild' || unoCards[i] === 'drawFour' || unoCards[i].includes('draw') || unoCards[i].includes('reverse') || unoCards[i].includes('skip'))) {
        i++
    }
    const pileCard = unoCards[i]
    const residualCards = unoCards.slice(i).filter(card => card !== pileCard)
    for (let i = 0; i < divideCards.length; i++) {
        userCards[data.users[i % data.count]].push(divideCards[i])
    }
    return {
        count: divideCards.length,
        // divideCards,
        // userCards,
        userCards,
        residualCards,
        pileCard: pileCard
    }
    return res.status(200).json({
        count: divideCards.length,
        // divideCards,
        // userCards,
        userCards,
        residualCards,
        pileCard: pileCard
    })

}

const pickSuitCards = (userCards, pileCard, color) => {
    const ingredients = pileCard?.includes('_') ? pileCard.split('_') : pileCard
    return userCards.filter(card => {
        if (typeof ingredients === 'string') {
            if (ingredients === 'wild') {
                return card.includes(ingredients) || card[0].includes(color) || card === 'drawFour'
            } else if (ingredients === 'drawFour') {
                if ((color || color !== undefined) && color !== '') {
                    return card.includes(ingredients) || card[0].includes(color)
                } else {
                    return card.includes(ingredients)
                }
            }
        } else {
            const splitCard = card.includes('_') ? card.split('_') : card
            if (typeof splitCard === 'string') {
                return ingredients[1] === 'draw' ? splitCard === 'drawFour' : splitCard
            } else {
                if (ingredients[1] === 'draw') {
                    if (color !== '') {
                        return splitCard[0] === color || splitCard.includes(ingredients[1])
                    } else {
                        return splitCard.includes(ingredients[1])
                    }
                } else {
                    return splitCard[0] === ingredients[0] || splitCard[1] === ingredients[1]
                }
            }
            // return card.includes(ingredients[0]) || card.includes(ingredients[1]) || card === 'wild' || card === 'drawFour'
        }
    })
}

// const testSuitCards = (req, res, color) => {
//     const data = {
//         roomCode: '1',
//         count: 2,
//         users: ['nga', 'hong']
//     }
//     const cards = divideCards(data)
//     const ingredients = cards.pileCard.includes('_') ? cards.pileCard.split('_') : cards.pileCard
//     const suitCards = cards.userCards['nga'].filter(card => {
//         if (typeof ingredients == 'string') {
//             if (ingredients === 'wild') {
//                 return card.includes(ingredients) || card.includes(color)
//             } else {
//                 if (color) {
//                     return card.includes(ingredients) || card.includes(color)
//                 } else {
//                     return card.includes(ingredients)
//                 }
//             }
//         } else {
//             const splitCard = card.includes('_') ? card.split('_') : card
//             if (typeof splitCard === 'string') {
//                 return splitCard
//             } else {
//                 if (ingredients[1] === 'draw') {
//                     return splitCard.includes(ingredients[1])
//                 } else {
//                     return splitCard[0] === ingredients[0] || splitCard[1] === ingredients[1]
//                 }
//             }
//             // return card.includes(ingredients[0]) || card.includes(ingredients[1]) || card === 'wild' || card === 'drawFour'
//         }
//     })
//     return res.status(200).json({
//         // divideCards,
//         // userCards,
//         userCards: cards.userCards,
//         pileCard: cards.pileCard,
//         turn: {
//             user: 'nga',
//             suitCards
//         }
//     })
// }

module.exports = {
    makeUnoCards,
    divideCards,
    pickSuitCards,
    // testSuitCards
}