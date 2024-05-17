require('dotenv').config()
const User = require('../models/user_model')
const nodemailer = require('nodemailer')
const randomString = require('randomstring')
const utilFunc = require('../../utils')

const OTPcache = {};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        user: process.env.SYSTEM_EMAIL,
        pass: process.env.SYSTEM_PASS
        
    }
})

const sendCode = async (req, res, next) => {
    const email = req.body.email

    try {
        // Retrieve user from database
        const user = await User.findOne({emailAddress: email})
        if (!user) {
            return res.status(404).send('User not found')
        }

        // Send email with user's password
        const mailOptions = {
            from: {
                name: 'Healthy CEU',
                address: process.env.SYSTEM_EMAIL
            },
            to: email,
            subject: 'Your Password',
            text: `Your password is: ${user.password}`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error)
                return res.status(500).send('Failed to send email')
            } else {
                console.log('Email sent: ' + info.response)
                return res.status(200).send('Email sent successfully')
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal server error')
    }
}

const reqOTP = async (req, res, next) => {
    const {email} = req.body
    const otp = generateOTP()
    OTPcache[email] = otp //store OTP in cache

    let user = await User.findOne({ emailAddress: email })

    if (utilFunc.checkIfNull(email)) {
        return res.status(400).send("Email is not specified.")
    }
    if (utilFunc.checkIfNull(OTPcache[email])) {
        return res.status(400).send("OTP value failed to be stored.")
    }
    if (user == null) {
        return res.status(400).send("The specified user does not exist in the database.")
    }
    if (user.status == "Inactive") {
        return res.status(400).send("This user account is inactive.")
    }

    sendOTP(email, otp)
    res.cookie('otpCache', OTPcache, {maxAge: 30000, httpOnly: true})
    console.log(OTPcache)
    console.log(otp)
    res.status(200).json({message: "OTP sent successfully."})
}

const verifyOTP = async (req, res, next) => {
    const {email, otp} = req.body

    if (!OTPcache.hasOwnProperty(email)) {
        return res.status(400).json({message: "Email not found."})
    }

    const stringOTP = String(OTPcache[email]) //ensures that OTP will always be converted into a string

    if (stringOTP === otp.trim()) {
        delete OTPcache[email]
        return res.status(200).json({message: "OTP verified successfully"})
        //then redirect to setNewPassword page
    }
    else {
        return res.status(400).json({message: "Invalid OTP."})
    }
}

function generateOTP() {
    return randomString.generate({length: 4, charset: 'numeric'})
}

function sendOTP(email, otp) {
    try {
        const mailOptions = {
            from: {
                name: 'Healthy CEU',
                address: process.env.SYSTEM_EMAIL
            },
            to: email,
            subject: 'OTP request.',
            text: `Your OTP is: ${otp}`
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error)
                return res.status(500).send('Failed to send email')
            } else {
                console.log('Email sent: ' + info.response)
                return res.status(200).send('Email sent successfully')
            }
        })
    }
    catch (error) {
        console.error(error)
        res.status(500).send('Internal server error')
    }
}

module.exports = {
    sendCode,
    reqOTP,
    verifyOTP
}