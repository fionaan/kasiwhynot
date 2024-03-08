const { Student,
        Employee,
        BaseModel
        } = require('../models/patient_model')
const { checkIfNull,
        checkObjNull,
        checkArrNull } = require('../../utils')
const mongoose = require('mongoose')

const addDentalRecord = async(req, res, next) => {

    try {
        let { patientId, category, dentalRecord } = req.body
        category = category.trim().toLowerCase()

        const odontogramKeys = [55,54,53,52,51,61,62,63,64,65,18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38,85,84,83,82,81,71,72,73,74,75]
        const q8Keys = ["numTeethPresent", "numCariesFreeTeeth", "numTeethforFilling", "numTeethforExtraction", "totalNumDecayedTeeth", "numFilledTeeth", "numMissingTeeth", "numUneruptedTeeth"]
        let missingKeys = []
        let patientModel

        // CHECK IF STUDENT OR EMPLOYEE
        if (category !== "students" && category !== "employees") {
            res.status(404).send({
                successful: false,
                message: "Invalid patient category was provided."
            })
        } 
        else {
            if (category === "students"){
                patientModel = Student
            } 
            else {
                patientModel = Employee
            }

            let patient = await patientModel.findOne({_id: patientId})

            if (patient === null){
                res.status(404).send({
                    successful: false,
                    message: `Patient record with id ${patientId} does not exist.`
                })
            }
            else {
                let base = await BaseModel.findOne({_id: patient.details})

                if (base === null) {
                    res.status(404).send({
                        successful: false,
                        message: `Base record with id ${patient.details} does not exist.`
                    })
                } 
                else {
                    
                    // CHECK FOR NULL DENTAL FIELDS  
                    nullFields = []
                    if (checkArrNull(dentalRecord.q1)) nullFields.push('q1')
                    if (checkIfNull(dentalRecord.q2)) nullFields.push('q2')
                    
                    if (checkObjNull(dentalRecord.q3)){
                        nullFields.push('q3')
                    } 
                    else {
                        if (checkObjNull(dentalRecord.q3.hasDentures)){
                            nullFields.push('q3: Has Dentures')
                        } 
                        else {
                            if (dentalRecord.q3.hasDentures === true && checkIfNull(dentalRecord.q3.dentureType)) nullFields.push('q3: Denture Type')
                        }
                    } 
                    
                    if (checkIfNull(dentalRecord.q4)) nullFields.push('q4')
                    
                    if (checkObjNull(dentalRecord.q5)){
                        nullFields.push('q5')
                    }
                    else {
                        if (checkObjNull(dentalRecord.q5.hasDentalProcedure)) {
                            nullFields.push('q5: Has Dental Procedure')
                        } 
                        else {
                            if (dentalRecord.q5.hasDentalProcedure === true && checkArrNull(dentalRecord.q5.pastDentalSurgery)) nullFields.push('q5: Past Dental Surgery')
                            if (dentalRecord.q5.hasDentalProcedure === true && !checkArrNull(dentalRecord.q5.pastDentalSurgery)) {
                                let surgeries = dentalRecord.q5.pastDentalSurgery

                                if (Array.isArray(surgeries)){
                                    surgeries.forEach((surgery, index) => {
                                        if (checkIfNull(surgery.name)) missingKeys.push(`q5: Past Dental Surgery: name - Index no. ${index}`)
                                        if (checkObjNull(surgery.date)) missingKeys.push(`q5: Past Dental Surgery: date - Index no. ${index}`)
                                    })
                                }
                                else {
                                    nullFields.push('q5: Past Dental Surgery is not an array error')
                                }   
                            }
                        } 
                    }
                    
                    missingKeys = []
                    if (checkObjNull(dentalRecord.q6)) {
                        nullFields.push('q6')
                    } 
                    else {
                        odontogramKeys.forEach(key => {
                            if(!dentalRecord.q6.hasOwnProperty(key.toString())) missingKeys.push(key)
                        })

                        if (missingKeys.length > 0) nullFields.push(`q6: keys: [${missingKeys.join(', ')}]`)
                    }

                    if (checkObjNull(dentalRecord.q7)) {
                        nullFields.push('q7')
                    }
                    else {
                        if (checkObjNull(dentalRecord.q7.presenceOfDebris)) nullFields.push('q7: Presence Of Debris')
                        if (checkObjNull(dentalRecord.q7.presenceOfToothStain)) nullFields.push('q7: Presence Of Tooth Stain')
                        if (checkObjNull(dentalRecord.q7.presenceOfGingivitis)) nullFields.push('q7: Presence Of Gingivitis')
                        if (checkObjNull(dentalRecord.q7.presenceOfPeriodontalPocket)) nullFields.push('q7: Presence Of Periodontal Pocket')
                        if (checkObjNull(dentalRecord.q7.presenceOfOralBiofilm)) nullFields.push('q7: Presence Of Oral Biofilm')
                        
                        if (checkObjNull(dentalRecord.q7.underOrthodonticTreatment)) {
                            nullFields.push('q7: Under Orthodontic Treatment')
                        } 
                        else {
                            if (checkObjNull(dentalRecord.q7.underOrthodonticTreatment.hasTreatment)) { 
                                nullFields.push('q7: Under Orthodontic Treatment: Has Treatment') 
                            } 
                            else {
                                if ((dentalRecord.q7.underOrthodonticTreatment.hasTreatment === true) && checkObjNull(dentalRecord.q7.underOrthodonticTreatment.date)) nullFields.push('q7: Under Orthodontic Treatment: date')
                            }
                        }
                    }

                    if (checkObjNull(dentalRecord.q8)) {
                        nullFields.push('q8')
                    } 
                    else {
                        missingKeys = []
                        q8Keys.forEach(key => {
                            if(!dentalRecord.q8.hasOwnProperty(key)) missingKeys.push(key) 
                        })
                        
                        if (missingKeys.length > 0) {
                            nullFields.push(`q8: keys: [${missingKeys.join(', ')}]`)
                        } 
                        else {
                            q8Keys.forEach(key => {
                                if (checkObjNull(dentalRecord.q8[key].temporary)) missingKeys.push(`q8: ${key}: temporary`)
                                if (checkObjNull(dentalRecord.q8[key].permanent)) missingKeys.push(`q8: ${key}: permanent`)
                            })

                            if (missingKeys.length > 0) {
                                nullFields.push(missingKeys)
                            } 
                        }
                    }

                    if (checkObjNull(dentalRecord.q9)) {
                        nullFields.push('q9')
                    }
                    else {
                        if (checkObjNull(dentalRecord.q9.hasDentofacialAb)) {
                            nullFields.push('q9: Has Dentofacial Abnormality')
                        }
                        else {
                            if (dentalRecord.q9.hasDentofacialAb === true && checkArrNull(dentalRecord.q9.name)) nullFields.push('q9: name')
                        }
                    }

                    if (checkObjNull(dentalRecord.q10)) {
                        nullFields.push('q10')
                    }
                    else {
                        if (checkObjNull(dentalRecord.q10.needUpperDenture)) nullFields.push('q10: Need Upper Denture')
                        if (checkObjNull(dentalRecord.q10.needLowerDenture)) nullFields.push('q10: Need Lower Denture')
                    }

                    // ENSURES THAT THE FF FIELDS ARE PRESENT   
                    if (!dentalRecord.hasOwnProperty('notes')) nullFields.push('notes')
                    if (!dentalRecord.hasOwnProperty('attachments')) {
                        nullFields.push('attachments')
                    } 
                    else {
                        if (!checkArrNull(dentalRecord.attachments)) {
                            let listAtts = dentalRecord.attachments //array of attachments

                            if (Array.isArray(listAtts)) {
                                listAtts.forEach((attachments, index)=> {
                                    if (typeof attachments.filename === "undefined") nullFields.push(`attachment no. ${index}: filename`)
                                    if (typeof attachments.urlLink === "undefined") nullFields.push(`attachment no. ${index}: urlLink`)
                                })
                            } 
                            else {
                                nullFields.push(`attachments array reassignment failed`)
                            } 
                            
                        }
                    }
                    
                    //CHECK FOR ANY NULL FIELDS 
                    if (nullFields.length > 0) {
                        res.status(404).send({
                            successful: false,
                            message: `Missing data for the following fields: ${nullFields.join(', ')}`
                        })
                    } 
                    else {
                        
                        // CHECK FOR INVALID VALUES


                        dentalRecord.isFilledOut = true
                        base.dentalRecord = dentalRecord
        
                        base.save()
                        .then((result) => {
                            res.status(200).send({
                                successful: true,
                                message: `Successfully added Dental Record to ${result.basicInfo.firstName + " "+ result.basicInfo.lastName}`,
                                data: result
                            })
                        })
                        .catch((err) => {
                            res.status(500).send({
                                successful: false,
                                message: err.message
                            })
                        })
                    }
                    
                } 

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

//FOR TESTING ONLY

const addRecord = async (req, res) => {
    const { basicInfo, laboratory, vaccination, medicalHistory, dentalRecord, exclusiveData, category } = req.body

    // Create a new BasePatient document
    const basePatient = new BaseModel({
      basicInfo,
      laboratory,
      vaccination,
      medicalHistory,
      dentalRecord,
    });
  
    // Save the BasePatient document
    basePatient.save()
      .then(savedBasePatient => {
        if (category === 'students') {
          // If the category is a student, create a new Student document
          const studentData = { ...exclusiveData, details: savedBasePatient._id };
          const student = new Student(studentData);
  
          // Save the Student document
          return student.save();
        } else if (category === 'employees') {
          // If the category is an employee, create a new Employee document
          const employeeData = { ...exclusiveData, details: savedBasePatient._id };
          const employee = new Employee(employeeData);
  
          // Save the Employee document
          return employee.save();
        } else {
          // Handle other categories as needed
          return Promise.resolve();
        }
      })
      .then(() => {
        res.json({
          successful: true,
          message: 'Patient data added successfully',
        });
        
      })
      .catch(error => {
        console.error(error);
        res.status(500).json({
          successful: false,
          message: 'Error adding patient data',
          error: error.message,
        });
      });
  }


module.exports = {
    addDentalRecord,
    addRecord
}
