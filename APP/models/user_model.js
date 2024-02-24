const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        firstName: {type: String, required: true},
        middleName: {type:String, required: false},
        lastName: {type: String, required: true}
    },
    emailAddress: {type: String, required: true},
    userType: {type: String, enum: ['Dentist', 'Nurse', 'Doctor'], required: true},
    status: {type: String, enum: ['Active', 'Inactive'], required: true, default: "Active"},
    dateCreated: {type: Date, required: true},
    dateUpdated: {type: Date, required: true}
})

const User = mongoose.model('User', userSchema)

module.exports = User