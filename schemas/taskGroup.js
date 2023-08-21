const { Schema, model } = require('mongoose')

const taskGroupSchema = new Schema({
    name: String,
    personsId: [String],
    color: String,
    dates: [String, String],
    tasks: [String],
})

module.exports = model('TaskGroup', taskGroupSchema)

