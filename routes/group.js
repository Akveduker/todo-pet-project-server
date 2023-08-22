const { Router, json } = require("express");
const Group = require('../schemas/group')
const User = require('../schemas/user');
const TaskGroup = require("../schemas/taskGroup");
const Task = require("../schemas/task");
const validateToken = require('../utils/validateToken.js')

const router = Router()
const jsonParser = json()


router.post('/create', jsonParser, validateToken, async (req, res) => {
    const { name, password, authorization } = req.body
    const { id: userId } = authorization
    try {
        const group = await Group.create({ name, password, creatorId: userId })

        if (!group) return res.status(400).send('ошибка создания группы')
        const newGroup = {
            role: 'admin',
            name,
            _id: group._id
        }
        const userUpd = await User.findByIdAndUpdate(userId, {
            $addToSet: {
                groups: newGroup
            }
        }, { new: true })

        if (userUpd) return res.status(200).send(newGroup)
        else return res.status(400).send('Ошибка создания группы')

    } catch (e) {
        res.sendStatus(500);
    }

})

router.delete('/delete', jsonParser, validateToken, async (req, res) => {
    const { groupId, authorization } = req.body
    const { id: userId } = authorization
    try {
        const group = await Group.findById(groupId)

        if (!group) return res.status(400).send('Группа не найдена попробуйте снова')
        await User.findByIdAndUpdate(userId, {
            $pull: {
                groups: {
                    _id: {
                        $eq: groupId
                    }
                }
            }
        })
        if (group.creatorId === userId) {

            if (group.usersIds.length !== 0) {
                await User.updateMany({
                    _id: {
                        $in: group.usersIds
                    }
                }, {
                    $pull: {
                        groups: {
                            _id: {
                                $eq: groupId
                            }
                        }
                    }
                })
            }

        }
        else {
            await Group.findByIdAndUpdate(groupId, {
                $pull: {
                    usersIds: userId
                }
            })

        }
        if (group.taskGroupsIds.length !== 0) {

            const taskGroups = await TaskGroup.find({
                _id: {
                    $in: group.taskGroupsIds
                }
            }).exec()
            const taskGroupsFormated = taskGroups.map(({ tasks }) => {
                return tasks
            }).flat()
            if (group.creatorId === userId) {

                await TaskGroup.deleteMany({
                    _id: {
                        $in: group.taskGroupsIds
                    }
                })
                await Task.deleteMany({
                    _id: {
                        $in: taskGroupsFormated
                    }
                })

            }
            else {

                await TaskGroup.updateMany({
                    $pull: {
                        personsId: userId
                    }
                })
                await Task.updateMany({
                    $pull: {
                        personsId: userId
                    }
                })

            }

        }
        if (group.creatorId === userId) {

            await Group.findByIdAndDelete(groupId)

        }
        const newUser = await User.findOne({
            _id: userId
        })
        if (!newUser) res.status(400).send('Ошибка поиска групп')
        return res.sendStatus(200)
    } catch (e) {

        res.sendStatus(500);
    }

})

router.post('/connect', jsonParser, validateToken, async (req, res) => {
    const { groupId, password, authorization } = req.body
    const { id: userId } = authorization
    try {
        const group = await Group.findById(groupId)

        const user = await User.findById(userId)

        if (!group) return res.status(404).send('Неверный id группы')

        if (!user) return res.status(404).send('Пользователь не найден, перезайдите в профиль и попробуйте снова')

        if (group.password === password) {
            try {
                await Group.findByIdAndUpdate(groupId,
                    {
                        $addToSet: {
                            usersIds: userId
                        }
                    })
                const newGroup = {
                    role: 'user',
                    name: group.name,
                    _id: groupId
                }
                const userUpd = await User.findByIdAndUpdate(userId, {
                    $addToSet: {
                        groups: newGroup
                    }
                }, { new: true })
                return res.status(200).send(newGroup)
            } catch (e) {
                res.sendStatus(500)
            }
        }
        else {
            res.status(404).send('Неверный пароль группы')
        }
    } catch (e) {
        res.sendStatus(500);
    }

})
router.post('/page', jsonParser, validateToken, async (req, res) => {
    const { groupId, authorization } = req.body
    const { id: userId } = authorization
    try {
        const group = await Group.findById(groupId)
        const user = await User.findById(userId)
        const taskGroups = await TaskGroup.find({ _id: group.taskGroupsIds }).exec()
        if (!group) return res.status(404).send('Неверный id группы')
        if (!user) return res.status(404).send('Пользователь не найден, перезайдите в профиль и попробуйте снова')

        if (!group.usersIds.includes(userId) && group.creatorId !== userId) return res.status(400).send('Вы не являетесь участником этой группы')
        const users = await User.find({
            _id: { $in: group.usersIds.concat(group.creatorId) }
        }).exec()
        const formatedUsers = users.map(({ name, _id, userColor }) => {
            return {
                name,
                _id,
                userColor
            }
        })
        const baseRes = {
            name: group.name,
            taskGroups: taskGroups,
            groupId: group._id,
            usersArray: formatedUsers
        }
        if (group.creatorId !== userId) {
            return res.status(200).send({
                ...baseRes,
                userRole: 'user'
            })
        }
        return res.status(200).send({
            ...baseRes,
            userRole: 'admin',

        })


    } catch (e) {
        res.sendStatus(500);
    }
})
module.exports = router