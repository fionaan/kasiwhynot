//LIST OF ALL UTILITY FUNCTIONS

//CHECKS IF DATA CONTAINS COMPLETE DATE & TIME VALUE
const dateTimeRegex = /^(?:\d{4})-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])T(?:[0-1][0-9]|2[0-3]):(?:[0-5][0-9]):(?:[0-5][0-9])$/

//CHECKS IF DATA CONTAINS DATE ONLY
const dateRegex = /^(?:19|20)\d{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/

//CHECKS IF STRING ONLY CONTAINS LETTERS, PERIOD, APOSTROPHE, HYPHEN, OR SPACE - MUST START W LETTER
const nameRegex = /^[a-zA-Z][a-zA-Z.,'\s-]*$/

//CHECKS IF STRING ONLY CONTAINS LETTERS, PERIOD, APOSTROPHE, HYPHEN, OR SPACE - MUST START W LETTER
const tempNameRegex = /^\p{L}[\p{L}.' -]*$/

//CHECKS IF EMAIL IS VALID
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

//LIST REFERENCE FOR USER TYPES
const userTypeList = ['Dentist', 'Nurse', 'Doctor']

//LIST REFERENCE FOR HISTORY TYPES
const historyTypeList = ['ADD', 'UPDATE', 'ARCHIVE', 'UNARCHIVE']

//LIST REFERENCE FOR RECORD CLASS
const recordClassList = ['Medical', 'Dental']

//CHECKS IF THE ARGUMENT IS NULL OR NOT. RETURNS TRUE IF THE ARGUMENT IS NULL, OTHERWISE RETURNS FALSE.
const checkIfNull = (data)=>{
    return (data == null || data == "null" || data == "" || data.trim() == "" || (typeof data === "undefined"))
}

//CHECKS IF AN OBJECT ARGUMENT IS NULL OR NOT. RETURNS TRUE IF THE OBJECT IS NULL, OTHERWISE RETURNS FALSE.
const checkObjNull = (obj)=>{
    return (obj == null || obj == "null" || obj == "" || (typeof obj === "undefined"))
}

//CHECKS IF THE VALUE OF A MANDATORY FIELD IS NULL OR NOT. RETURNS TRUE IF ALL MANDATORY FIELDS ARE NOT NULL, OTHERWISE RETURNS FALSE.
const checkMandatoryFields = (arrs)=>{
    let result = true
    
    arrs.forEach(data => {
        if (checkIfNull(data) == true){
            result = false
        }
    });

    return result
}

String.prototype.toProperCase = function()
{
    return this.toLowerCase().replace(/^(.)|\s(.)/g, function($1) { return $1.toUpperCase(); })
}

module.exports = {
    dateTimeRegex,
    dateRegex,
    nameRegex,
    emailRegex,
    userTypeList,
    historyTypeList,
    recordClassList,
    checkIfNull,
    checkObjNull,
    checkMandatoryFields,
    toProperCase: String.prototype.toProperCase
}