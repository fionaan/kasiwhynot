const User = require('../models/user_model')
const { nameRegex,
    emailRegex,
    userTypeList,
    dateRegex,
    toProperCase,
    checkObjNull,
    checkIfNull,
    generatePassword } = require('../../utils')

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
        console.error(error)
        res.status(500).json({
            successful: false,
            message: 'Internal Server Error'
        })
    }
}

const addUser = (req, res, next) => {

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
            const invalidFields = []
            if (!nameRegex.test(fullName.firstName)) invalidFields.push('first name')
            if ((!checkIfNull(fullName.middleName)) && (!nameRegex.test(fullName.middleName))) invalidFields.push('middle name')
            if (!nameRegex.test(fullName.lastName)) invalidFields.push('last name')
            if (!emailRegex.test(emailAddress)) invalidFields.push('email address')
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
                            id: result._id
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

module.exports = {
    addUser,
    viewProfileSetting,
    archiveUser,
    unarchiveUser
};
