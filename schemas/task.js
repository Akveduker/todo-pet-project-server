const { Schema, model } = require('mongoose')

const taskSchema = new Schema({
    name: String,
    personsId: [String],
    taskDate: [String],
    taskStatus: String
})


module.exports = model('Task', taskSchema)

module.exports
