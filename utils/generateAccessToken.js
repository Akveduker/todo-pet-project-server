const jwt = require('jsonwebtoken');

const generateTokenFromId = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30m' })
}
module.exports = generateTokenFromId