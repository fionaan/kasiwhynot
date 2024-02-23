const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    userDetails: {
        name: {
            firstName: {type: String, required: true},
            middleName: {type: String, required: true},
            lastName: {type: String, required: true}
        },
        emailAddress: {type: String, required: true, match: /^\S+@\S+\.\S+$/},
        userType: {type: String, required: true},
        status: {type: String, required: true},
        dateCreated: {type: Date, required: true},
        dateUpdated: {type: Date, required: true},
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User