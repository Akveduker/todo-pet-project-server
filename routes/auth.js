const { Router, json } = require("express");
const User = require('../schemas/user')


const router = Router()
const jsonParser = json()


router.post('/auth', jsonParser, async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email, password })
        if (user) res.send(user)
        else res.status(404).send('Пользователь не найден')
    } catch (e) {
        res.sendStatus(500);
    }

})

router.post('/reg', jsonParser, async (req, res) => {
    const { email, password, name, userColor } = req.body
    try {
        const user = await User.findOne({ email, password })
        if (user) {
            res.status(400).send('Пользователь уже зарегистрированн')
            return
        }
        try {
            const user = await User.create({ email, password, name, userColor })
            if (user) res.status(200).send(user)
        } catch (e) {
            res.status(500)
        }
    } catch (e) {
        res.sendStatus(500);
    }
})
module.exports = router