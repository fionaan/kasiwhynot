const mongoose = require('mongoose')
const {BaseModel, Student, Employee} = require('../models/patient_model')
const utilFunc = require('../../utils')

const addRecord = async (req, res) => {
    const { basicInfo, laboratory, vaccination, medicalHistory, dentalRecords, exclusiveData, category } = req.body;

    // Create a new BasePatient document
    const basePatient = new BaseModel({
      basicInfo,
      laboratory,
      vaccination,
      medicalHistory,
      dentalRecords,
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
                            '$patientDetails.basicInfo.fullName.lastName',
                            ', ',
                            '$patientDetails.basicInfo.fullName.firstName',
                            {
                                $cond: { //middle name rules
                                    if: { 
                                        $ne: ['$patientDetails.basicInfo.fullName.middleName', ''] },
                                    then: {
                                        $concat: [
                                            ' ',
                                            { $substr: ['$patientDetails.basicInfo.fullName.middleName', 0, 1] },
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
    const fieldName = tab  // Replace this with the actual variable or logic to determine the field name
    let projection = {} //for the project aggregation because project can't use dynamic variables, so we'll use an object
    projection[fieldName] = `$patientDetails.${fieldName}` //creating properties for projection object which contains the fields of the user's selected tab

    try {
        let patientModel

        if (category == 'students'){
            patientModel = Student
            if (fieldName == 'basicInfo') { //if the user selected basicInfo tab, add the Student schema's exclusive fields to the properties
                projection['studentNo'] = 1
                projection['course'] = 1
                projection['year'] = 1
            }
        }
        else if (category == 'employees'){
            patientModel = Employee
            if (fieldName == 'basicInfo') { //if the user selected basicInfo tab, add the Employee schema's exclusive fields to the properties
                projection['employeeNo'] = 1
                projection['department'] = 1
            }
        }
        else {
            console.log("The category input in the body is not recognized.")
        }

        let patient = await patientModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(patientId) //filters based on _id
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
                $project: projection //projects the contents(properties) of the object
            }
        ])

        //check if null
        if (utilFunc.checkIfNull(patient) == true){
            console.log(patient)
            res.status(404).send({
                successful: false,
                message: "Patient not found"
            })
        }
        else {
            res.status(200).send({
                successful: true,
                message: "Retrieved the patient.",
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

const searchPatientList = async (req, res, next) => { 
    const {category, sort, search} = req.body //user must input in body to select a category
    const pageNumber = parseInt(req.params.pageNumber) || 1 //if page not specified in params, default to 1
    const pageSize = 50 //limit of records to be fetched
    const skip = (pageNumber - 1) * pageSize //number of pages to be skipped based on page number

    try {
        let matchCondition = {} // what the condition for the search would be
        let noHyphen = search.replace(/-/g, '') //remove the hyphen from the id in case there is

        if (utilFunc.checkIfNull(search) == true || search.trim() == "") { //check if search field is empty
            return res.status(400).send({
                successful: false,
                message: "The search field is empty"
            });
        }

        if (/^\d+$/.test(noHyphen) && category == 'students') { //if the search input are numbers only and category is 'students'
            matchCondition['studentNo'] = {$regex: noHyphen} //system searches for the studentNo only
        } 
        else if (/^\d+$/.test(noHyphen) && category == 'employees') { //if the search input are numbers only and category is 'employees'
            matchCondition['employeeNo'] = {$regex: noHyphen} //system searches for the employeeNo only
        } 
        else { //partial search for names
            const searchWords = search.split(/\s+/).map(word => `(?=.*${word})`).join('')
        
            matchCondition.$or = [
                {
                    $expr: {
                        $regexMatch: {
                            input: {
                                $concat: [
                                    '$patientDetails.basicInfo.fullName.firstName',
                                    ' ',
                                    '$patientDetails.basicInfo.fullName.middleName',
                                    ' ',
                                    '$patientDetails.basicInfo.fullName.lastName',
                                ]
                            },
                            regex: new RegExp(searchWords, 'i'),
                        },
                    },
                },
            ];
        }

        let patientModel
        if (category == 'students'){
            patientModel = Student
        }
        else if (category == 'employees'){
            patientModel = Employee
        }
        else {
            return res.status(400).send({
                successful: false,
                message: "The category input in the body is not recognized."
            })
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
                $match: matchCondition
            },
            {
                $project: { //what results to display
                    studentNo: 1, //will only display for student
                    employeeNo: 1, //will only display for employee
                    fullName: {
                        $concat: [
                            '$patientDetails.basicInfo.fullName.lastName',
                            ', ',
                            '$patientDetails.basicInfo.fullName.firstName',
                            {
                                $cond: { //middle name rules
                                    if: { 
                                        $ne: ['$patientDetails.basicInfo.fullName.middleName', ''] },
                                    then: {
                                        $concat: [
                                            ' ',
                                            { $substr: ['$patientDetails.basicInfo.fullName.middleName', 0, 1] },
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

module.exports = {
    getPatientList,
    getPatient,
    searchPatientList,
    addRecord
}

