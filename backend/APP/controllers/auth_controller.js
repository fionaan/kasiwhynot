require('dotenv').config()
const User = require('../models/user_model')
const utilFunc = require('../../utils')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const login = async (req, res, next) => {
    const { email, password } = req.body

    //check for missing fields
    if (utilFunc.checkIfNull(email) || utilFunc.checkIfNull(password)) {
        return res.status(400).send("Please fill in the missing fields.")
    }

    try {
        let user = await User.findOne({ emailAddress: email })

        //check if user exists
        if (user == null) {
            return res.status(400).send("User not found.")
        }
        else if (await bcrypt.compare(req.body.password, user.password)) {
            //check if user is in a passChangeable state
            if (user.passChangeable === false) {
                let accessToken = generateAccessToken({ userId: user._id })
                let refreshToken = jwt.sign({userId: user._id}, process.env.REFRESH_TOKEN_SECRET)

                res.cookie('accessToken', accessToken, {httpOnly: true})
                res.cookie('refreshToken', refreshToken, {httpOnly: true})
                console.log(accessToken)
                return res.status(200).send({
                    successful: true,
                    message: "Login successful."
                })
            }
            else if (user.passChangeable === true) {
                return res.redirect('/change-password')
            }
        }
        else {
            return res.status(400).send("Wrong password.")
        }
    }

    catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }
}

const setNewPassword = async (req, res, next) => { //for setting new password after account creation or forgetting password, no "old password" validation
    const { email, newPassword, confirmNewPassword } = req.body
    console.log(newPassword)

    //check for missing fields
    if (utilFunc.checkIfNull(email) || utilFunc.checkIfNull(newPassword) || utilFunc.checkIfNull(confirmNewPassword)) {
        return res.status(400).send("Please fill in the missing fields.")
    }

    try {
        let user = await User.findOne({ emailAddress: email })

        //check if the specified user exists
        if (user == null) {
            return res.status(400).send("The specified user does not exist in the database.")
        }

        //check if New Password and Confirm New Password match each other
        if (newPassword != confirmNewPassword) {
            return res.status(400).send("The passwords in the fields don't match with each other.")
        }
        else if (newPassword === confirmNewPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            user.passChangeable = false;
            await user.save()

            return res.status(200).send({
                successful: true,
                message: "Password has been successfully changed."
            })
        }
    }

    catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }
}

const changeOldPassword = async (req, res, next) => { //for changing old password
    const { email, oldPassword, newPassword, confirmNewPassword } = req.body
    console.log(newPassword)

    //check for missing fields
    if (utilFunc.checkIfNull(email) || utilFunc.checkIfNull(oldPassword) || utilFunc.checkIfNull(newPassword) || utilFunc.checkIfNull(confirmNewPassword)) {
        return res.status(400).send("Please fill in the missing fields.")
    }

    try {
        let user = await User.findOne({ emailAddress: email })

        //check if the specified user exists
        if (user == null) {
            return res.status(400).send("The specified user does not exist in the database.")
        }

        if (user.password != oldPassword) {
            return res.status(400).send("The old password is incorrect")
        }

        //check if New Password and Confirm New Password match each other
        if (newPassword != confirmNewPassword) {
            return res.status(400).send("The new passwords in the fields don't match with each other.")
        }
        else if (newPassword === confirmNewPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            user.passChangeable = false;
            await user.save()

            return res.status(200).send({
                successful: true,
                message: "Password has been successfully changed."
            })
        }
    }

    catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }
}

const logout = (req, res, next) => {
    // Clear the refresh token cookie
    res.clearCookie('refreshToken')
    res.sendStatus(204)
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken;

    if (!authHeader) {
        return res.status(401).send("Authorization header is missing.");
    } else if (utilFunc.checkIfNull(token)) {
        return res.status(401).send("Can't find token.");
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                if (!refreshToken) {
                    return res.sendStatus(401);
                } else {
                    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                        if (err) {
                            return res.sendStatus(403);
                        } else {
                            let accessToken = generateAccessToken({ userId: user._id })
                            res.cookie('accessToken', accessToken, {httpOnly: true})
                            req.user = user
                            console.log("AT: " + accessToken)
                            console.log("RT: " + refreshToken)
                            next();
                        }
                    });
                }
            } else {
                return res.sendStatus(403)
            }
        } 
        
        else {
            console.log("yessss");
            req.user = user;
            next();
        }
    });
}

function generateAccessToken (user) {
    return jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10s'})
}

module.exports = {
    login,
    setNewPassword,
    changeOldPassword,
    generateAccessToken,
    authenticateToken,
    logout
}