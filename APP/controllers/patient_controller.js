const {BaseModel, Student, Employee} = require('../models/patient_model')
const utilFunc = require('../../utils')

const getPatientList = async (req, res, next) => { 
    const {category, sort} = req.body //user must input in body to select a category
    const pageNumber = parseInt(req.params.pageNumber) || 1 //if page not specified in params, default to 1
    const pageSize = 50 //limit of records to be fetched
    const skip = (pageNumber - 1) * pageSize //number of pages to be skipped based on page number

    try {
        let patientModel

        if (category == 'students'){
            patientModel = Student
        }
        else if (category == 'employees'){
            patientModel = Employee
        }
        else {
            console.log("The category input in the body is not recognized.")
        }
 
        let patient = await patientModel.aggregate([
            {
                $lookup: { //join base schema
                    from: 'basepatients',
                    localField: 'details',
                    foreignField: '_id',
                    as: 'patientDetails'
                }
            },
            {
                $unwind: '$patientDetails' //deconstruct the array produced by lookup
            },
            {
                $project: { //what results to display
                    studentNo: 1, //will only display for student
                    employeeNo: 1, //will only display for employee
                    fullName: {
                        $concat: [
                            '$patientDetails.basicInfo.lastName',
                            ', ',
                            '$patientDetails.basicInfo.firstName',
                            {
                                $cond: { //middle name rules
                                    if: { 
                                        $ne: ['$patientDetails.basicInfo.middleName', ''] },
                                    then: {
                                        $concat: [
                                            ' ',
                                            { $substr: ['$patientDetails.basicInfo.middleName', 0, 1] },
                                            '.'
                                        ]
                                    },
                                    else: ''
                                }
                            }           
                        ]
                    },
                    course: 1, //will only display for student
                    year: 1, //will only display for student
                    department: 1, //will only display for employee
                    campus: '$patientDetails.basicInfo.campus',
                    // _id: 0 //exlude _id from results
                }
            },
            {
                $sort: { //sort the full name in the result's based on the req.body
                    'fullName': sort
                }
            },
            {
                $skip: skip, //for pagination
            },
            {
                $limit: pageSize, //for pagination
            },
        ])

        //check if null
        if (utilFunc.checkIfNull(patient) == true){
            console.log(patient)
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

const getPatient = async (req, res, next) => { 
    const {patientId, tab, category} = req.body //user must input the _id of the patient

    try {
        let patientModel

        if (category == 'students'){
            patientModel = Student
        }
        else if (category == 'employees'){
            patientModel = Employee
        }
        else {
            console.log("The category input in the body is not recognized.")
        }

        let patient = await patientModel.aggregate([
            {
                $match: {
                    _id: "$patientId"
                }
            },
            {
                $set: {
                    tab: "$tab"
                }
            },
            {
                $lookup: { //join base schema
                    from: 'basepatients',
                    localField: 'details',
                    foreignField: '_id',
                    as: 'patientDetails'
                }
            },
            {
                $unwind: '$patientDetails' //deconstruct the array produced by lookup
            },
            {
                $project: { //what results to display
                   basicInfo: 1
                }
            }
        ])

        //check if null
        if (utilFunc.checkIfNull(patient) == true){
            console.log(patient)
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
    const searchQuery = req.body.keyz

    try {
        
    }

    catch(err) {
        res.status(500).send({
            successful: false,
            message: err.message
        })   
    }
}

module.exports = {
    getPatientList,
    getPatient,
    searchPatient
}