const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
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


module.exports = mongoose.model('User', userSchema)