const User = require('../models/user_model')
const { nameRegex,
        emailRegex,
        userTypeList,
        dateRegex,
        toProperCase,
        checkObjNull,
        checkIfNull } = require('../../utils')

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
        let {name, emailAddress, password, userType, dateCreated} = req.body

        //CHECK FOR NULL OR EMPTY FIELDS
        const nullFields = []
        
        if (checkObjNull(name)) {
            nullFields.push('full name')
        }else{
            
            if (checkIfNull(name.firstName)) nullFields.push('first name')
            if (!(typeof name.middleName === "undefined") && (checkIfNull(name.middleName))) nullFields.push('middle name')

            if (checkIfNull(name.lastName)) nullFields.push('last name')
        }

        if (checkIfNull(emailAddress)) nullFields.push('email address')
        if (checkIfNull(password)) nullFields.push('password')
        if (checkIfNull(userType)) nullFields.push('user type')
        if (checkIfNull(dateCreated)) nullFields.push('date created')

        if (nullFields.length > 0) {
            res.status(404).send({
                successful: false,
                message: `Missing data in the following fields: ${nullFields.join(', ')}`
            })       
        } 
        else {
            
            userType = userType.trim().toProperCase()
            name.firstName = name.firstName.trim()
            name.lastName = name.lastName.trim()
            if (!checkIfNull(name.middleName)) name.middleName = name.middleName.trim()

            //CHECK FOR FIELDS W INVALID VALUES
            const invalidFields = []
            if (!nameRegex.test(name.firstName)) invalidFields.push('first name')
            if ((!checkIfNull(name.middleName)) && (!nameRegex.test(name.middleName))) invalidFields.push('middle name')
            if (!nameRegex.test(name.lastName)) invalidFields.push('last name')
            if (!emailRegex.test(emailAddress)) invalidFields.push('email address')
            if (!userTypeList.includes(userType)) invalidFields.push('user type')
            if (!dateRegex.test(dateCreated)) invalidFields.push('date created')

            if (invalidFields.length > 0){
                res.status(404).send({
                    successful: false,
                    message: `Invalid values detected for the following fields: ${invalidFields.join(', ')}`
                })
            }
            else {

                let user = new User ({
                    name: name,
                    emailAddress: emailAddress,
                    password: password,
                    userType: userType,
                    status: "Active",
                    dateCreated: dateCreated,
                    dateUpdated: dateCreated
                })
    
                user.save()
                .then((result) =>{
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