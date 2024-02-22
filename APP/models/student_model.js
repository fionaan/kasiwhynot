const mongoose = require('mongoose')

const Schema = mongoose.Schema

const StudentSchema = new Schema({
    first_name: {
        type: String,
        required: [true, "First name is required."]
    },
    last_name: {
        type: String,
        required: [true, "Last name is required."]
    },
    age: {
        type: Number,
        required: [true, "Age is required."]
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: [true, "Gender is male or female only."]
    },
    address: {
        street_name: {
            type: String,
            default: ""
        },
        brgy_name: {
            type: String,
            default: ""
        },
        city: {
            type: String,
            default: ""
        },
        region: {
            type: String,
            default: ""
        }
    },
    subjects: {
        type: Array,
        default: []
    }
}, {timestamps: true})

const Student = mongoose.model('Student', StudentSchema)

module.exports = Student