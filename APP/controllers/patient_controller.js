const Patient = require('../models/patient_model')
const searchFilterer = require('./extra_functions')

const getPatient = async (req, res, next) => {
    const category = req.params.category
    const student = {'isStudent': true}
    const employee = {'isStudent': false}

    try {
        let patient
        if (category == 'student'){
            patient = await Patient.find(student)
        }
        else if (category == 'employee'){
            patient = await Patient.find(employee)
        }


        if (patient === ""){
            res.status(404).send({
                successful: false,
                message: "No patients found"
            })
        }
        else {
            res.status(200).send({
                successful: true,
                message: "Retrieved all patients.",
                count: patient.length,
                data: patient
            })
        }
    }

    catch(err) {
        res.status(500).send({
            successful: false,
            message: err.message
        })   
    }
}

const searchPatient = async (req, res, next) => {
    const searchQuery = req.query.search

    try {
        let patient = await searchFilterer(searchQuery)

        if (patient === ""){
            res.status(404).send({
                successful: false,
                message: "No patient found in the records"
            })
        }
        else {
            res.status(200).send({
                successful: true,
                message: "Successfully retrieved records from search input.",
                data: patient
            })
        }
    }

    catch(err) {
        res.status(500).send({
            successful: false,
            message: err.message
        })   
    }
}

module.exports = {
    getPatient,
    searchPatient
}