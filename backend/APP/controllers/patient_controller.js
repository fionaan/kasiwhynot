const utils = require('../../utils')
const { toProperCase } = require('../../utils')
const { BaseModel, Student, Employee } = require('../models/patient_model')
const HistoryLog = require('../models/historylog_model')
const { addLog } = require('./historylog_controller')
const mongoose = require('mongoose')
const convertExcelToJson = require('convert-excel-to-json')
const fs = require('fs-extra')
const xlsx = require('xlsx')
const csvParser = require('csv-parser')


// ALL FUNCTIONS BELOW UNTIL END COMMENT ARE FOR TESTING PURPOSES ONLY ---------------
const deleteStudents = async (req, res) => {
    await Student.deleteMany()
        .then(() => {
            res.status(200).json({
                successful: true,
                message: 'deleted students'
            })
        })
}

const deleteEmployees = async (req, res) => {
    await Employee.deleteMany()
        .then(() => {
            res.status(200).json({
                successful: true,
                message: 'deleted employees'
            })
        })
}

const deleteBase = async (req, res) => {
    await BaseModel.deleteMany()
        .then(() => {
            res.status(200).json({
                successful: true,
                message: 'deleted base patients'
            })
        })
}

const testSb = async (req, res) => {
    try {
        const { studEmpId, category } = req.body
        let model

        if (category === 'students') {
            model = Student
        } else if (category === 'employees') {
            model = Employee
        } else {
            utils.throwError('Invalid category name.', 404)
        }

        const studEmpData = await model.findById(studEmpId)
        if (!studEmpData) {
            utils.throwError('Patient Record not found.', 404)
        }

        const baseData = await BaseModel.findById(studEmpData.details)
        if (!baseData) {
            utils.throwError('Base Record not found.', 404)
        }

        res.status(200).json({
            successful: true,
            fromStudEmpId: studEmpData._id,
            toBaseId: baseData._id,
            dentalRecord: baseData.dentalRecord
            // archived: baseData.archived,
            // archivedDate: baseData.archivedDate,
            // basicInfo: baseData.basicInfo,
            // studEmpInfo: studEmpData
        })

    } catch (error) {
        res.status(error.status || 500).json({
            successful: false,
            message: error.message
        })
    }
}

// END OF TEST FUNCTIONS/METHODS -----------------------------------------------------

// Finds base record based on given student/employee ID
const studentToBase = async (studEmpId, category) => {
    try {
        let model

        if (category === 'students') {
            model = Student
        } else if (category === 'employees') {
            model = Employee
        } else {
            utils.throwError('Invalid category provided.', 400)
        }

        const studEmpData = await model.findById(studEmpId)
        if (!studEmpData) {
            utils.throwError('Patient Record not found.', 404)
        }

        const baseData = await BaseModel.findById(studEmpData.details)
        if (!baseData) {
            utils.throwError('Base Record not found.', 404)
        }

        return {
            patient: baseData,
            studEmp: studEmpData,
            model: model
        }
    } catch (error) {
        throw error
    }
}

const addLogPromise = (editedBy, type, record, id) => {
    return new Promise((resolve, reject) => {
        addLog(editedBy, type, record, id, (status_log, successful_log, message_log) => {
            if (successful_log === false) {
                reject(new Error(message_log))
            } else {
                resolve({ status_log, successful_log, message_log })
            }
        })
    })
}

// addBulk using CSV
const addBulk = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = `uploads/${req.file.filename}`;

    try {
        const csvData = [];

        // Read the CSV file and parse its contents
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', row => {
                csvData.push(row);
            })
            .on('end', async () => {
                try {
                    // Process each row of CSV data
                    for (const row of csvData) {
                        console.log('Row:', row)
                        // Save the JSON data to the database
                        const baseModel = new BaseModel(row);
                        await baseModel.save()

                        const exclusiveData = {
                            studentNo: row['exclusiveData.studentNo'],
                            course: row['exclusiveData.course'],
                            year: row['exclusiveData.year'],
                            section: row['exclusiveData.section'],
                        };
                        // If category is 'students', save to Student model as well
                        if (row.category === 'students') {

                            const student = new Student(exclusiveData);
                            student.details = baseModel._id
                            await student.save()
                        }
                    }

                    // Clean up the file after processing
                    fs.unlinkSync(filePath)

                    res.json({
                        successful: true,
                        message: 'Bulk data added successfully',
                    })
                } catch (error) {
                    console.error('Error saving data:', error.message);
                    res.status(500).json({
                        successful: false,
                        message: 'Error adding bulk data',
                        error: error.message,
                    })
                }
            })
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({
            successful: false,
            message: 'Error reading CSV file',
            error: error.message,
        })
    }
}

const revertDelete = (deleteDoc, models, name) => {

}

const revertUpdate = (deleteDoc, models, name) => {

}

const saveAndLog = async (editedBy, type, record, successMessage, models, expected, documents, undoExcess) => {
    try {
        let results = [], response, log_id

        if (!undoExcess) {
            throw Error('No DELETE/REVERT operation is specified as argument.')
        }

        if (!(models.length === expected.length && expected.length == documents.length)) {
            throw Error('Unequal number of elements for: model, documents, & expected array arguments.')
        }

        for (let [index, [doc, task]] of documents.entries()) {

            // Ensures that Base record is the first document to be saved
            if (index === 0 && !(doc instanceof BaseModel)) {
                throw Error('Base Record must be listed first in the array.')
            }

            // Extra task done first before saving the document
            if (task) {
                doc = task(log_id)
            }

            await doc.save()
                .then(async (savedDoc) => {
                    // Use Base record ID in adding log
                    if (savedDoc instanceof BaseModel) log_id = savedDoc._id

                    results.push(savedDoc)

                    if (index === documents.length - 1) {
                        // Validates if no base patient was saved -- REMOVE
                        if (!log_id) throw Error('Base Patient ID is required.')

                        // Add log after successfully adding all required documents
                        const { status_log, successful_log, message_log } = await addLogPromise(editedBy, type, record, log_id)

                        response = {
                            successful: true,
                            message: successMessage
                        }
                    }
                })
                .catch(async (error) => {
                    if (results.length >= 1) {  // revert all saved records inside results array 
                        for (let [index, deleteDoc] of results.entries()) {
                            error.message += await undoExcess(deleteDoc._id, models[index], expected[index])
                        }
                    }
                    throw Error(error.message)
                })
            if (response) return response
        }

    } catch (error) {
        throw new Error(error.message)
    }
}

const addRecord = async (req, res) => {
    try {
        const { basicInfo, laboratory, vaccination, medicalHistory, dentalRecord, exclusiveData, category, editedBy } = req.body
        let model, message

        // Create a new BasePatient document
        const basePatient = new BaseModel({
            basicInfo,
            laboratory,
            vaccination,
            medicalHistory,
            dentalRecord,
        })

        // ADDITIONAL/SPECIFIC VALIDATIONS
        if (category === 'students') {
            model = Student
            if (exclusiveData.studentNo === "2000-00000") utils.throwError('Invalid Student Number.')
        } else if (category === 'employees') {
            model = Employee
            if (exclusiveData.employeeNo === "0000-0") utils.throwError('Invalid Employee Number.')
        } else {
            utils.throwError('Invalid patient category was provided.', 400)
        }

        let success_message = "Successfully added base record, patient record, & log."
        const response = await saveAndLog(editedBy, "ADD", "Medical", success_message,
            [BaseModel, model], ['Base record', `${category.toProperCase()} record`],
            [[basePatient, null], [null, (base_id) => {
                const studEmpData = { ...exclusiveData, details: base_id }
                const studEmp = new model(studEmpData)
                return studEmp
            }]],
            (async (id, model, name) => {
                try {
                    const deletedDoc = await model.findByIdAndDelete(id)
                    message = deletedDoc ? 'Successfully deleted.' : 'Error in deleting.';
                }
                catch (err) {
                    message = err.message
                }
                return ` ${name} Deletion status: ${message}`
            }))
        res.status(200).json(response)
    }
    catch (error) {
        res.status(500).json({
            successful: false,
            error: error.message
        })
    }
}

const getPatientList = async (req, res, next) => {
    try {
        const { category, sort, operation } = req.body //user must input in body to select a category
        const pageNumber = parseInt(req.params.pageNumber) || 1 //if page not specified in params, default to 1
        const pageSize = 50 //limit of records to be fetched
        const skip = (pageNumber - 1) * pageSize //number of pages to be skipped based on page number

        if (utils.checkIfNull(category)) utils.throwError('No category is provided.')
        if (utils.checkIfNull(sort)) utils.throwError('No sort value is provided.')

        let patientModel

        if (category == 'students') {
            patientModel = Student
        }
        else if (category == 'employees') {
            patientModel = Employee
        }
        else {
            return res.status(400).json({
                successful: false,
                message: "Invalid patient category was provided."
            })
        }

        // CHECK IF pageNumber IS VALID BASED ON NUMBER OF AVAILABLE RECORDS
        const totalCount = await patientModel.countDocuments()
        if (skip >= totalCount && totalCount !== 0) { // lagyan ng pagenumber sa condition
            return res.status(404).send({
                successful: false,
                message: "Invalid page number."
            })
        }

        if (sort !== 1 && sort !== -1) utils.throwError('Invalid sort value', 400)

        // Default display of all records based on category
        let pipeline = [
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
                                        $ne: ['$patientDetails.basicInfo.fullName.middleName', '']
                                    },
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
        ]

        // Produces records without dental information 
        // Required if 'Add Dental Record' operation
        if (operation === 'dental') {
            pipeline.splice(2, 0, {
                $match: {
                    'patientDetails.dentalRecord.isFilledOut': false
                }
            })
        }

        let patient = await patientModel.aggregate(pipeline)

        // Check if null
        if (utils.checkObjNull(patient)) {
            utils.throwError('No patients found', 404)
            // res.status(404).json({
            //     successful: false,
            //     message: "No patients found"
            // })
        }
        else {
            res.status(200).json({
                successful: true,
                message: "Retrieved all patients.",
                count: patient.length,
                data: patient
            })
        }
    }
    catch (err) {
        res.status(500).json({
            successful: false,
            message: err.message
        })
    }
}

const getPatient = async (req, res, next) => {
    try {
        let { patientId, tab, category, role } = req.body //user must input the _id of the patient
        const fieldName = tab
        let projection = {} //for the project aggregation because project can't use dynamic variables, so we'll use an object
        projection[fieldName] = `$patientDetails.${fieldName}` //creating properties for projection object which contains the fields of the user's selected tab

        let patientModel

        if (utils.checkIfNull(patientId)) utils.throwError('No patientId provided.', 400)
        if (utils.checkIfNull(tab)) utils.throwError('No tab value provided.', 400)
        if (utils.checkIfNull(category)) utils.throwError('No category provided.', 400)
        if (utils.checkIfNull(role)) utils.throwError('No role provided.', 400)

        category = category.trim().toLowerCase()
        role = role.trim().toLowerCase()
        tab = tab.trim()

        if (!utils.tabMedList.includes(tab) && !utils.tabDentalList.includes(tab)) {
            utils.throwError(`${tab} tab does not exist`, 404)
        }
        else {
            if (role === 'doctor' || role === 'nurse') {
                if (!utils.tabMedList.includes(tab)) utils.throwError(`Current User is unauthorized to access ${tab} tab`)
            } else if (role === 'dentist') {
                if (!utils.tabDentalList.includes(tab)) utils.throwError(`Current User is unauthorized to access ${tab} tab`)
            } else {
                utils.throwError('Invalid role', 400)
            }
        }

        if (category == 'students') {
            patientModel = Student
            if (fieldName == 'basicInfo') { //if the user selected basicInfo tab, add the Student schema's exclusive fields to the properties
                projection['studentNo'] = 1
                projection['course'] = 1
                projection['year'] = 1
            }
        }
        else if (category == 'employees') {
            patientModel = Employee
            if (fieldName == 'basicInfo') { //if the user selected basicInfo tab, add the Employee schema's exclusive fields to the properties
                projection['employeeNo'] = 1
                projection['department'] = 1
            }
        }
        else {
            return res.status(400).json({
                successful: false,
                message: "Invalid patient category was provided."
            });
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
        if (utils.checkObjNull(patient)) {
            utils.throwError('Patient not found', 404)
            // res.status(404).json({
            //     successful: false,
            //     message: "Patient not found"
            // })
        }
        else {
            res.status(200).json({
                successful: true,
                message: "Retrieved the patient.",
                data: patient
            })
        }
    }

    catch (err) {
        res.status(500).json({
            successful: false,
            message: err.message
        })
    }
}

const searchPatientList = async (req, res, next) => {
    try {
        const { category, sort, search } = req.body //user must input in body to select a category
        const pageNumber = parseInt(req.params.pageNumber) || 1 //if page not specified in params, default to 1
        const pageSize = 50 //limit of records to be fetched
        const skip = (pageNumber - 1) * pageSize //number of pages to be skipped based on page number

        if (utils.checkIfNull(category)) utils.throwError('No category provided.', 400)
        if (utils.checkIfNull(sort)) utils.throwError('No sort value provided.', 400)
        if (sort !== 1 && sort !== -1) utils.throwError('Invalid sort value', 400)

        let patientModel
        if (category == 'students') {
            patientModel = Student
        }
        else if (category == 'employees') {
            patientModel = Employee
        }
        else {
            return res.status(400).json({
                successful: false,
                message: "Invalid patient category was provided."
            })
        }

        let matchCondition = {} // what the condition for the search would be
        let noHyphen = search.replace(/-/g, '') //remove the hyphen from the id in case there is

        if (utils.checkIfNull(search)) { //check if search field is empty
            return res.status(400).json({
                successful: false,
                message: "The search field is empty"
            });
        }

        if (/^\d+$/.test(noHyphen) && category == 'students') { //if the search input are numbers only and category is 'students'
            matchCondition['studentNo'] = { $regex: noHyphen } //system searches for the studentNo only
        }
        else if (/^\d+$/.test(noHyphen) && category == 'employees') { //if the search input are numbers only and category is 'employees'
            matchCondition['employeeNo'] = { $regex: noHyphen } //system searches for the employeeNo only
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
                                        $ne: ['$patientDetails.basicInfo.fullName.middleName', '']
                                    },
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
        if (utils.checkObjNull(patient)) {
            utils.throwError('No patients found', 404)
            // res.status(404).json({
            //     successful: false,
            //     message: "No patients found"
            // })
        }
        else {
            res.status(200).json({
                successful: true,
                message: "Retrieved all patients.",
                count: patient.length,
                data: patient
            })
        }
    }

    catch (err) {
        res.status(500).json({
            successful: false,
            message: err.message
        })
    }
}

const addDentalRecord = async (req, res, next) => {
    try {
        let { category, patientId, editedBy, dentalRecord } = req.body
        category = category.trim().toLowerCase()
        let message, surgeries

        const odontogramKeys = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65, 18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38, 85, 84, 83, 82, 81, 71, 72, 73, 74, 75]
        const q8Keys = ["numTeethPresent", "numCariesFreeTeeth", "numTeethforFilling", "numTeethforExtraction", "totalNumDecayedTeeth", "numFilledTeeth", "numMissingTeeth", "numUneruptedTeeth"]
        let missingKeys = []
        let patientModel

        // CHECK IF STUDENT OR EMPLOYEE
        if (category === "students") {
            patientModel = Student
        }
        else if (category === "employees") {
            patientModel = Employee
        } else {
            utils.throwError('Invalid patient category was provided.', 400)
        }

        let patient = await patientModel.findOne({ _id: patientId })
        if (patient === null) {
            utils.throwError(`Patient record with id ${patientId} does not exist.`, 404)
            // res.status(404).json({
            //     successful: false,
            //     message: `Patient record with id ${patientId} does not exist.`
            // })
        }

        let base = await BaseModel.findOne({ _id: patient.details })

        if (base === null) {
            utils.throwError(`Base record with id ${patient.details} does not exist.`, 404)
            // res.status(404).json({
            //     successful: false,
            //     message: `Base record with id ${patient.details} does not exist.`
            // })
        }

        // CHECK IF THE PATIENT RECORD ALREADY CONTAINS DENTAL RECORD
        if (base.dentalRecord.isFilledOut === true) {
            utils.throwError(`Base record with id ${base._id} already contains a dental record.`, 400)
            // return res.status(400).json({
            //     successful: false,
            //     message: `Base record with id ${base._id} already contains a dental record.`
            // })
        }

        // CHECK FOR NULL DENTAL FIELDS  
        nullFields = []
        message = (utils.checkFullArr(dentalRecord.q1, 'q1', null, true))
        if (message !== null) nullFields.push(message)

        if (utils.checkIfNull(dentalRecord.q2)) nullFields.push('q2')

        if (utils.checkIfNull(dentalRecord.q3)) nullFields.push('q3')

        if (utils.checkObjNull(dentalRecord.q4)) {
            nullFields.push('q4')
        }
        // else {
        //     if (utils.checkIfNull(dentalRecord.q4.hasDentures)) {
        //         nullFields.push('q4: Has Dentures')
        //     }
        //     else {
        //         if (dentalRecord.q4.hasDentures === true && utils.checkIfNull(dentalRecord.q4.dentureType)) nullFields.push('q4: Denture Type')
        //     }
        // }

        if (utils.checkObjNull(dentalRecord.q5)) {
            nullFields.push('q5')
        }
        else {
            // if (utils.checkIfNull(dentalRecord.q5.hasDentalProcedure)) {
            //     nullFields.push('q5: Has Dental Procedure')
            // }
            // else {
            message = utils.checkFullArr(dentalRecord.q5, 'q5: Past Dental Surgery', (arr) => {
                let list = []
                arr.forEach((element, index) => {
                    if (utils.checkIfNull(element.description)) list.push(`q5: Past Dental Surgery: description - Index no. ${index}`)
                    if (utils.checkIfNull(element.date)) list.push(`q5: Past Dental Surgery: date - Index no. ${index}`)
                })
                return list
            }, false)
            if (message !== null) Array.isArray(message) ? nullFields = nullFields.concat(message) : nullFields.push(message)
            // }
        }

        if (utils.checkObjNull(dentalRecord.q6)) {
            nullFields.push('q6')
        }
        else {
            odontogramKeys.forEach((key) => {
                if (!dentalRecord.q6.hasOwnProperty(key.toString())) missingKeys.push(key)
            })

            if (missingKeys.length > 0) nullFields.push(`q6: keys: [${missingKeys.join(', ')}]`)
        }

        if (utils.checkObjNull(dentalRecord.q7)) {
            nullFields.push('q7')
        }
        else {
            if (utils.checkIfNull(dentalRecord.q7.presenceOfDebris)) nullFields.push('q7: Presence Of Debris')
            if (utils.checkIfNull(dentalRecord.q7.presenceOfToothStain)) nullFields.push('q7: Presence Of Tooth Stain')
            if (utils.checkIfNull(dentalRecord.q7.presenceOfGingivitis)) nullFields.push('q7: Presence Of Gingivitis')
            if (utils.checkIfNull(dentalRecord.q7.presenceOfPeriodontalPocket)) nullFields.push('q7: Presence Of Periodontal Pocket')
            if (utils.checkIfNull(dentalRecord.q7.presenceOfOralBiofilm)) nullFields.push('q7: Presence Of Oral Biofilm')

            if (utils.checkObjNull(dentalRecord.q7.underOrthodonticTreatment)) {
                nullFields.push('q7: Under Orthodontic Treatment')
            }
            else {
                // if (utils.checkIfNull(dentalRecord.q7.underOrthodonticTreatment.hasTreatment)) {
                //     nullFields.push('q7: Under Orthodontic Treatment: Has Treatment')
                // }
                // else {
                // if (dentalRecord.q7.underOrthodonticTreatment.hasTreatment === true) {

                // SERVER FAULT
                if (utils.checkIfNull(dentalRecord.q7.underOrthodonticTreatment.yearStarted)) nullFields.push('q7: Under Orthodontic Treatment: yearStarted')
                if (utils.checkIfNull(dentalRecord.q7.underOrthodonticTreatment.lastAdjustment)) nullFields.push('q7: Under Orthodontic Treatment: lastAdjustment')

                // }
                // }
            }
        }

        if (utils.checkObjNull(dentalRecord.q8)) {
            nullFields.push('q8')
        }
        else {
            missingKeys = []
            q8Keys.forEach((key) => {
                if (!dentalRecord.q8.hasOwnProperty(key)) missingKeys.push(key)
            })

            if (missingKeys.length > 0) {
                nullFields.push(`q8: keys: [${missingKeys.join(', ')}]`)
            }
            else {
                q8Keys.forEach((key) => {
                    if (utils.checkIfNull(dentalRecord.q8[key].temporary)) missingKeys.push(`q8: ${key}: temporary`)
                    if (utils.checkIfNull(dentalRecord.q8[key].permanent)) missingKeys.push(`q8: ${key}: permanent`)
                })

                if (missingKeys.length > 0) {
                    nullFields.push(missingKeys)
                }
            }
        }

        // if (utils.checkObjNull(dentalRecord.q9)) {
        //     nullFields.push('q9')
        // }
        // else {
        // if (utils.checkIfNull(dentalRecord.q9.hasDentofacialAb)) {
        //     nullFields.push('q9: Has Dentofacial Abnormality')
        // }
        // else {
        //if (dentalRecord.q9.hasDentofacialAb === true && utils.checkArrNull(dentalRecord.q9.name)) nullFields.push('q9: name')
        message = utils.checkFullArr(dentalRecord.q9, 'q9', null, false)
        if (message !== null) nullFields.push(message)
        // }
        // }

        if (utils.checkObjNull(dentalRecord.q10)) {
            nullFields.push('q10')
        }
        else {
            if (utils.checkIfNull(dentalRecord.q10.needUpperDenture)) nullFields.push('q10: Need Upper Denture')
            if (utils.checkIfNull(dentalRecord.q10.needLowerDenture)) nullFields.push('q10: Need Lower Denture')
        }

        // ENSURES THAT THE FF FIELDS ARE PRESENT   
        if (!dentalRecord.hasOwnProperty('notes')) nullFields.push('notes')
        // if (!dentalRecord.hasOwnProperty('attachments')) {
        //     nullFields.push('attachments')
        // }
        // else {
        message = utils.checkFullArr(dentalRecord.attachments, 'attachments', ((arr) => {
            let list = []
            arr.forEach((attachments, index) => {
                if (typeof attachments.filename === "undefined") list.push(`attachment no. ${index}: filename`)
                if (typeof attachments.urlLink === "undefined") list.push(`attachment no. ${index}: urlLink`)
            })
            return list
        }), false)
        if (message !== null) Array.isArray(message) ? nullFields = nullFields.concat(message) : nullFields.push(message)
        // }

        //CHECK FOR ANY NULL FIELDS 
        if (nullFields.length > 0) {
            utils.throwError(`Missing data for the following fields: ${nullFields.join(', ')}`, 400)
            // res.status(404).json({
            //     successful: false,
            //     message: `Missing data for the following fields: ${nullFields.join(', ')}`
            // })
        }
        else {
            // CHECK FOR INVALID VALUES
            invalidFields = []
            // if (dentalRecord.q2 > Date.now()) invalidFields.push('q2 date is later than current date')
            // if (!utils.q4Values.includes(dentalRecord.q4)) invalidFields.push('q4 invalid value')
            // if (dentalRecord.q5.hasDentalProcedure === true) {
            //     surgeries = dentalRecord.q5.pastDentalSurgery
            //     surgeries.forEach((surgery, index) => {
            //         if (surgery.date > Date.now()) invalidFields.push(`q5: Past Dental Surgery no. ${index}: provided date is later than current date`)
            //     })
            // }
            for (let key in dentalRecord.q6) {
                if (Array.isArray(dentalRecord.q6[key])) {
                    dentalRecord.q6[key].forEach((element) => {
                        if (!utils.q6Values.includes(element)) invalidFields.push(`q6: #${key}: ${element} is invalid value`)
                    })
                }
                else {
                    invalidFields.push(`q6 #${key} is not an array`)
                }
            }
            // if (dentalRecord.q7.underOrthodonticTreatment.hasTreatment === true) {
            //     if (dentalRecord.q7.underOrthodonticTreatment.yearStarted > new Date().getFullYear()) invalidFields.push('q7: Under Orthodontic Treatment: yearStarted is later than current year')
            //     if (dentalRecord.q7.underOrthodonticTreatment.lastAdjustment > Date.now()) invalidFields.push('q7: Under Orthodontic Treatment: lastAdjustment is later than current date')
            // }
            // for (let key in dentalRecord.q8) {
            //     if (dentalRecord.q8[key].temporary < 0 || dentalRecord.q8[key].temporary > 50) invalidFields.push(`q8: ${key}: invalid number for temporary`)
            //     if (dentalRecord.q8[key].permanent < 0 || dentalRecord.q8[key].permanent > 50) invalidFields.push(`q8: ${key}: invalid number for permanent`)
            // }
            // if (dentalRecord.q10.needUpperDenture < 0 || dentalRecord.q10.needUpperDenture > 3) invalidFields.push('q10: Need Upper Denture invalid number')
            // if (dentalRecord.q10.needLowerDenture < 0 || dentalRecord.q10.needLowerDenture > 3) invalidFields.push('q10: Need Lower Denture invalid number')

            // Copy original values in case of reverting
            const origDental = JSON.parse(JSON.stringify(base.dentalRecord))

            // Place the new dental record
            dentalRecord.isFilledOut = true
            base.dentalRecord = dentalRecord

            //ADD LOG FOR CREATION OF DENTAL RECORD
            let success_message = "Successfully added dental record & log."
            const response = await saveAndLog(editedBy, "ADD", "Dental", success_message, [BaseModel], ['Base Record'], [[base, null]],
                async (id, model, name) => {
                    try { // Revert changes

                        let latestDoc = await model.findById(id)
                        if (!latestDoc) throw Error('Document to Revert: Not found.')

                        latestDoc.dentalRecord = origDental

                        const revertedDoc = await latestDoc.save()
                        message = revertedDoc ? 'Successfully reverted' : 'Error in reverting'

                    } catch (error) {
                        message = error.message
                    }
                    return ` ${name} Revert status: ${message}.`
                })

            // Send overall response
            res.status(200).json(response)
        }
    }
    catch (error) {
        res.status(error.status || 500).json({
            successful: false,
            message: error.message
        })
    }
}

const updateRecord = async (req, res, next) => {
    try {
        const { role, studEmpId, category, editedBy, updatedData } = req.body
        let response, nullFields = []

        if (role !== 'doctor' && role !== 'nurse' && role !== 'dentist' && role !== 'admin') {
            utils.throwError('Invalid role.', 400)
        }
        if (checkIfNull(role)) utils.throwError('No role provided', 400)
        if (checkIfNull(studEmpId)) utils.throwError('No student/employee Id provided', 400)
        if (checkIfNull(category)) utils.throwError('No student/employee Id provided', 400)

        // Fetch base patient record using stud/emp id 
        const { patient, studEmp, model } = await studentToBase(studEmpId, category)

        // Check which record can be updated based on current user's role
        if (role === 'doctor' || role === 'nurse' || role === 'admin') {

            // Copy original values in case of reverting
            const origBase = JSON.parse(JSON.stringify(patient))
            const origStudEmp = JSON.parse(JSON.stringify(studEmp))

            // console.log("the orig base", origBase.basicInfo)
            // console.log("the orig studemp", origStudEmp)

            // TEMPORARY VALIDATIONS -- REMOVE IF VALIDATION SCHEMA IS COMPLETE
            if (utils.checkObjNull(updatedData.basicInfo)) nullFields.push('Basic Info')
            if (utils.checkObjNull(updatedData.laboratory)) nullFields.push('Laboratory')
            if (utils.checkObjNull(updatedData.vaccination)) nullFields.push('Vaccination')
            if (utils.checkObjNull(updatedData.medicalHistory)) nullFields.push('Medical History')

            if (category === 'students') {
                // Student null validation
                if (utils.checkIfNull(updatedData.studentNo)) nullFields.push('Student number')
                if (utils.checkIfNull(updatedData.course)) nullFields.push('Course')
                if (utils.checkIfNull(updatedData.year)) nullFields.push('Year')
                if (utils.checkIfNull(updatedData.section)) nullFields.push('Section')
            } else {
                // Employee null validation
                if (utils.checkIfNull(updatedData.employeeNo)) nullFields.push('Employee number')
                if (utils.checkIfNull(updatedData.department)) nullFields.push('Department')
            }

            if (nullFields.length > 0) {
                return res.status(404).json({
                    successful: false,
                    message: `Missing values on the following fields: ${nullFields.join(', ')}.`,
                });
            }

            // UPDATE ALL FIELDS -- BASE AND STUDENT/EMPLOYEE RECORD
            patient.basicInfo = updatedData.basicInfo
            patient.laboratory = updatedData.laboratory
            patient.vaccination = updatedData.vaccination
            patient.medicalHistory = updatedData.medicalHistory

            if (category === "students") {
                studEmp.studentNo = updatedData.studentNo
                studEmp.course = updatedData.course
                studEmp.year = updatedData.year
                studEmp.section = updatedData.section
            } else {
                studEmp.employeeNo = updatedData.employeeNo
                studEmp.department = updatedData.department
            }

            // console.log("new changes TO SAVE: base", patient.basicInfo)
            // console.log("new changes TO SAVE: studemp", studEmp)

            // SAVE AND LOG FOR UPDATING PATIENT MEDICAL RECORD
            let success_message = "Successfully updated patient medical record and added log."
            response = await saveAndLog(editedBy, "UPDATE", "Medical", success_message,
                [BaseModel, model], ['Base record', `${category.toProperCase()} record`],
                [[patient, null], [studEmp, null]],
                (async (id, model, name) => {
                    try {

                        let latestDoc = await model.findById(id)
                        if (!latestDoc) throw Error(`${name} to Revert: Not found.`)

                        // console.log(name, " saved: ", latestDoc)

                        if (latestDoc instanceof BaseModel) {
                            // console.log("andito ka pa ba base", origBase.basicInfo)
                            latestDoc.basicInfo = origBase.basicInfo
                            latestDoc.laboratory = origBase.laboratory
                            latestDoc.vaccination = origBase.vaccination
                            latestDoc.medicalHistory = origBase.medicalHistory
                        }
                        if (latestDoc instanceof Student) {
                            // console.log("andito ka pa ba studemp", origStudEmp)
                            latestDoc.studentNo = origStudEmp.studentNo
                            latestDoc.course = origStudEmp.course
                            latestDoc.year = origStudEmp.year
                            latestDoc.section = origStudEmp.section
                        }
                        if (latestDoc instanceof Employee) {
                            // console.log("andito ka pa ba studemp", origStudEmp)
                            latestDoc.employeeNo = origStudEmp.employeeNo
                            latestDoc.department = origStudEmp.department
                        }

                        // console.log("back to orig ", name, ": ", latestDoc)

                        const revertedDoc = await latestDoc.save()
                        message = revertedDoc ? 'Successfully reverted.' : 'Error in reverting.';
                    }
                    catch (error) {
                        message = error.message
                    }
                    return ` ${name} Revert status: ${message}`
                }))

        } else if (role === 'dentist' || role === 'admin') {

            if (utils.checkObjNull(updatedData.dentalRecord)) {
                utils.throwError('Missing dental record.', 404)
            }

            // Copy the original values in case of reverting
            const origDental = JSON.parse(JSON.stringify(patient.dentalRecord))

            console.log('the orig dental ', origDental)

            // Update dental records only
            patient.dentalRecord = updatedData.dentalRecord

            console.log('new changes to SAVE ', patient.dentalRecord)

            // SAVE AND LOG FOR UPDATING PATIENT DENTAL RECORD
            let success_message = "Successfully updated patient dental record and added log."
            response = await saveAndLog(editedBy, "UPDATE", "Dental", success_message, [BaseModel], ['Base Record'], [[patient, null]],
                async (id, model, name) => {
                    try { // Revert changes

                        let latestDoc = await model.findById(id)
                        if (!latestDoc) throw Error(`${name} to Revert: Not found.`)

                        console.log('saved CHANGES ', latestDoc.dentalRecord)

                        console.log('orig r u still der: ', origDental)

                        latestDoc.dentalRecord = origDental

                        console.log('back to orig ', latestDoc.dentalRecord)


                        const revertedDoc = await latestDoc.save()
                        message = revertedDoc ? 'Successfully reverted' : 'Error in reverting'

                    } catch (error) {
                        message = error.message
                    }
                    return ` ${name} Revert status: ${message}.`
                })
        }

        res.status(200).json(response)
    }
    catch (error) {
        console.error(error);
        res.status(error.status || 500).json({
            successful: false,
            message: error.message
        });
    }
};

const archivePatient = async (req, res) => {
    try {
        const { category, studEmpId, editedBy } = req.body;

        if (checkIfNull(studEmpId)) utils.throwError('No student/employee Id provided', 400)
        if (checkIfNull(category)) utils.throwError('No student/employee Id provided', 400)

        // Fetch base patient record using stud/emp id
        const { patient } = await studentToBase(studEmpId, category)

        // Check if already archived
        if (patient.archived) {
            utils.throwError('Patient is already archived', 400)
        }

        // Copy original values in case of reverting
        let origArchived = patient.archived
        let origArchivedDate = patient.archivedDate

        // Archive the patient
        patient.archived = true
        patient.archivedDate = new Date()

        //SAVE AND LOG FOR ARCHIVING PATIENT RECORD
        let success_message = "Successfully archived patient record & added log."
        const response = await saveAndLog(editedBy, "ARCHIVE", "All", success_message, [BaseModel], ['Base Record'], [[patient, null]],
            async (id, model, name) => {
                try { // Revert changes

                    let latestDoc = await model.findById(id)
                    if (!latestDoc) throw Error('Document to Revert: Not found.')

                    latestDoc.archived = origArchived
                    latestDoc.archivedDate = origArchivedDate

                    const revertedDoc = await latestDoc.save()
                    message = revertedDoc ? 'Successfully reverted' : 'Error in reverting'

                } catch (error) {
                    message = error.message
                }
                return ` ${name} Revert status: ${message}.`
            })

        // Send overall response
        res.status(200).json(response)

    } catch (error) {
        console.log(error.status)
        res.status(error.status || 500).json({
            successful: false,
            message: error.message
        });
    }
}

const unarchivePatient = async (req, res) => {
    try {
        const { category, studEmpId, editedBy } = req.body;

        // Fetch base patient record using stud/emp id
        const { patient } = await studentToBase(studEmpId, category)

        // Check if already unarchived
        if (!patient.archived) {
            return res.status(400).json({
                successful: false,
                message: 'Patient is not archived',
            });
        }

        // Copy original values in case of reverting
        let origArchived = patient.archived
        let origArchivedDate = patient.archivedDate

        // Unarchive the patient
        patient.archived = false
        patient.archivedDate = null

        //SAVE AND LOG FOR UNARCHIVING A RECORD
        let success_message = "Successfully unarchived patient record & added log."
        const response = await saveAndLog(editedBy, "UNARCHIVE", "All", success_message, [BaseModel], ['Base Record'], [[patient, null]],
            async (id, model, name) => {
                try { // Revert changes

                    let latestDoc = await model.findById(id)
                    if (!latestDoc) throw Error('Document to Revert: Not found.')

                    latestDoc.archived = origArchived
                    latestDoc.archivedDate = origArchivedDate

                    const revertedDoc = await latestDoc.save()
                    message = revertedDoc ? 'Successfully reverted' : 'Error in reverting'

                } catch (error) {
                    message = error.message
                }
                return ` ${name} Revert status: ${message}.`
            })

        // Send overall response
        res.status(200).json(response)

    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({
            successful: false,
            message: error.message,
        })
    }
}

const getFilterList = async (req, res, next) => {
    const { category } = req.body

    try {
        let courseOrDepartment
        let yearOrRole
        let campus

        if (category == 'students') {
            courseOrDepartment = await Student.distinct('course')
            yearOrRole = await Student.distinct('year')
            campus = await BaseModel.distinct('basicInfo.campus')
        }
        else if (category == 'employees') {
            courseOrDepartment = await Employee.distinct('department')
            yearOrRole = await Employee.distinct('role')
            campus = await BaseModel.distinct('campus')
        }
        else {
            return res.status(400).json({
                successful: false,
                message: "Invalid patient category was provided."
            });
        }

        res.status(200).json({
            success: true,
            data: {
                courseOrDepartment,
                yearOrRole,
                campus,
            },
        });
    }

    catch (err) {
        res.status(500).json({
            successful: false,
            message: err.message
        })
    }
}

const getFilteredResultList = async (req, res, next) => {
    try {
        const { filters, category, sort } = req.body
        const pageNumber = parseInt(req.params.pageNumber) || 1 //if page not specified in params, default to 1
        const pageSize = 50 //limit of records to be fetched
        const skip = (pageNumber - 1) * pageSize //number of pages to be skipped based on page number

        let patientModel
        let matchCondition = {}

        if (utils.checkIfNull(category)) utils.throwError('No category provided.', 400)
        if (utils.checkIfNull(sort)) utils.throwError('No sort value provided.', 400)
        if (sort !== 1 && sort !== -1) utils.throwError('Invalid sort value', 400)

        if (category == 'students') {
            patientModel = Student

            if (filters && filters.course) {
                matchCondition['course'] = { $in: filters.course }
            }
            if (filters && filters.year) {
                matchCondition['year'] = { $in: filters.year }
            }
        }
        else if (category == 'employees') {
            patientModel = Employee

            if (filters && filters.department) {
                matchCondition['department'] = { $in: filters.department }
            }
            if (filters && filters.role) {
                matchCondition['role'] = { $in: filters.role }
            }
        }
        else {
            return res.status(400).json({
                successful: false,
                message: "Invalid patient category was provided."
            })
        }

        if (filters && filters.campus) {
            matchCondition['patientDetails.basicInfo.campus'] = { $in: filters.campus }
        }

        let patient = await patientModel.aggregate([
            {
                $lookup: {
                    from: 'basepatients',
                    localField: 'details',
                    foreignField: '_id',
                    as: 'patientDetails'
                }
            },
            {
                $unwind: '$patientDetails'
            },
            {
                $match: matchCondition
            },
            {
                $project: {
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
                                        $ne: ['$patientDetails.basicInfo.fullName.middleName', '']
                                    },
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
                    role: 1, // will only display for employee
                    campus: '$patientDetails.basicInfo.campus',
                    // _id: 0 //exlude _id from results
                }
            },
            {
                $sort: {
                    'fullName': sort
                }
            },
            {
                $skip: skip
            },
            {
                $limit: pageSize
            },
        ])

        if (utils.checkObjNull(patient)) {
            res.status(404).json({
                successful: false,
                message: "No patients found"
            })
        }
        else {
            res.status(200).json({
                successful: true,
                message: "Retrieved all patients.",
                count: patient.length,
                data: patient
            })
        }
    }

    catch (err) {
        res.status(500).json({
            successful: false,
            message: err.message
        })
    }
}

const bulkArchivePatients = async (req, res) => {
    const { patientIds } = req.body;

    try {
        const patients = await BaseModel.find({ _id: { $in: patientIds } });
        const notFoundIds = patientIds.filter(id => !patients.find(patient => patient._id.equals(id)));
        if (notFoundIds.length > 0) {
            return res.status(404).json({
                successful: false,
                message: `Patients with the following IDs not found: ${notFoundIds.join(', ')}.`,
            });
        }

        await Promise.all(patients.map(async patient => {
            if (!patient.archived) {
                patient.archived = true;
                patient.archivedDate = new Date();
                await patient.save();
            }
        }));

        res.json({
            successful: true,
            message: 'Patients archived successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            successful: false,
            message: 'Error archiving patients',
            error: error.message,
        });
    }
};

const bulkUnarchivePatients = async (req, res) => {
    const { patientIds } = req.body;

    try {
        const patients = await BaseModel.find({ _id: { $in: patientIds } });
        const notFoundIds = patientIds.filter(id => !patients.find(patient => patient._id.equals(id)));
        if (notFoundIds.length > 0) {
            return res.status(404).json({
                successful: false,
                message: `Patients with the following IDs not found: ${notFoundIds.join(', ')}`,
            });
        }

        await Promise.all(patients.map(async patient => {
            if (!patient.archived) {
                patient.archived = true;
                patient.archivedDate = new Date();
                await patient.save();
            }
        }));

        res.json({
            successful: true,
            message: 'Patients unarchived successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            successful: false,
            message: 'Error unarchiving patients',
            error: error.message,
        });
    }
};

module.exports = {
    getPatientList,
    getPatient,
    searchPatientList,
    addRecord,
    addDentalRecord,
    updateRecord,
    archivePatient,
    unarchivePatient,
    getFilterList,
    getFilteredResultList,
    deleteStudents,
    deleteEmployees,
    deleteBase,
    testSb,
    addBulk,
    bulkArchivePatients,
    bulkUnarchivePatients
}
