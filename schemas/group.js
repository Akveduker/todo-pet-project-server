const { Schema, model } = require('mongoose')
const groupSchema = new Schema({
    name: String,
    password: String,
    creatorId: String,
    usersIds: [String],
    taskGroupsIds: [String]
})

module.exports = model('Group', groupSchema)