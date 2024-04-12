require('dotenv').config()
const User = require('../models/user_model')
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        user: process.env.SYSTEM_EMAIL, // Replace with your Gmail address
        pass: process.env.SYSTEM_PASS // Replace with your Gmail password
        
    }
})

const sendCode = async (req, res, next) => {
    const email = req.body.email;

    try {
        // Retrieve user from database
        const user = await User.findOne({emailAddress: email})
        if (!user) {
            return res.status(404).send('User not found')
        }

        // Send email with user's password
        const mailOptions = {
            from: process.env.SYSTEM_EMAIL,
            to: email,
            subject: 'Your Password',
            text: `Your password is: ${user.password}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error)
                return res.status(500).send('Failed to send email')
            } else {
                console.log('Email sent: ' + info.response)
                return res.status(200).send('Email sent successfully')
            }
        });
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal server error')
    }
}

module.exports = {
    sendCode
}