const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {

    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]
    if (token === null) return res.sendStatus(401)

    jwt.verify(token, process.env.JWT_SECRET, (err, _id) => {
        if (err) return res.sendStatus(403)
        req.body.authorization = _id
        next()
    })
}
module.exports = validateToken