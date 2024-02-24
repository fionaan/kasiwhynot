const User = require('../models/user_model')

const addUser = (req, res, next)=>{
    const {name, emailAddress, userType, dateCreated, dateUpdated} = req.body

    // check if fields are null or empty
    const emptyOrNullVariables = []

    if (!name || name == "" || name === null) {
        emptyOrNullVariables.push('full name')
    }else{
        if (!name.firstName || name.firstName == "" || name.firstName === null) emptyOrNullVariables.push('first name')
        if (!name.lastName || name.lastName == "" || name.lastName === null) emptyOrNullVariables.push('last name')
    }

    if (!emailAddress || emailAddress == "" || emailAddress === null) emptyOrNullVariables.push('emailAddress')
    if (!userType || userType == "" || userType === null) emptyOrNullVariables.push('userType')
    if (!dateCreated || dateCreated == "" || dateCreated === null) emptyOrNullVariables.push('dateCreated')
    if (!dateUpdated || dateUpdated == "" || dateUpdated === null) emptyOrNullVariables.push('dateUpdated')

    if (emptyOrNullVariables.length > 0) {
        res.status(404).send({
            successful: false,
            message: `Missing data in the following fields: ${emptyOrNullVariables.join(', ')}`
        })       
    }

    //validate all fields -- email, usertype, status, dateupdated
    if(userType !== "Dentist" || userType !== "Doctor" || userType !== "Nurse"){
        res.status(404).send({
            successful: false,
            message: "Invalid user type."
        })
    }

    if (dateUpdated < dateCreated){
        res.status(404).send({
            successful: false,
            message: "Invalid Date Updated value."
        })
    }

    let user = new User ({
        name: name,
        emailAddress: emailAddress,
        userType: userType,
        status: "Active",
        dateCreated: dateCreated,
        dateUpdated: dateUpdated
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

module.exports = {
    addUser
}