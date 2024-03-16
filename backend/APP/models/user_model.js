const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    fullName: {
        firstName: {type: String, required: true},
        middleName: {type:String, required: false},
        lastName: {type: String, required: true}
    },
    emailAddress: {type: String, required: true},
    password: {type: String, required: true},
    userType: {type: String, enum: ['Dentist', 'Nurse', 'Doctor'], required: true},
    status: {type: String, enum: ['Active', 'Inactive'], required: true, default: "Active"},
    passChangeable: {type: Boolean, required: true, default: true},
}, { timestamps : true})

const User = mongoose.model('Users', userSchema)

module.exports = User