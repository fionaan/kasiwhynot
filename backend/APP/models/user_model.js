const mongoose = require('mongoose')
const utils = require('../../utils')

const Schema = mongoose.Schema

const userSchema = new Schema({ // all fields are required
    fullName: {
        firstName: { // *
            type: String,
            required: [true, "(User) Firstname is required"],
            trim: true,
            maxlength: [255, "(User) Firstname must only contain 255 characters or fewer"],
            match: [utils.textRegex, "(User) Firstname can only contain letters and a few common symbols"]
        },
        middleName: { // optional
            type: String,
            required: [true, "(User) Middlename is required or put N/A"],
            trim: true,
            maxlength: [255, "(User) Middlename must only contain 255 characters or fewer"],
            match: [utils.textOpRegex, "(User) Middlename can only contain letters and a few common symbols"]
        },
        lastName: { // *
            type: String,
            required: [true, "(User) Lastname is required"],
            trim: true,
            maxlength: [255, "(User) Lastname must only contain 255 characters or fewer"],
            match: [utils.textRegex, "(User) Lastname can only contain letters and a few common symbols"]
        },
    },
    emailAddress: {
        type: String,
        required: [true, '(User) Email address is required'],
        trim: true,
        match: [utils.emailRegex, "Invalid (User) Email format"]
    },
    password: {
        type: String,
        required: [true, "(User) Password is required"],
        minlength: [8, "(User) Password must be at least 8 characters"],
        maxlength: [20, "(User) Password must only be a maximum of 20 characters"],
        match: [utils.passwordRegex, "(User) Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and includes 8-20 characters."] 
    },
    userType: {
        type: String,
        required: [true, "(User) Type is required"],
        trim: true,
        enum: {
            values: ['Dentist', 'Nurse', 'Doctor'],
            message: "Invalid (User) Type "
        },
    },
    status: {
        type: String,
        required: [true, "(User) Status is required"],
        trim: true,
        enum: {
            values: ['Active', 'Inactive'],
            message: "Invalid (User) Status"
        }
    },
    passChangeable: {
        type: Boolean,
        required: [true, "Passchangeable value is required"]
    },
}, { timestamps: true })

const User = mongoose.model('Users', userSchema)

module.exports = User