const { checkIfNull, checkObjNull, checkArrNull, checkFullArr, q4Values, q6Values, isValidCampus, emailRegex, gender, toProperCase } = require('../../utils')
const { BaseModel, Student, Employee } = require('../models/patient_model')
const HistoryLog = require('../models/historylog_model')
const { addLog } = require('./historylog_controller')
const mongoose = require('mongoose')
const convertExcelToJson = require('convert-excel-to-json')
const fs = require('fs-extra')


// ALL DELETE FUNCTIONS ARE FOR TESTING PURPOSES ONLY
const deleteStudents = async (req, res) => {
    await Student.deleteMany()
        .then(() => {
            res.status(200).send({
                successful: true,
                message: 'deleted students'
            })
        })
}

const deleteEmployees = async (req, res) => {
    await Employee.deleteMany()
        .then(() => {
            res.status(200).send({
                successful: true,
                message: 'deleted employees'
            })
        })
}

const deleteBase = async (req, res) => {
    await BaseModel.deleteMany()
        .then(() => {
            res.status(200).send({
                successful: true,
                message: 'deleted base patients'
            })
        })
}

const addLogPromise = (editedBy, type, record, id) => {
    return new Promise((resolve, reject) => {
        addLog(editedBy, type, record, id, (status_log, successful_log, message_log) => {
            resolve({ status_log, successful_log, message_log })
        })
    })
}

const addBulk = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
    }

    const filePath = `uploads/${req.file.filename}`

    try {
        const excelData = convertExcelToJson({
            sourceFile: filePath,
            header: { rows: 1 },
            columnToKey: { '*': '{{columnHeader}}' },
            sheets: ['medicalRecords', 'student'] // Add the new sheet name here
        })

        if (!excelData || typeof excelData !== 'object') {
            throw new Error('Invalid data format returned from convertExcelToJson');
        }

        let savedBaseModelId
        // Process medical records
        for (const row of excelData.medicalRecords) {
            const instance = new BaseModel(row);
            await instance.save();

            savedBaseModelId = instance._id
        }

        for (const row of excelData.student) {


            // Assign BaseModel _id to student details field
            const studentInstance = new Student({ ...row, details: savedBaseModelId });
            await studentInstance.save()
        }

        await fs.unlink(filePath) // Clean up the file after processing
        res.json({
            successful: true,
            message: 'Bulk data added successfully',
        });
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({
            successful: false,
            message: 'Error adding bulk data',
            error: error.message,
        })
        try {
            await fs.unlink(filePath); // Attempt to clean up the file in case of errors
        } catch (cleanupError) {
            console.error('Error deleting file:', cleanupError)
        }
    }
}

const revertDelete = (deleteDoc, models, name) => {

}

const revertUpdate = (deleteDoc, models, name) => {

}

// ['', () => add extra task] --> for docs requiring extra work
// [base, null] --> for docs requiring no additional work  

//documents -> array of docs to save?
//expected -> array of expected arrays to save in string format
const saveAndLog = async (editedBy, type, record, documents, expected, models, successMessage, undoExcess) => {
    try {
        let results = [], response, log_id

        if (documents.length > 1 && !undoExcess) {
            throw Error('No DELETE operation is specified as argument.')
            // return res.status(500).json({
            //     successful: false,
            //     message: "No DELETE operation is specified as argument."
            // })
        }

        await documents.every(async ([doc, task], index) => {

            // Ensures that Base record is the first document to be saved
            if (index === 0 && !(doc instanceof BaseModel)) {
                throw Error('Base Record must be listed first in the array.')
            }

            // Extra task done first before saving the document
            if (task) {
                doc = await task(log_id)
            }

            return await doc.save() //-- Test if kaya ng return without ending all process 
                .then(async (savedDoc) => {

                    // Use Base record ID in adding log
                    if (savedDoc instanceof BaseModel) log_id = savedDoc._id
                    if (documents.length > 1) {
                        results.push(savedDoc)
                    } else {
                        // insert operation if only single record needs to be added
                    }
                    if (index === documents.length - 1) {

                        // Validates if no base patient was saved -- REMOVE
                        if (!log_id) throw Error('Patient ID is required.')

                        // Add log after successful addition of all required documents
                        const { status_log, successful_log, message_log } = await addLogPromise(editedBy, type, record, log_id)
                        if (successful_log === false) throw Error(message_log)

                        response = {
                            status: 200,
                            successful: true,
                            message: successMessage
                        }
                        return false
                    }
                })
                .catch((error) => {
                    // let cause = results.length === 0 ? expected[0] : expected[results.length - 1]
                    if (results.length >= 1) {
                        // revert all data in results array 
                        results.forEach(async (deleteDoc, index) => {
                            error.message += await undoExcess(deleteDoc, models[index], expected[index])
                        })
                    }

                    response = error
                    return false
                })
        })

        //holds the response
        return response
    } catch(error) {
        response = error
        return response
    }
    //should i put the return response here instead? lol
}

const addHistoryLog = async (editedBy, type, record, id, saveDocument, successMessage, saveHandler, undoExcess) => {

    const data = await addLogPromise(editedBy, type, record, id)
        .then(async ({ status_log, successful_log, message_log }) => {
            if (successful_log === true) {
                let pass_data
                return await saveDocument.save()
                    .then((result) => {
                        if (saveHandler !== null) {
                            pass_data = result
                            const newDocument = saveHandler(result)
                            return newDocument.save()
                        }
                    })
                    .then((result) => {
                        let handle = {
                            status: 200,
                            successful_action: true,
                            message: successMessage,
                            // log_id: message_log._id,
                            // base_id: pass_data._id,
                        }

                        // if (result) handle.record_id = result._id 
                        return handle
                    })
                    .catch(async (error) => {
                        if (pass_data) {
                            error.message += undoExcess !== null ? undoExcess(pass_data._id) : 'No DELETE operation is specified as argument.'
                        }
                        let isDeletedLog = false
                        error.message += 'Log Deletion status:'

                        try {
                            deleteLog = message_log._id
                            const deleted_log = await HistoryLog.findByIdAndDelete({ _id: deleteLog })
                            if (deleted_log) isDeletedLog = true
                            error.message += isDeletedLog ? ' Successfully deleted the log.' : '  Error deleting log.'
                        }
                        catch (err) {
                            error.message += err.message
                        }

                        return {
                            status: 500,
                            successful_action: false,
                            isDeletedLog,
                            error_report: error.message
                        }
                    })
            }
            else {
                let error = new Error(message_log)
                error.status_log = status_log
                throw error
            }
        })
        .catch((error) => {
            const status = error.status_log ? error.status_log : 500
            return {
                status: status,
                successful: false,
                message: error.message
            }
        })
    return data
}

const addRecord = async (req, res) => {
    try {
        const { basicInfo, laboratory, vaccination, medicalHistory, dentalRecord, exclusiveData, category, editedBy } = req.body
        let model, studEmp

        // Create a new BasePatient document
        const basePatient = new BaseModel({
            basicInfo,
            laboratory,
            vaccination,
            medicalHistory,
            dentalRecord,
        })

        const nullFields = []

        if (checkObjNull(basicInfo)) {
            nullFields.push('basicInfo')
        } else {

            if (checkIfNull(basicInfo.campus)) {
                nullFields.push('basicInfo.campus')
            } else if (!isValidCampus.includes(basicInfo.campus)) {
                nullFields.push('Invalid Campus')
            }

            if (checkIfNull(basicInfo.fullName.firstName)) nullFields.push('basicInfo.fullName.firstName')

            if (checkIfNull(basicInfo.fullName.lastName)) nullFields.push('basicInfo.fullName.lastName')
            if (!basicInfo.emailAddress) {
                nullFields.push('basicInfo.emailAddress')
            } else if (!emailRegex.test(basicInfo.emailAddress)) {
                nullFields.push('Invalid Email Address')
            }
            if (checkIfNull(basicInfo.dateOfBirth)) nullFields.push('basicInfo.dateOfBirth')
            if (checkIfNull(basicInfo.age)) nullFields.push('basicInfo.age')

            if (checkIfNull(basicInfo.gender)) {
                nullFields.push('basicInfo.gender')
            } else if (!gender.includes(basicInfo.gender)) {
                nullFields.push('Invalid gender input')
            }

        }

        if (nullFields.length > 0) {
            const errorResponse = {
                successful: false,
                message: `Empty or missing fields: ${nullFields.join(', ')}`,
            }
            return res.status(400).send(errorResponse)
        }

        let patient_id = category === 'students' ? exclusiveData.studentNo : exclusiveData.employeeNo
        let success_message = "Successfully added base record, patient record, & log."

        if (category === 'students') {
            model = Student
        }
        else if (category === 'employees') {
            model = Employee
        }

        const studEmpData = { ...exclusiveData, details: savedBase._id }
        if (category === 'students') {
            // If the category is a student, create a new Student document

            studEmp = new Student(studentData)
        }
        else if (category === 'employees') {
            // If the category is an employee, create a new Employee document
            const employeeData = { ...exclusiveData, details: savedBase._id }
            studEmp = new Employee(employeeData)
        }

        console.log(studEmp)
        // ADD -> ADD -> LOG
        const response = await saveAndLog(editedBy, "ADD", "Medical", [basePatient, studEmp], [`Base record, ${category} record`.format(toProperCase(category).replace(/s$/, ''))], [], undoExcess, successMessage)

        //ADD LOG FOR CREATION OF PATIENT RECORD
        // const response = await addHistoryLog(editedBy, "ADD", "Medical", patient_id, basePatient, success_message, ((savedBase) => {

        //     if (category === 'students') {
        //         // If the category is a student, create a new Student document
        //         const studentData = { ...exclusiveData, details: savedBase._id }
        //         const student = new Student(studentData)
        //         return student
        //     }
        //     else if (category === 'employees') {
        //         // If the category is an employee, create a new Employee document
        //         const employeeData = { ...exclusiveData, details: savedBase._id }
        //         const employee = new Employee(employeeData)
        //         return employee
        //     }
        // }),
        //     (async (base_id) => {
        //         try {
        //             const deletedBase = await BaseModel.findByIdAndDelete(base_id)
        //             message = deletedBase ? 'Base patient was successfully deleted.' : 'Error in deleting base patient.';
        //         }
        //         catch (err) {
        //             message = err.message
        //         }
        //         return ` Base Record Deletion status:${message}`
        //     }))

        // // Send overall response
        // res.status(response.status).json(response)

    }
    catch (error) {
        res.status(500).send({
            successful: false,
            error: error.message
        })
    }
}

const getPatientList = async (req, res, next) => {
    const { category, sort, operation } = req.body //user must input in body to select a category
    const pageNumber = parseInt(req.params.pageNumber) || 1 //if page not specified in params, default to 1
    const pageSize = 50 //limit of records to be fetched
    const skip = (pageNumber - 1) * pageSize //number of pages to be skipped based on page number

    try {
        let patientModel

        if (category == 'students') {
            patientModel = Student
        }
        else if (category == 'employees') {
            patientModel = Employee
        }
        else {
            return res.status(400).send({
                successful: false,
                message: "The category input in the body is not recognized."
            });
        }

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

        if (operation === 'dental') {
            pipeline.splice(2, 0, {
                $match: {
                    'patientDetails.dentalRecord.isFilledOut': false
                }
            })
        }

        let patient = await patientModel.aggregate(pipeline)

        //check if null
        if (checkObjNull(patient)) {
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
    catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }
}

const getPatient = async (req, res, next) => {
    const { patientId, tab, category } = req.body //user must input the _id of the patient
    const fieldName = tab
    let projection = {} //for the project aggregation because project can't use dynamic variables, so we'll use an object
    projection[fieldName] = `$patientDetails.${fieldName}` //creating properties for projection object which contains the fields of the user's selected tab

    try {
        let patientModel

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
            return res.status(400).send({
                successful: false,
                message: "The category input in the body is not recognized."
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
        if (checkObjNull(patient)) {
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

    catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }
}

const searchPatientList = async (req, res, next) => {
    const { category, sort, search } = req.body //user must input in body to select a category
    const pageNumber = parseInt(req.params.pageNumber) || 1 //if page not specified in params, default to 1
    const pageSize = 50 //limit of records to be fetched
    const skip = (pageNumber - 1) * pageSize //number of pages to be skipped based on page number

    try {
        let matchCondition = {} // what the condition for the search would be
        let noHyphen = search.replace(/-/g, '') //remove the hyphen from the id in case there is

        if (checkIfNull(search)) { //check if search field is empty
            return res.status(400).send({
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

        let patientModel
        if (category == 'students') {
            patientModel = Student
        }
        else if (category == 'employees') {
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
        if (checkObjNull(patient)) {
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

    catch (err) {
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }
}

const addDentalRecord = async (req, res, next) => {
    try {
        let { operation, category, patientId, editedBy, dentalRecord } = req.body
        category = category.trim().toLowerCase()
        let message, surgeries

        const odontogramKeys = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65, 18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38, 85, 84, 83, 82, 81, 71, 72, 73, 74, 75]
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
            if (category === "students") {
                patientModel = Student
            }
            else {
                patientModel = Employee
            }

            let patient = await patientModel.findOne({ _id: patientId })
            if (patient === null) {
                res.status(404).send({
                    successful: false,
                    message: `Patient record with id ${patientId} does not exist.`
                })
            }
            else {
                let base = await BaseModel.findOne({ _id: patient.details })

                if (base === null) {
                    res.status(404).send({
                        successful: false,
                        message: `Base record with id ${patient.details} does not exist.`
                    })
                }
                else {
                    // // CHECK IF THE PATIENT RECORD ALREADY CONTAINS DENTAL RECORD
                    if (operation.toLowerCase() === 'add') {
                        if (base.dentalRecord.isFilledOut === true) {
                            return res.status(400).send({
                                successful: false,
                                message: `Base record with id ${base._id} already contains a dental record.`
                            })
                        }
                    }

                    // CHECK FOR NULL DENTAL FIELDS  
                    nullFields = []
                    message = (checkFullArr(dentalRecord.q1, 'q1', null))
                    if (message !== null) nullFields.push(message)

                    if (checkIfNull(dentalRecord.q2)) nullFields.push('q2')

                    if (checkObjNull(dentalRecord.q3)) {
                        nullFields.push('q3')

                    }
                    else {
                        if (checkIfNull(dentalRecord.q3.hasDentures)) {
                            nullFields.push('q3: Has Dentures')
                        }
                        else {
                            if (dentalRecord.q3.hasDentures === true && checkIfNull(dentalRecord.q3.dentureType)) nullFields.push('q3: Denture Type')
                        }
                    }

                    if (checkIfNull(dentalRecord.q4)) nullFields.push('q4')

                    if (checkObjNull(dentalRecord.q5)) {
                        nullFields.push('q5')
                    }
                    else {
                        if (checkIfNull(dentalRecord.q5.hasDentalProcedure)) {
                            nullFields.push('q5: Has Dental Procedure')
                        }
                        else {
                            message = checkFullArr(dentalRecord.q5.pastDentalSurgery, 'q5: Past Dental Surgery', (arr) => {
                                let list = []
                                arr.forEach((element, index) => {
                                    if (checkIfNull(element.name)) list.push(`q5: Past Dental Surgery: name - Index no. ${index}`)
                                    if (checkIfNull(element.date)) list.push(`q5: Past Dental Surgery: date - Index no. ${index}`)
                                })
                                return list
                            })
                            if (message !== null) Array.isArray(message) ? nullFields = nullFields.concat(message) : nullFields.push(message)
                        }
                    }

                    if (checkObjNull(dentalRecord.q6)) {
                        nullFields.push('q6')
                    }
                    else {
                        odontogramKeys.forEach((key) => {
                            if (!dentalRecord.q6.hasOwnProperty(key.toString())) missingKeys.push(key)
                        })

                        if (missingKeys.length > 0) nullFields.push(`q6: keys: [${missingKeys.join(', ')}]`)
                    }

                    if (checkObjNull(dentalRecord.q7)) {
                        nullFields.push('q7')
                    }
                    else {
                        if (checkIfNull(dentalRecord.q7.presenceOfDebris)) nullFields.push('q7: Presence Of Debris')
                        if (checkIfNull(dentalRecord.q7.presenceOfToothStain)) nullFields.push('q7: Presence Of Tooth Stain')
                        if (checkIfNull(dentalRecord.q7.presenceOfGingivitis)) nullFields.push('q7: Presence Of Gingivitis')
                        if (checkIfNull(dentalRecord.q7.presenceOfPeriodontalPocket)) nullFields.push('q7: Presence Of Periodontal Pocket')
                        if (checkIfNull(dentalRecord.q7.presenceOfOralBiofilm)) nullFields.push('q7: Presence Of Oral Biofilm')

                        if (checkObjNull(dentalRecord.q7.underOrthodonticTreatment)) {
                            nullFields.push('q7: Under Orthodontic Treatment')
                        }
                        else {
                            if (checkIfNull(dentalRecord.q7.underOrthodonticTreatment.hasTreatment)) {
                                nullFields.push('q7: Under Orthodontic Treatment: Has Treatment')
                            }
                            else {
                                if (dentalRecord.q7.underOrthodonticTreatment.hasTreatment === true) {
                                    if (checkIfNull(dentalRecord.q7.underOrthodonticTreatment.yearStarted)) nullFields.push('q7: Under Orthodontic Treatment: yearStarted')
                                    if (checkIfNull(dentalRecord.q7.underOrthodonticTreatment.lastAdjustment)) nullFields.push('q7: Under Orthodontic Treatment: lastAdjustment')
                                }
                            }
                        }
                    }

                    if (checkObjNull(dentalRecord.q8)) {
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
                                if (checkIfNull(dentalRecord.q8[key].temporary)) missingKeys.push(`q8: ${key}: temporary`)
                                if (checkIfNull(dentalRecord.q8[key].permanent)) missingKeys.push(`q8: ${key}: permanent`)
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
                        if (checkIfNull(dentalRecord.q9.hasDentofacialAb)) {
                            nullFields.push('q9: Has Dentofacial Abnormality')
                        }
                        else {
                            //if (dentalRecord.q9.hasDentofacialAb === true && checkArrNull(dentalRecord.q9.name)) nullFields.push('q9: name')
                            message = checkFullArr(dentalRecord.q9.name, 'q9: name', null)
                            if (message !== null) nullFields.push(message)
                        }
                    }

                    if (checkObjNull(dentalRecord.q10)) {
                        nullFields.push('q10')
                    }
                    else {
                        if (checkIfNull(dentalRecord.q10.needUpperDenture)) nullFields.push('q10: Need Upper Denture')
                        if (checkIfNull(dentalRecord.q10.needLowerDenture)) nullFields.push('q10: Need Lower Denture')
                    }

                    // ENSURES THAT THE FF FIELDS ARE PRESENT   
                    if (!dentalRecord.hasOwnProperty('notes')) nullFields.push('notes')
                    if (!dentalRecord.hasOwnProperty('attachments')) {
                        nullFields.push('attachments')
                    }
                    else {
                        message = checkFullArr(dentalRecord.attachments, 'attachments', ((arr) => {
                            let list = []
                            arr.forEach((attachments, index) => {
                                if (typeof attachments.filename === "undefined") list.push(`attachment no. ${index}: filename`)
                                if (typeof attachments.urlLink === "undefined") list.push(`attachment no. ${index}: urlLink`)
                            })
                            return list
                        }))
                        if (message !== null) Array.isArray(message) ? nullFields = nullFields.concat(message) : nullFields.push(message)
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
                        invalidFields = []
                        if (dentalRecord.q2 > Date.now()) invalidFields.push('q2 date is later than current date')
                        if (!q4Values.includes(dentalRecord.q4)) invalidFields.push('q4 invalid value')
                        if (dentalRecord.q5.hasDentalProcedure === true) {
                            surgeries = dentalRecord.q5.pastDentalSurgery
                            surgeries.forEach((surgery, index) => {
                                if (surgery.date > Date.now()) invalidFields.push(`q5: Past Dental Surgery no. ${index}: provided date is later than current date`)
                            })
                        }
                        for (let key in dentalRecord.q6) {
                            if (Array.isArray(dentalRecord.q6[key])) {
                                dentalRecord.q6[key].forEach((element) => {
                                    if (!q6Values.includes(element)) invalidFields.push(`q6: #${key}: ${element} is invalid value`)
                                })
                            }
                            else {
                                invalidFields.push(`q6 #${key} is not an array`)
                            }
                        }
                        if (dentalRecord.q7.underOrthodonticTreatment.hasTreatment === true) {
                            if (dentalRecord.q7.underOrthodonticTreatment.yearStarted > new Date().getFullYear()) invalidFields.push('q7: Under Orthodontic Treatment: yearStarted is later than current year')
                            if (dentalRecord.q7.underOrthodonticTreatment.lastAdjustment > Date.now()) invalidFields.push('q7: Under Orthodontic Treatment: lastAdjustment is later than current date')
                        }
                        for (let key in dentalRecord.q8) {
                            if (dentalRecord.q8[key].temporary < 0 || dentalRecord.q8[key].temporary > 50) invalidFields.push(`q8: ${key}: invalid number for temporary`)
                            if (dentalRecord.q8[key].permanent < 0 || dentalRecord.q8[key].permanent > 50) invalidFields.push(`q8: ${key}: invalid number for permanent`)
                        }
                        if (dentalRecord.q10.needUpperDenture < 0 || dentalRecord.q10.needUpperDenture > 3) invalidFields.push('q10: Need Upper Denture invalid number')
                        if (dentalRecord.q10.needLowerDenture < 0 || dentalRecord.q10.needLowerDenture > 3) invalidFields.push('q10: Need Lower Denture invalid number')

                        dentalRecord.isFilledOut = true
                        base.dentalRecord = dentalRecord

                        //ADD LOG FOR CREATION OF DENTAL RECORD
                        let patient_id = category === 'students' ? patient.studentNo : patient.employeeNo
                        let successMessage = "Successfully added dental record & log."
                        const response = await addHistoryLog(editedBy, "ADD", "Dental", patient_id, base, successMessage, null, null)

                        // Send overall response
                        res.status(response.status).json(response)
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

const updateRecord = async (req, res, next) => {
    try {
        const { role, patientId, category, editedBy, updatedData } = req.body
        let response
        let nullFields = []

        if (!role || (role !== 'doctor' && role !== 'nurse' && role !== 'dentist' && role !== 'admin')) {
            return res.status(404).json({
                successful: false,
                message: 'The role input is not recognized.',
            })
        }

        let model
        if (category === 'students') {
            model = Student
        } else if (category === 'employees') {
            model = Employee
        } else {
            return res.status(400).send({
                successful: false,
                message: "The category input in the body is not recognized."
            })
        }

        const record = await model.findById(patientId)

        if (!record) {
            return res.status(404).json({
                successful: false,
                message: 'Patient not found',
            });
        }
        const patient = await BaseModel.findById(record.details);

        if (!patient) {
            return res.status(404).json({
                successful: false,
                message: 'Patient not found',
            });
        }
        // original -> successful
        console.log(patient)
        const patient_id = category === 'students' ? record.studentNo : record.employeeNo

        // Check which record can be updated based on current user's role
        if (role === 'doctor' || role === 'nurse' || role === 'admin') {

            const original_base = patient

            if (checkObjNull(updatedData.basicInfo)) nullFields.push('Basic Info')
            if (checkObjNull(updatedData.laboratory)) nullFields.push('Laboratory')
            if (checkObjNull(updatedData.vaccination)) nullFields.push('Vaccination')
            if (checkObjNull(updatedData.medicalHistory)) nullFields.push('Medical History')
            if (category === 'students') {
                // Student null validation
                //if (checkIfNull(updatedData.studentNo)) nullFields.push('Student number')
                if (checkIfNull(updatedData.course)) nullFields.push('Course')
                if (checkIfNull(updatedData.year)) nullFields.push('Year')
                if (checkIfNull(updatedData.section)) nullFields.push('Section')
            } else {
                // Employee null validation
                if (checkIfNull(updatedData.employeeNo)) nullFields.push('Employee number')
                if (checkIfNull(updatedData.department)) nullFields.push('Department')
            }


            if (nullFields.length > 0) {
                return res.status(404).json({
                    successful: false,
                    message: `Missing values on the following fields: ${nullFields.join(', ')}`,
                });
            }
            patient.basicInfo = updatedData.basicInfo
            patient.laboratory = updatedData.laboratory
            patient.vaccination = updatedData.vaccination
            patient.medicalHistory = updatedData.medicalHistory

            //ADD LOG FOR UPDATING PATIENT MEDICAL RECORD
            let successMessage = "Successfully updated patient medical record and added log."
            response = await addHistoryLog(editedBy, 'UPDATE', 'Medical', patient_id, patient, successMessage,
                (base_id) => {
                    if (category === 'students') {
                        //record.studentNo
                        record.course = updatedData.course
                        record.year = updatedData.year
                        record.section = updatedData.section
                    } else {
                        record.employeeNo = updatedData.employeeNo
                        record.department = updatedData.department
                    }
                    return record
                },
                async (base_id) => {
                    try {
                        let baseToRevert = await BaseModel.findById(base_id)
                        baseToRevert = original_base
                        baseToRevert = await baseToRevert.save()
                        // console.log(original_base)  ->  for checking
                        // console.log(baseToRevert)  -> check why di nagana
                        message = baseToRevert ? 'Base patient change/s were successfully reverted.' : 'Error in reverting base patient record.';
                    }
                    catch (err) {
                        message = err.message
                    }
                    return ` Base Record Revert Changes status:${message}`
                })

        } else if (role === 'dentist' || role === 'admin') {

            if (checkObjNull(updatedData.dentalRecord)) {
                return res.status(404).json({
                    successful: false,
                    message: `Missing dental record.`,
                });
            }

            patient.dentalRecord = updatedData.dentalRecord

            //ADD LOG FOR UPDATING PATIENT DENTAL RECORD
            let successMessage = "Successfully updated patient dental record and added log."
            response = await addHistoryLog(editedBy, 'UPDATE', 'Dental', patient_id, patient, successMessage, null, null)

        }

        res.status(response.status).json(response)

    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            successful: false,
            message: 'Error updating patient data',
            error: error.message,
        });
    }
};

const archivePatient = async (req, res) => {
    try {
        const { category, patientId, editedBy } = req.body;
        let model
        // Check if the patient is already archived
        if (category === 'students') {
            model = Student
        } else if (category === 'employees') {
            model = Employee
        } else {
            return res.status(400).send({
                successful: false,
                message: "The category input in the body is not recognized."
            })
        }

        const record = await model.findById(patientId)

        if (!record) {
            return res.status(404).json({
                successful: false,
                message: 'Patient not found',
            });
        }
        const patient = await BaseModel.findById(record.details);

        if (!patient) {
            return res.status(404).json({
                successful: false,
                message: 'Patient not found',
            });
        }

        if (patient.archived) {
            return res.status(400).json({
                successful: false,
                message: 'Patient is already archived',
            })
        }

        // Archive the patient
        patient.archived = true
        patient.archivedDate = new Date()

        //ADD LOG FOR ARCHIVING PATIENT RECORD
        let patient_id = category === 'students' ? record.studentNo : record.employeeNo
        let successMessage = "Successfully archived patient record & added log."
        const response = await addHistoryLog(editedBy, "ARCHIVE", "All", patient_id, patient, successMessage, null, null)

        // Send overall response
        res.status(response.status).json(response)

    } catch (error) {
        console.error(error);
        res.status(500).json({
            successful: false,
            message: 'Error archiving patient',
            error: error.message,
        });
    }
}

const unarchivePatient = async (req, res) => {
    try {
        const { category, patientId, editedBy } = req.body;
        let model
        // Check if the patient is already archived
        if (category === 'students') {
            model = Student
        } else if (category === 'employees') {
            model = Employee
        } else {
            return res.status(400).send({
                successful: false,
                message: "The category input in the body is not recognized."
            })
        }

        const record = await model.findById(patientId)

        if (!record) {
            return res.status(404).json({
                successful: false,
                message: 'Patient not found',
            });
        }

        const patient = await BaseModel.findById(record.details);

        if (patient === "") {
            return res.status(404).json({
                successful: false,
                message: 'Patient not found',
            });
        }

        if (!patient.archived) {
            return res.status(400).json({
                successful: false,
                message: 'Patient is not archived',
            });
        }

        // Unarchive the patient
        patient.archived = false
        patient.archivedDate = null

        //ADD LOG FOR UNARCHIVING A RECORD
        let patient_id = category === 'students' ? record.studentNo : record.employeeNo
        let successMessage = "Successfully unarchived patient record & added log."
        const response = await addHistoryLog(editedBy, "UNARCHIVE", "All", patient_id, patient, successMessage, null, null)

        // Send overall response
        res.status(response.status).json(response)

    } catch (error) {
        console.error(error);
        res.status(500).json({
            successful: false,
            message: 'Error unarchiving patient',
            error: error.message,
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
            return res.status(400).send({
                successful: false,
                message: "The category input in the body is not recognized."
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
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }
}

const getFilteredResultList = async (req, res, next) => {
    const { filters, category, sort } = req.body
    const pageNumber = parseInt(req.params.pageNumber) || 1 //if page not specified in params, default to 1
    const pageSize = 50 //limit of records to be fetched
    const skip = (pageNumber - 1) * pageSize //number of pages to be skipped based on page number

    try {
        let patientModel
        let matchCondition = {}

        if (category == 'students') {
            patientModel = Student

            if (filters.course) {
                matchCondition['course'] = { $in: filters.course }
            }
            if (filters.year) {
                matchCondition['year'] = { $in: filters.year }
            }
        }
        else if (category == 'employees') {
            patientModel = Employee

            if (filters.department) {
                matchCondition['department'] = { $in: filters.department }
            }
            if (filters.role) {
                matchCondition['role'] = { $in: filters.role }
            }
        }
        else {
            return res.status(400).send({
                successful: false,
                message: "The category input in the body is not recognized."
            })
        }

        if (filters.campus) {
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

        if (checkObjNull(patient)) {
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

    catch (err) {
        res.status(500).send({
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
    addBulk,
    bulkArchivePatients,
    bulkUnarchivePatients
}
