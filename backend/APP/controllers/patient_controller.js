const { checkIfNull, checkObjNull, checkArrNull, checkFullArr, q4Values, q6Values, isValidCampus, emailRegex, gender } = require('../../utils')
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
//const xlsx = require('xlsx')


// const addBulk = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: 'No file uploaded' });
//         }

//         const filePath = 'uploads/' + req.file.filename;

//         const excelData = convertExcelToJson({
//             sourceFile: filePath,
//             header: {
//                 rows: 1
//             },
//             columnToKey: {
//                 "*": "{{columnHeader}}"
//             }
//         })

//         console.log('Excel Data:', excelData); // Debug log to check Excel data

//         if (!excelData || typeof excelData !== 'object') {
//             throw new Error('Invalid data format returned from convertExcelToJson')
//         }

//         // Combine all data from different sheets into a single array
//         let combinedData = [];
//         Object.values(excelData).forEach(sheetData => {
//             combinedData = [...combinedData, ...sheetData]
//         })

//         console.log('Combined Data:', combinedData) // Debug log to check combined data

//         // Process and save combinedData
//         // for (const data of combinedData) {
//         //     console.log('Processing Data:', data) // Debug log to check each data entry
//         //     const baseModelInstance = new BaseModel(data);
//         //     await baseModelInstance.validate() // Validate the data
//         //     await baseModelInstance.save() // Save the data // Assuming data matches the Patient schema
//         // }
// //Na  rread yung excel File pero di nag ssave sa database
// //Di ko sure if tama ba na pinaghiwalay ko mga sheets

//         // Delete the temporary file after processing
//         fs.unlink(filePath, (err) => {
//             if (err) {
//                 console.error('Error deleting file:', err);
//             }
//         })

//         res.status(200).json({ success: true, message: 'Data imported successfully' })
//     } catch (error) {
//         console.error('Error:', error)
//         res.status(500).json({ error: 'An error occurred' })
//     }
// }


// const addBulk = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: 'No file uploaded' });
//         }

//         const filePath = 'uploads/' + req.file.filename;

//         const excelData = convertExcelToJson({
//             sourceFile: filePath,
//             header: {
//                 rows: 1
//             },
//             columnToKey: {
//                 '*': '{{columnHeader}}'
//             },
//             sheets: ['medicalRecords']
//         })

//         if (!excelData || typeof excelData !== 'object') {
//             throw new Error('Invalid data format returned from convertExcelToJson');
//         }

//         // Parse and combine excelData
//         let combinedData = [];
//         Object.values(excelData).forEach(sheetData => {
//             combinedData = [...combinedData, ...sheetData];
//         })

//         // Iterate over combinedData
//         for (const row of combinedData) {
//             const baseModelData = {};
//             Object.entries(row).forEach(([header, value]) => {
//                 const keys = header.split('.'); // Split header at each period
//                 let currentObject = baseModelData;
//                 for (let i = 1; i < keys.length - 1; i++) {
//                     const key = keys[i];
//                     if (!currentObject[key]) {
//                         currentObject[key] = {}; // Create nested object if it doesn't exist
//                     }
//                     currentObject = currentObject[key]// Move to the next nested object
//                 }
//                 const lastKey = keys[keys.length - 1]
//                 currentObject[lastKey] = value; // Assign the value to the last nested object
//             })

//             console.log('baseModel:',baseModelData)

//             //Create an instance of BaseModel
//             const baseModelInstance = new BaseModel(baseModelData);

//             // Validate the instance against the schema
//             // const validationError = baseModelInstance.validate();
//             // if (validationError) {
//             //     await baseModelInstance.save();
//             //     // Handle validation error, e.g., skip saving or log the error
//             // } else {
//             //     // Save the validated instance
//             //     await baseModelInstance.save();
//             // }

//             await baseModelInstance.save()


//         }


//         // Delete the temporary file after processing
//         fs.unlink(filePath, (err) => {
//             if (err) {
//                 console.error('Error deleting file:', err)
//             }
//         })

//         res.status(200).json({ success: true, message: 'Data imported successfully' })
//     } catch (error) {
//         console.error('Error:', error)
//         res.status(500).json({ error: 'An error occurred' })
//     }
// }




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

const addRecord = async (req, res) => {
    try {
        const { basicInfo, laboratory, vaccination, medicalHistory, dentalRecord, exclusiveData, category, editedBy } = req.body

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

        //add log -> add record

        let log_id = category === 'students' ? exclusiveData.studentNo : exclusiveData.employeeNo

        //ADD LOG FOR CREATION OF PATIENT RECORD
        addLogPromise(editedBy, "ADD", "Medical", log_id)
            .then(async ({ status_log, successful_log, message_log }) => {
                if (successful_log === true) {
                    let pass_patient
                    //ADD PATIENT RECORD
                    await basePatient.save()
                        .then(async (savedBasePatient) => {
                            pass_patient = savedBasePatient

                            if (category === 'students') {
                                // If the category is a student, create a new Student document
                                const studentData = { ...exclusiveData, details: savedBasePatient._id }
                                const student = new Student(studentData)
                                return await student.save()
                            }
                            else if (category === 'employees') {
                                // If the category is an employee, create a new Employee document
                                const employeeData = { ...exclusiveData, details: savedBasePatient._id }
                                const employee = new Employee(employeeData)
                                return await employee.save()
                            }
                        })
                        .then(() => {
                            return res.status(200).send({
                                successful_record: true,
                                successful_log: true,
                                message: "Successfully added base record, patient record, & log."
                            })
                        })
                        .catch(async (error) => {
                            if (pass_patient) {
                                try {
                                    const deletedBase = await BaseModel.findByIdAndDelete(pass_patient._id)
                                    message = deletedBase ? 'Base patient was successfully deleted.' : 'Error in deleting base patient.';
                                }
                                catch (err) {
                                    message = err.message
                                }
                                error.message += ` Base Record Deletion status:${message}`
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

                            return res.status(500).send({
                                successful_patient_record: false,
                                isDeletedLog,
                                error_report: error.message
                            })
                        })
                }
                else {
                    let error = new Error(message_log)
                    error.status_log = status_log
                    throw error
                }
            }).catch((error) => {
                const status = error.status_log ? error.status_log : 500

                return res.status(status).send({
                    successful_log: false,
                    message_log: error.message
                })
            })
    }
    catch (error) {
        res.status(500).send({
            successful: false,
            error: error.message
        })
    }
}

const getPatientList = async (req, res, next) => {
    const { category, sort, role } = req.body //user must input in body to select a category
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

        if (role === 'dentist') {
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
        let { patientId, category, dentalRecord, editedBy } = req.body
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
                    if (base.dentalRecord.isFilledOut === true) {
                        return res.status(400).send({
                            successful: false,
                            message: `Base record with id ${base._id} already contains a dental record.`
                        })
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
                        addLogPromise(editedBy, "ADD", "Dental", patientId)
                            .then(async ({ status_log, successful_log, message_log }) => {
                                if (successful_log === true) {
                                    //ADD DENTAL RECORD
                                    await base.save()
                                        .then(() => {
                                            return res.status(200).send({
                                                successful_record: true,
                                                successful_log: true,
                                                message: "Successfully added dental record & log."
                                            })
                                        })
                                        .catch(async (error) => {
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

                                            return res.status(500).send({
                                                successful_dental_record: false,
                                                isDeletedLog,
                                                error_report: error.message
                                            })
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
                                return res.status(status).send({
                                    successful_log: false,
                                    message_log: error.message
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

const updateRecord = async (req, res) => {
    const { patientId, updatedData } = req.body
    let recordType = "Medical"

    try {
        //ADD LOG FOR UPDATING PATIENT RECORD
        addLogPromise(editedBy, "UPDATE", recordType, patientId)
            .then(async ({ status_log, successful_log, message_log }) => {
                if (successful_log === true) {
                    try {

                        // Update the BasePatient document
                        const updatedBasePatient = await BaseModel.findByIdAndUpdate(patientId, updatedData.basicInfo, { new: true });

                        if (!updatedBasePatient) {
                            return res.status(404).json({
                                successful: false,
                                message: 'Base patient not found',
                            })
                        }

                        // Update other related documents based on the category
                        if (updatedBasePatient.category === 'students') {
                            // Find and update the Student document
                            const updatedStudent = await Student.findOneAndUpdate({ details: patientId }, updatedData.exclusiveData, { new: true });

                            if (!updatedStudent) {
                                return res.status(404).json({
                                    successful: false,
                                    message: 'Student not found',
                                })
                            }
                        } else if (updatedBasePatient.category === 'employees') {
                            // Find and update the Employee document
                            const updatedEmployee = await Employee.findOneAndUpdate({ details: patientId }, updatedData.exclusiveData, { new: true });

                            if (!updatedEmployee) {
                                return res.status(404).json({
                                    successful: false,
                                    message: 'Employee not found',
                                })
                            }
                        }

                        return res.status(200).send({
                            successful_record: true,
                            successful_log: true,
                            message: "Successfully updated patient records."
                        })
                    }
                    catch (error) {
                        // UNDO CHANGES MADE IN THE RECORDS


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

                        return res.status(500).send({
                            successful_dental_record: false,
                            isDeletedLog,
                            error_report: error.message
                        })
                    }
                }
                else {
                    let error = new Error(message_log)
                    error.status_log = status_log
                    throw error
                }
            })
            .catch((error) => {
                const status = error.status_log ? error.status_log : 500
                return res.status(status).send({
                    successful_log: false,
                    message_log: error.message
                })
            })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            successful: false,
            message: 'Error updating patient data',
            error: error.message,
        });
    }
};

const archivePatient = async (req, res) => {
    const patientId = req.params.id

    try {
        // Check if the patient is already archived
        const patient = await BaseModel.findById(patientId);

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
        addLogPromise(editedBy, "ARCHIVE", "Medical", patientId)
            .then(async ({ status_log, successful_log, message_log }) => {
                if (successful_log === true) {
                    //ARCHIVE PATIENT RECORD
                    await patient.save()
                        .then(() => {
                            return res.status(200).send({
                                successful_archive: true,
                                successful_log: true,
                                message: "Successfully archived patient record & added log."
                            })
                        })
                        .catch(async (error) => {
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

                            return res.status(500).send({
                                successful_archive: false,
                                isDeletedLog,
                                error_report: error.message
                            })
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
                return res.status(status).send({
                    successful_log: false,
                    message_log: error.message
                })
            })

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
    const patientId = req.params.id

    try {
        // Check if the patient is archived
        const patient = await BaseModel.findById(patientId);

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

        //ADD LOG FOR CREATION OF DENTAL RECORD
        addLogPromise(editedBy, "UNARCHIVE", "Medical", patientId)
            .then(async ({ status_log, successful_log, message_log }) => {
                if (successful_log === true) {
                    //UNARCHIVE PATIENT RECORD
                    await patient.save()
                        .then(() => {
                            return res.status(200).send({
                                successful_unarchive: true,
                                successful_log: true,
                                message: "Successfully unarchived patient record & added log."
                            })
                        })
                        .catch(async (error) => {
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

                            return res.status(500).send({
                                successful_unarchive: false,
                                isDeletedLog,
                                error_report: error.message
                            })
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
                return res.status(status).send({
                    successful_log: false,
                    message_log: error.message
                })
            })

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
    bulkArchivePatients
}
