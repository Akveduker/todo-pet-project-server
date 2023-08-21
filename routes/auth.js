const { Router, json } = require("express");
const generateTokenFromId = require('../utils/generateAccessToken')
const User = require('../schemas/user')


const router = Router()
const jsonParser = json()


router.post('/auth', jsonParser, async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email, password })

        if (!user) return res.status(404).send('Пользователь не найден')

        const token = generateTokenFromId(user._id)
        return res.status(200).send({
            token,
            data: user
        })
    } catch (e) {
        return res.sendStatus(500);
    }

})

router.post('/reg', jsonParser, async (req, res) => {
    const { email, password, name, userColor } = req.body
    try {
        const user = await User.findOne({ email, password })
        if (user) return res.status(400).send('Пользователь уже зарегистрированн')
        try {
            const user = await User.create({ email, password, name, userColor })
            if (user) {
                const token = generateTokenFromId(user._id)
                return res.status(200).send({
                    token,
                    data: user
                })
            }
        } catch (e) {
            return res.status(500)
        }
    } catch (e) {
        res.sendStatus(500);
    }
})
module.exports = router