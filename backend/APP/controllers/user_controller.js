const nodeMailer = require('nodemailer')
const User = require('../models/user_model')
const { nameRegex,
    emailRegex,
    userTypeList,
    toProperCase,
    checkObjNull,
    checkIfNull,
    generatePassword } = require('../../utils')
const { emptyDirSync } = require('fs-extra')

const viewProfileSetting = async (req, res, next) => {
    try {
        const userId = req.body._id

        // Validate if the userId is provided
        if (!userId) {
            return res.status(400).json({
                successful: false,
                message: 'User ID is required.'
            })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({
                successful: false,
                message: 'User not found'
            })
        }

        const passwordLength = user.password.length;
        const maskedPassword = '*'.repeat(passwordLength)

        const userProfile = {
            name: user.name,
            emailAddress: user.emailAddress,
            userType: user.userType,
            password: maskedPassword
        }

        res.json({
            successful: true,
            message: 'User profile retrieved successfully.',
            userProfile: userProfile
        })
    } catch (error) {
        res.status(500).json({
            successful: false,
            message: 'Internal Server Error'
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
        password = generatePassword()

        //CHECK FOR NULL OR EMPTY FIELDS
        const nullFields = []

        if (checkObjNull(fullName)) {
            nullFields.push('full name')
        } else {

            if (checkIfNull(fullName.firstName)) nullFields.push('first name')
            if (!(typeof fullName.middleName === "undefined") && (checkIfNull(fullName.middleName))) nullFields.push('middle name')

            if (checkIfNull(fullName.lastName)) nullFields.push('last name')
        }

        if (checkIfNull(emailAddress)) nullFields.push('email address')
        if (checkIfNull(password)) nullFields.push('password')
        if (checkIfNull(userType)) nullFields.push('user type')

        if (nullFields.length > 0) {
            res.status(404).send({
                successful: false,
                message: `Missing data in the following fields: ${nullFields.join(', ')}`
            })
        }
        else {

            userType = userType.trim().toProperCase()
            fullName.firstName = fullName.firstName.trim()
            fullName.lastName = fullName.lastName.trim()
            if (!checkIfNull(fullName.middleName)) fullName.middleName = fullName.middleName.trim()

            //CHECK FOR FIELDS W INVALID VALUES
            const user = await User.findOne({ emailAddress: emailAddress })

            const invalidFields = []
            if (!nameRegex.test(fullName.firstName)) invalidFields.push('first name')
            if ((!checkIfNull(fullName.middleName)) && (!nameRegex.test(fullName.middleName))) invalidFields.push('middle name')
            if (!nameRegex.test(fullName.lastName)) invalidFields.push('last name')
            if (user) {
                invalidFields.push('email address already exists')
            }
            else {
                if (!emailRegex.test(emailAddress)) invalidFields.push('email address')
            }
            if (!userTypeList.includes(userType)) invalidFields.push('user type')

            if (invalidFields.length > 0) {
                res.status(404).send({
                    successful: false,
                    message: `Invalid values detected for the following fields: ${invalidFields.join(', ')}`
                })
            }
            else {

                let user = new User({
                    fullName: fullName,
                    emailAddress: emailAddress,
                    password: password,
                    userType: userType,
                    status: "Active",
                    passChangeable: true,
                    archived: false // New field
                })

                user.save()
                    .then((result) => {
                        res.status(200).send({
                            successful: true,
                            message: "Successfully added a new user.",
                            added_user: result
                        })
                    })
                    .catch((error) => {
                        res.status(500).send({
                            successful: false,
                            message: error.message
                        })
                    })
            }

        }
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
            return res.status(400).json({
                successful: false,
                message: 'User ID is required.'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                successful: false,
                message: 'User not found.'
            });
        }

        user.archived = true;
        await user.save();

        return res.status(200).json({
            successful: true,
            message: 'User archived successfully.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            successful: false,
            message: 'Internal Server Error'
        });
    }
};

const unarchiveUser = async (req, res, next) => {
    try {
        const userId = req.body._id;

        if (!userId) {
            return res.status(400).json({
                successful: false,
                message: 'User ID is required.'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                successful: false,
                message: 'User not found.'
            });
        }

        user.archived = false;
        await user.save();

        return res.status(200).json({
            successful: true,
            message: 'User unarchived successfully.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            successful: false,
            message: 'Internal Server Error'
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

module.exports = {
    addUser,
    getUser,
    viewProfileSetting,
    archiveUser,
    unarchiveUser
};
