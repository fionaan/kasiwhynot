//LIST OF ALL UTILITY FUNCTIONS

//CHECKS IF THE ARGUMENT IS NULL OR NOT. RETURNS TRUE IF THE ARGUMENT IS NULL, OTHERWISE RETURNS FALSE.
const checkIfNull = (data)=>{
    return (data == null || data == "null" || data == "" || (typeof data === "undefined"))
}

//CHECKS IF THE VALUE OF A MANDATORY FIELD IS NULL OR NOT. RETURNS TRUE IF ALL MANDATORY FIELDS ARE NOT NULL, OTHERWISE RETURNS FALSE.
const checkMandatoryFields = (arrs)=>{
    let result = true
    
    arrs.forEach(el => {
        if (checkIfNull(el) == true){
            result = false
        }
    });

    return result
}

module.exports = {
    checkIfNull,
    checkMandatoryFields
}