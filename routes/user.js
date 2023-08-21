const { Router, json } = require("express");
const User = require('../schemas/user')


const router = Router()
const jsonParser = json()


router.patch('/user', jsonParser, async (req, res) => {
    const { _id, ...restData } = req.body
    try {
        const user = await User.findOneAndUpdate({ _id, ...restData })
        if (user) {
            const newUser = await User.findOne({ _id })
            res.status(200).send(newUser)
        }
        else res.status(404).send('Пользователь не найден')
    } catch (e) {
        res.sendStatus(500);
    }

})

module.exports = router