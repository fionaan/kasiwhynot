const User = require('../models/user_model')
const { nameRegex,
        emailRegex,
        userTypeList,
        toProperCase,
        checkObjNull,
        checkIfNull2,
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

const addUser = (req, res, next)=>{
    
    try {
        let {fullName, emailAddress, userType} = req.body
        password = generatePassword()

        //CHECK FOR NULL OR EMPTY FIELDS
        const nullFields = []
        
        if (checkObjNull(fullName)) {
            nullFields.push('full name')
        }else{
            
            if (checkIfNull2(fullName.firstName)) nullFields.push('first name')
            if (!(typeof fullName.middleName === "undefined") && (checkIfNull2(fullName.middleName))) nullFields.push('middle name')

            if (checkIfNull2(fullName.lastName)) nullFields.push('last name')
        }

        if (checkIfNull2(emailAddress)) nullFields.push('email address')
        if (checkIfNull2(password)) nullFields.push('password')
        if (checkIfNull2(userType)) nullFields.push('user type')

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
            if (!checkIfNull2(fullName.middleName)) fullName.middleName = fullName.middleName.trim()

            //CHECK FOR FIELDS W INVALID VALUES
            const invalidFields = []
            if (!nameRegex.test(fullName.firstName)) invalidFields.push('first name')
            if ((!checkIfNull2(fullName.middleName)) && (!nameRegex.test(fullName.middleName))) invalidFields.push('middle name')
            if (!nameRegex.test(fullName.lastName)) invalidFields.push('last name')
            if (!emailRegex.test(emailAddress)) invalidFields.push('email address')
            if (!userTypeList.includes(userType)) invalidFields.push('user type')

            if (invalidFields.length > 0){
                res.status(404).send({
                    successful: false,
                    message: `Invalid values detected for the following fields: ${invalidFields.join(', ')}`
                })
            }
            else {

                let user = new User ({
                    fullName: fullName,
                    emailAddress: emailAddress,
                    password: password,
                    userType: userType,
                    status: "Active"
                })
    
                user.save()
                .then((result) =>{
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
    catch (err){
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }
    
}

module.exports = {
    addUser,
    viewProfileSetting
}