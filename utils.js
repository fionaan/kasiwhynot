//LIST OF ALL UTILITY FUNCTIONS

// const { BaseModel } = require('../APP/models/patient_model');


// const checkIfRecordExists = (model, studentNo) => {
//     return model.findOne({ 'studentData.studentNo': studentNo })
//         .exec()
//         .then(record => {
//             return record !== null;
//         })
//         .catch(error => {
//             throw error;
//         });
// };

//CHECKS IF THE ARGUMENT IS NULL OR NOT. RETURNS TRUE IF THE ARGUMENT IS NULL, OTHERWISE RETURNS FALSE.
const checkIfNull = (data) => {
    return data == null || data === '' || typeof data === 'undefined' || data == [];
}


//CHECKS IF THE VALUE OF A MANDATORY FIELD IS NULL OR NOT. RETURNS TRUE IF ALL MANDATORY FIELDS ARE NOT NULL, OTHERWISE RETURNS FALSE.
const checkMandatoryFields = (data) => {
    let result = true;

    Object.values(data).forEach((el) => {
        if (checkIfNull(el)) {
            result = false;
        }
    });

    return result;
};

module.exports = {
    checkIfNull,
    checkMandatoryFields
}