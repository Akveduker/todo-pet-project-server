const { Router, json } = require("express");
const Task = require('../schemas/task')
const Group = require('../schemas/group')
const TaskGroup = require('../schemas/taskGroup')
const validateToken = require('../utils/validateToken.js')

const router = Router()
const jsonParser = json()

router.post('/create', jsonParser, validateToken, async (req, res) => {
    const { taskGroupId, groupId, name, authorization, personsId, taskDate, taskStatus } = req.body
    const { id: creatorId } = authorization
    try {
        const taskGroup = await TaskGroup.findById(taskGroupId)

        const group = await Group.findById(groupId)

        if (!taskGroup || !group) return res.status(404).send('Группа не найдена')

        if (!taskGroup.personsId.includes(creatorId) && group.creatorId !== creatorId) return res.status(403).send('Ошибка доступа к группе')

        const task = new Task({
            name,
            personsId,
            taskDate,
            taskStatus
        })
        await task.save()

        await TaskGroup.findOneAndUpdate({ _id: taskGroupId }, {
            $addToSet: {
                tasks: task._id
            }
        })

        return res.status(200).send(task)

    } catch (e) {
        res.sendStatus(500);
    }
})

router.post('/get', jsonParser, async (req, res) => {
    const { tasksIdsArr } = req.body
    try {

        const tasks = await Task.find({ _id: { $in: tasksIdsArr } }).exec()

        return res.status(200).send(tasks)

    } catch (e) {
        res.sendStatus(500);
    }
})

router.delete('/delete', jsonParser, validateToken, async (req, res) => {

    const { taskId, taskGroupId, groupId, authorization } = req.body
    const { id: userId } = authorization
    try {
        const task = await Task.findById(taskId)

        const group = await Group.findById(groupId)

        const taskGroup = await TaskGroup.findById(taskGroupId)

        if (!task || !group || !taskGroup) return res.status(404).send('Данные не найдены')

        if (!taskGroup.personsId.includes(userId) && !group.creatorId === userId) return res.status(403).send('Ошибка доступа к группе')

        await TaskGroup.updateOne({ _id: taskGroupId }, {
            $pull: {
                tasks: taskId
            }
        })

        await task.deleteOne({ _id: taskId })

        return res.sendStatus(200)
    } catch (e) {
        res.sendStatus(500);
    }
})


router.patch('/edit', jsonParser, validateToken, async (req, res) => {

    const { taskStatus, taskId, authorization, groupId, taskGroupId } = req.body
    const { id: userId } = authorization
    try {
        const task = await Task.findById(taskId)

        const group = await Group.findById(groupId)

        const taskGroup = await TaskGroup.findById(taskGroupId)

        if (!task || !group || !taskGroup) return res.status(404).send('Данные не найдены')

        if (!taskGroup.personsId.includes(userId) && !group.creatorId === userId) return res.status(403).send('Ошибка доступа к группе')

        const newTask = await Task.findOneAndUpdate({ _id: taskId }, {
            taskStatus
        }, { new: true })

        return res.status(200).send(newTask)
    } catch (e) {
        res.sendStatus(500);
    }
})


module.exports = router