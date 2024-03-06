const User = require('../models/user_model')
const { nameRegex,
        emailRegex,
        userTypeList,
        dateRegex,
        toProperCase,
        checkObjNull,
        checkIfNull,
        generatePassword } = require('../../utils')

const addUser = (req, res, next)=>{
    
    try {
        let {fullName, emailAddress, userType} = req.body
        password = generatePassword()

        //CHECK FOR NULL OR EMPTY FIELDS
        const nullFields = []
        
        if (checkObjNull(fullName)) {
            nullFields.push('full name')
        }else{
            
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
    addUser
}