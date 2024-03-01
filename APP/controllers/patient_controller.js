const { Student,
        Employee,
        BaseModel
        } = require('../models/patient_model')
const mongoose = require('mongoose')

const addDentalRecord = async(req, res, next) => {

    try {
        let { patientId, category, dentalRecord } = req.body 
        category = category.trim().toLowerCase()
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
    catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }
}

module.exports = {
    addDentalRecord
}
