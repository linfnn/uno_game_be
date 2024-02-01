// jump = '+1' || jump= '-1' || jump= '+2'
const getTurn = (users, index, jump) => {
    // Xét thêm trường hợp chỉ có 2 người chơi và reverse (-1)
    var newIndex = 0
    switch (jump) {
        case '+1':
            newIndex = index + 1 === users.length ? 0 : index + 1
            break
        case '-1':
            if (users.length === 2) {
                newIndex = index
            }
            if (users.length !== 2 && index - 1 < 0) {
                newIndex = users.length - 1
            }
            if (users.length !== 2 && index - 1 >= 0) {
                newIndex = index - 1
            }
            break
        case '+2':
            const jump2 = index + 2
            if (jump2 === users.length) {
                newIndex = 0
            } else if (jump2 > users.length) {
                newIndex = 1
            } else if (jump2 < users.length) {
                newIndex = index + 2
            }
            break
        case '-2':
            const jump_2 = index - 2
            if (jump_2 === -1) {
                newIndex = users.length - 1
            } else if (jump_2 === -2) {
                newIndex = users.length - 2
            } else if (jump_2 >= 0) {
                newIndex = index - 2
            }
            break
    }
    return users[newIndex]

}

module.exports = {
    getTurn
}