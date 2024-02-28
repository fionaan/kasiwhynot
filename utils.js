//LIST OF ALL UTILITY FUNCTIONS

//CHECKS IF DATA CONTAINS COMPLETE DATE & TIME VALUE
const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/

//CHECKS IF STRING ONLY CONTAINS SPACES, LETTERS, PERIODS, COMMAS
const nameRegex = /^[a-zA-Z.,\s]*$/

//CHECKS IF THE ARGUMENT IS NULL OR NOT. RETURNS TRUE IF THE ARGUMENT IS NULL, OTHERWISE RETURNS FALSE.
const checkIfNull = (data)=>{
    return (data == null || data == "null" || data == "" || data.trim() == "" || (typeof data === "undefined"))
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
    return this.toLowerCase().replace(/^(.)|\s(.)/g, function($1) { return $1.toUpperCase(); });
}

module.exports = {
    dateTimeRegex,
    nameRegex,
    checkIfNull,
    checkMandatoryFields,
    toProperCase: String.prototype.toProperCase
}