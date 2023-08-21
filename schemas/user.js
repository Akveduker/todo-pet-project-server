const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    email: String,
    password: String,
    name: String,
    userColor: {
        background: String,
        color: String
    },
    groups: [{
        name: String,
        role: String,
        _id: String,
    }],
})

module.exports = model('User', userSchema)