const Patient = require('../models/patient_model')

const searchFilterer = async (search) => {
    try {
        const patients = await Patient.find({
            $or: [
                {'studentRecord.basicInfo.studentNo': { $regex: new RegExp(search, 'i')}},
                {'studentRecord.basicInfo.firstName': { $regex: new RegExp(search, 'i')}},
                {'studentRecord.basicInfo.middleName': { $regex: new RegExp(search, 'i')}},
                {'studentRecord.basicInfo.lastName': { $regex: new RegExp(search, 'i')}}
            ]
        })
        return patients

    } 
    catch(err) {
        throw err
    }
}
  
  module.exports = searchFilterer