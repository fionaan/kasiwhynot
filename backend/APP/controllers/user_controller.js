const nodeMailer = require('nodemailer')
const User = require('../models/user_model')
const { toProperCase } = require('../../utils')
const utils = require('../../utils')
const { emptyDirSync } = require('fs-extra')

const viewProfileSetting = async (req, res, next) => {
    try {
        const { userId } = req.body

        // Validate if the userId is provided
        if (!userId) {
            return res.status(400).json({
                successful: false,
                message: 'User ID is required.'
            })
        }

        if (utils.isObjIdValid(userId)) utils.throwErorr('User Id is invalid')
        let user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({
                successful: false,
                message: 'User not found'
            })
        }

        user.fullName.middleName = (user.fullName.middleName === "N/A") ?  "" : user.fullName.middleName[0] + "."  

        const passwordLength = user.password.length;
        const maskedPassword = '*'.repeat(passwordLength)

        const userProfile = {
            name: user.fullName.lastName + ", " + user.fullName.firstName + " " + user.fullName.middleName,
            emailAddress: user.emailAddress,
            userType: user.userType,
            password: maskedPassword
        }

        res.status(200).json({
            successful: true,
            message: 'User profile retrieved successfully.',
            userProfile: userProfile
        })
    } catch (error) {
        res.status(500).json({
            successful: false,
            message: error.message
        })
    }
}

const getUser = async (req, res, next) => {
    try {
        const pageNumber = parseInt(req.params.pageNumber) || 1 // default to 1 if no param is set
        const pageSize = 50 // limits of records to be fetched per page
        const skip = (pageNumber - 1) * pageSize
        let error

        // CHECK IF pageNumber IS VALID BASED ON NUMBER OF AVAILABLE RECORDS
        const totalCount = await User.countDocuments()

        if (skip >= totalCount && totalCount !== 0) {
            error = new Error('Invalid page number.')
            error.status = 404
            throw error
        }

        let users = await User.aggregate([
            {
                $project: {
                    fullName: {
                        $concat: [
                            '$fullName.lastName',
                            ', ',
                            '$fullName.firstName',
                            {
                                $cond: {
                                    if: {
                                        $ne: [{ $type: '$fullName.middleName' }, 'missing']
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    { $ne: ['$fullName.middleName', null] },
                                                    { $ne: ['$fullName.middleName', ''] },
                                                    { $ne: ['$fullName.middleName', 'null'] },
                                                    { $ne: [{ $trim: { input: '$fullName.middleName' } }, ''] },
                                                    { $ne: [{ $trim: { input: '$fullName.middleName' } }, 'null'] }
                                                ]
                                            },
                                            then: {
                                                $concat: [
                                                    ' ',
                                                    { $substr: ['$fullName.middleName', 0, 1] },
                                                    '.'
                                                ]
                                            },
                                            else: ''
                                        }
                                    },
                                    else: ''
                                }
                            }
                        ]
                    },
                    emailAddress: 1,

                    userType: 1,
                    status: 1,

                    createdAt: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: { $toDate: "$createdAt" },
                            timezone: "Asia/Manila"
                        }
                    },
                    updatedAt: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: { $toDate: "$updatedAt" },
                            timezone: "Asia/Manila"
                        }
                    }
                }
            },
            {
                $sort: {
                    'status': 1,
                    'fullName.lastName': 1
                }
            },
            {
                $skip: skip // for pagination
            },
            {
                $limit: pageSize // for pagination
            }
        ])

        if (users.length === 0) {
            error = new Error('No user accounts are created yet.')
            error.status = 404
            throw error
        } else {
            res.status(200).json({
                successful: true,
                message: "Retrieved all users.",
                count: users.length,
                data: users
            })
        }

    } catch (error) {
        res.status(error.status || 500).json({
            successful: false,
            message: error.message
        })
    }
}
const addUser = async (req, res, next) => {

    try {
        let { fullName, emailAddress, userType } = req.body
        password = utils.generatePassword()

        //CHECK FOR NULL OR EMPTY FIELDS
        // const nullFields = []

        // if (utils.checkObjNull(fullName)) {
        //     nullFields.push('full name')
        // } else {

        //     if (utils.checkIfNull(fullName.firstName)) nullFields.push('first name')
        //     if (!(typeof fullName.middleName === "undefined") && (utils.checkIfNull(fullName.middleName))) nullFields.push('middle name')

        //     if (utils.checkIfNull(fullName.lastName)) nullFields.push('last name')
        // }

        // if (utils.checkIfNull(emailAddress)) nullFields.push('email address')
        // if (utils.checkIfNull(password)) nullFields.push('password')
        // if (utils.checkIfNull(userType)) nullFields.push('user type')

        // if (nullFields.length > 0) {
        //     res.status(404).send({
        //         successful: false,
        //         message: `Missing data in the following fields: ${nullFields.join(', ')}`
        //     })
        // }
        // else {

        if (userType) userType = userType.trim().toProperCase()
        // fullName.firstName = fullName.firstName.trim()
        // fullName.lastName = fullName.lastName.trim()
        // if (!utils.checkIfNull(fullName.middleName)) fullName.middleName = fullName.middleName.trim()

        // CHECK FOR FIELDS W INVALID VALUES
        const existingUser = await User.findOne({ emailAddress: emailAddress })

        // const invalidFields = []
        // if (!utils.textRegex.test(fullName.firstName)) invalidFields.push('first name')
        //     console.log('te')
        // if ((!utils.checkIfNull(fullName.middleName)) && (!utils.textRegex.test(fullName.middleName))) invalidFields.push('middle name')
        // if (!utils.textRegex.test(fullName.lastName)) invalidFields.push('last name')
        if (existingUser) utils.throwError('Email address already exists', 400)
        // }
        // else {
        //     if (!utils.emailRegex.test(emailAddress)) invalidFields.push('email address')
        // }
        // if (!utils.userTypeList.includes(userType)) invalidFields.push('user type')

        // if (invalidFields.length > 0) {
        //     res.status(404).send({
        //         successful: false,
        //         message: `Invalid values detected for the following fields: ${invalidFields.join(', ')}`
        //     })
        // }
        // else {

        let user = new User({
            fullName: fullName,
            emailAddress: emailAddress,
            password: password,
            userType: userType,
            status: "Inactive",
            passChangeable: true,
            archived: false
        })

        user.save()
            .then((result) => {
                res.status(200).send({
                    successful: true,
                    message: "Successfully added a new user.",
                    data: result
                })
            })
            .catch((error) => {
                res.status(500).send({
                    successful: false,
                    message: error.message
                })
            })
        // }

        // }
    }
    catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }

}

const archiveUser = async (req, res, next) => {
    try {
        const userId = req.body._id;

        if (!userId) {
            utils.throwError('User ID is required', 400)
            // return res.status(400).json({
            //     successful: false,
            //     message: 'User ID is required.'
            // });
        }

        const user = await User.findById(userId);

        if (!user) {
            utils.throwError('User not found', 404)
            // return res.status(404).json({
            //     successful: false,
            //     message: 'User not found.'
            // });
        }

        // Check if already archived
        if (user.archived) {
            utils.throwError('Patient is already archived', 400)
        }

        user.archived = true;
        await user.save()

        return res.status(200).json({
            successful: true,
            message: 'User archived successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: error.message
        });
    }
};

const unarchiveUser = async (req, res, next) => {
    try {
        const userId = req.body._id;

        if (!userId) {
            utils.throwError('User ID is required.', 400)
            // return res.status(400).json({
            //     successful: false,
            //     message: 'User ID is required.'
            // });
        }

        const user = await User.findById(userId);

        if (!user) {
            utils.throwError('User not found.', 404)
            // return res.status(404).json({
            //     successful: false,
            //     message: 'User not found.'
            // });
        }

        if (!user.archived) {
            utils.throwError('Patient is not yet archived', 400)
            // return res.status(400).json({
            //     successful: false,
            //     message: 'Patient is not archived',
            // });
        }

        user.archived = false;
        await user.save();

        return res.status(200).json({
            successful: true,
            message: 'User unarchived successfully.'
        });
    } catch (error) {
        return res.status(500).json({
            successful: false,
            message: error.message
        });
    }
};

const html = `
    <h1>Hello World</h1>
    <p>isn't NodeMailer useful?</p>
    <img src="cid:unique@openjavascript.info" width="400'>
`

const sendEmail = async (req, res) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                name: '',
                user: '',
                pass: 'NodeMailer123'
            }
        })

        const info = await transporter.sendMail({
            from: 'OpenJavaScript <test@openjavascript.info>',
            to: 'test2@openjavascript.info',
            subject: 'Testing, Testing, 123!',
            text: "Test text content",
            html: html,
            attachments: [{
                filename: 'file_name',
                path: '../../../../../frontend/assets/img/teletubbies.jpg',
                cid: 'unique@openjavascript.info'
            }]
        })

        console.log("Message sent" + info.messageId)
    }
    catch (error) {
        res.status(500).json({
            successful: false,
            message: error.message
        })
    }
}

const setNewName = async (req, res) => {
    try {
        const { userId, fullName } = req.body
        let nullFields = []

        // Validate if the userId is provided
        if (!userId) utils.throwError('User ID is required', 400)
        if (utils.checkObjNull(fullName)) {
            nullFields.push('Fullname required.')
        } else {
            if (utils.checkIfNull(fullName.firstName)) nullFields.push('Firstname required.')
            if (utils.checkIfNull(fullName.middleName)) nullFields.push('Middlename required.')
            if (utils.checkIfNull(fullName.lastName)) nullFields.push('Lastname required.')
        }

        if (nullFields.length > 0) utils.throwError(`Missing fields: ${nullFields.join(', ')}`, 400)

        const user = await User.findByIdAndUpdate(userId, User.findByIdAndUpdate(userId, {
            'fullName.firstName': fullName.firstName,
            'fullName.middleName': fullName.middleName,
            'fullName.lastName': fullName.lastName
        }), { new: true, runValidators: true })

        if (!user) utils.throwError('User not found', 404)

        res.status(200).json({
            successful: true,
            message: "Successfully changed name."
        })

    } catch (error) {
        res.status(error.status || 500).json({
            successful: false,
            message: error.message
        })
    }
}

module.exports = {
    addUser,
    getUser,
    viewProfileSetting,
    archiveUser,
    unarchiveUser,
    setNewName
};
