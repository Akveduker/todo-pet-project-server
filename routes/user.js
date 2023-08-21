const { Router, json } = require("express");
const User = require('../schemas/user')
const validateToken = require('../utils/validateToken.js')


const router = Router()
const jsonParser = json()


router.patch('/user', jsonParser, validateToken, async (req, res) => {
    const { authorization, ...restData } = req.body
    const { id: _id } = authorization
    try {
        const user = await User.findOneAndUpdate({ _id, ...restData })
        if (user) {
            const newUser = await User.findOne({ _id })
            return res.status(200).send(newUser)
        }
        return res.status(404).send('Пользователь не найден')
    } catch (e) {
        res.sendStatus(500);
    }

})

router.get('/user', jsonParser, validateToken, async (req, res) => {
    const { id } = req.body.authorization
    try {
        const user = await User.findById(id)
        if (!user) return res.status(404).send('Пользователь не найден')
        return res.status(200).send(user)
    } catch (e) {
        res.sendStatus(500);
    }
}
)


module.exports = router