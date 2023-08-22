const { Router, json } = require("express");
const TaskGroup = require('../schemas/taskGroup')
const Group = require('../schemas/group');
const User = require("../schemas/user");
const Task = require("../schemas/task");
const validateToken = require('../utils/validateToken.js')

const router = Router()
const jsonParser = json()

router.post('/create', jsonParser, validateToken, async (req, res) => {
    const { groupId, authorization, name, color, personsId, dates } = req.body
    const { id: creatorId } = authorization
    try {
        const group = await Group.findById(groupId)

        if (group.creatorId !== creatorId) return res.status(403).send('Вы не являетесь админом этой группы')

        const taskGroup = new TaskGroup({
            name,
            color,
            personsId,
            dates,
            task: []
        })
        await taskGroup.save()

        const groupSave = await Group.findByIdAndUpdate(groupId, {
            $addToSet: {
                taskGroupsIds: taskGroup._id,
            }
        }, {
            new: true,
        })

        if (!taskGroup && !groupSave) return res.status(500).send('Ошибка сохранения')

        return res.status(200).send(taskGroup)
    } catch (e) {
        res.sendStatus(500);
    }
})

router.delete('/delete', jsonParser, validateToken, async (req, res) => {
    const { groupId, authorization, taskGroupId } = req.body
    const { id: userId } = authorization
    try {
        const group = await Group.findById(groupId)

        const taskGroup = await TaskGroup.findById(taskGroupId)

        if (!group || !taskGroup) return res.status(404).send('Группа не найдена')

        if (userId !== group.creatorId) return res.status(403).send('Ошибка доступа')

        await Task.deleteMany({
            _id: {
                $in: taskGroup.tasks
            }
        })

        await Group.findByIdAndUpdate(groupId, {
            $pull: {
                taskGroupsIds: taskGroupId
            }
        })

        await TaskGroup.findByIdAndDelete(taskGroupId)

        return res.sendStatus(200)

    } catch (e) {
        res.sendStatus(500);
    }
})

module.exports = router