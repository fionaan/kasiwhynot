const historyLog = require('../models/historylog_model')
const { BaseModel, Student, Employee } = require('../models/patient_model')
const user = require('../models/user_model')
const { historyTypeList,
    recordClassList,
    isObjIdValid,
    checkIfNull,
    checkObjNull,
    toProperCase } = require('../../utils')

const deleteLogs = async (req,res) => {
    await historyLog.deleteMany()
        .then(() => {
            res.status(200).send({
                successful: true,
                message: 'deleted logs'
            })
        })
}

const getAllLogs = async (req, res, next) => {
    try {

        const pageNumber = parseInt(req.params.pageNumber) || 1 // default to 1 if no param is set
        const pageSize = 50 // limits of records to be fetched per page
        const skip = (pageNumber - 1) * pageSize

        // CHECK IF pageNumber IS VALID BASED ON NUMBER OF AVAILABLE RECORDS
        const totalCount = await historyLog.countDocuments()

        if (skip >= totalCount && totalCount !== 0) {
            return res.status(404).send({
                successful: false,
                message: "Invalid page number."
            })
        }

        let logs = await historyLog.aggregate([
            {
                $lookup: {  // join history logs w/ users
                    from: 'users',
                    localField: 'editedBy',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'patientName',
                    foreignField: 'studentNo',
                    as: 'studentPatients'
                }
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'patientName',
                    foreignField: 'employeeNo',
                    as: 'employeePatients'
                }
            },
            {
                $addFields: {
                  combinedPatients: { $concatArrays: ['$studentPatients', '$employeePatients'] }
                }
            },
            {
                $unwind: '$combinedPatients'
            },
            {
                $lookup: {
                  from: 'basepatients', // Collection name for basepatients
                  localField: 'combinedPatients.details', // Assuming 'details' field contains the ID referencing basepatients
                  foreignField: '_id', // Assuming '_id' is the field in basepatients collection
                  as: 'patients'
                }
            },
            {
                $unwind: '$users'
            },
            {
                $unwind: '$patients'
            },
            {
                $project: {  // 1 is to include the field ; 0 to exclude 
                    dateTime: {  // converts UTC dateTime value to YYYY-mm-dd HH:MM local timezone
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: { $toDate: "$dateTime" },
                            timezone: "Asia/Manila"
                        }
                    },
                    editedBy: {
                        $concat: [
                            '$users.fullName.lastName',
                            ', ',
                            '$users.fullName.firstName',
                            {
                                $cond: { // middle name rules
                                    if: {
                                        $ne: [{ $type: '$users.fullName.middleName' }, 'missing']
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    { $ne: ['$users.fullName.middleName', null] },
                                                    { $ne: ['$users.fullName.middleName', ''] },
                                                    { $ne: ['$users.fullName.middleName', 'null'] },
                                                    { $ne: [{ $trim: { input: '$users.fullName.middleName' } }, ''] },
                                                    { $ne: [{ $trim: { input: '$users.fullName.middleName' } }, 'null'] }
                                                ]
                                            },
                                            then: {
                                                $concat: [
                                                    ' ',
                                                    { $substr: ['$users.fullName.middleName', 0, 1] },
                                                    '.'
                                                ]
                                            },
                                            else: ''
                                        }
                                    },
                                    else: ''
                                }
                            }
                        ]
                    },
                    historyType: 1,
                    recordClass: 1,
                    patientName: {
                        $concat: [
                            '$patients.basicInfo.fullName.lastName',
                            ', ',
                            '$patients.basicInfo.fullName.firstName',
                            {
                                $cond: {    // middle name rules
                                    if: {
                                        $ne: [{ type: '$patients.basicInfo.fullName.middleName' }, 'missing']
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    { $ne: ['$patients.basicInfo.fullName.middleName', null] },
                                                    { $ne: ['$patients.basicInfo.fullName.middleName', ''] },
                                                    { $ne: ['$patients.basicInfo.fullName.middleName', 'null'] },
                                                    { $ne: [{ $trim: { input: '$patients.basicInfo.fullName.middleName' } }, ''] },
                                                    { $ne: [{ $trim: { input: '$patients.basicInfo.fullName.middleName' } }, 'null'] }
                                                ]
                                            },
                                            then: {
                                                $concat: [
                                                    ' ',
                                                    { $substr: ['$patients.basicInfo.fullName.middleName', 0, 1] },
                                                    '.'
                                                ]
                                            },
                                            else: ''
                                        }
                                    },
                                    else: ''
                                }
                            }
                        ]
                    }
                }
            },
            {
                $sort: {  // -1 for newest to oldest based on dateTime field
                    'dateTime': -1
                }
            },
            {
                $skip: skip // for pagination
            },
            {
                $limit: pageSize // for pagination
            },
        ])

        if (logs.length === 0) {
            res.status(404).send({
                successful: false,
                message: "No history logs recorded yet."
            })
        } else {
            res.status(200).send({
                successful: true,
                message: "Retrieved all history logs.",
                count: logs.length,
                data: logs
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

const addLog = async (editedBy, historyType, recordClass, patientName, callback) => {
    try{

        //CHECK FOR NULL OR EMPTY FIELDS
        const nullFields = []
        if (checkIfNull(editedBy)) nullFields.push('edited by')
        if (checkIfNull(historyType)) nullFields.push('history type')
        if (checkIfNull(recordClass)) nullFields.push('record class')
        if (checkIfNull(patientName)) nullFields.push('patient name')

        //CHECKS IF USER EXISTS
        if (!isObjIdValid(editedBy)) {
            nullFields.push('edited by')
        }
        else {
            let editor = await user.findOne({ _id: editedBy })

            if (editor === null) {
                nullFields.push('`edited by` user not existing')
            }
            else {
                //CHECK IF USER OBJ HAS COMPLETE NAME
                if (checkObjNull(editor.fullName)) {
                    nullFields.push('edited by - full name')
                }
                else {
                    if (checkIfNull(editor.fullName.firstName)) nullFields.push('edited by - first name')
                    if (!(typeof editor.fullName.middleName === "undefined") && checkIfNull(editor.fullName.middleName)) nullFields.push('edited by - middle name')
                    if (checkIfNull(editor.fullName.lastName)) nullFields.push('edited by - last name')
                }
            }
        }

        if(nullFields.length > 0){
            callback(404, false, `Missing data in the following fields: ${nullFields.join(', ')}`)
            // res.status(404).send({
            //     successful: false,
            //     message: `Missing data in the following fields: ${nullFields.join(', ')}`
            // })
        } 
        else {
            historyType = historyType.trim().toUpperCase()
            recordClass = recordClass.trim().toProperCase()

            //CHECK FOR FIELDS W INVALID VALUES
            const invalidFields = []

            if (!historyTypeList.includes(historyType)) invalidFields.push('history type')
            if (!recordClassList.includes(recordClass)) invalidFields.push('record class')
            
            if (invalidFields.length > 0){
                callback(404, false, `Invalid values detected for the following fields: ${invalidFields.join(', ')}`)
                //return {404, false, `Invalid values detected for the following fields: ${invalidFields.join(', ')}`}
                // res.status(404).send({
                //     successful: false,
                //     message: `Invalid values detected for the following fields: ${invalidFields.join(', ')}`
                // })
            }
            else {
                const log = new historyLog({
                    dateTime: Date.now(),
                    editedBy: editedBy,
                    historyType: historyType,
                    recordClass: recordClass,
                    patientName: patientName
                })

                log.save()
                .then((result)=>{
                    callback(200, true, result)
                    // res.status(200).send({
                    //     successful: true,
                    //     message: "Successfully added a new history log.",
                    //     added_log: result
                    // })
                })
                .catch((error) => {
                    callback(500, false, error.message)
                    // res.status(500).send({
                    //     successful: false,
                    //     message: error.message
                    // })
                })
            }
        }
    }
    catch(err){
        callback(500, false, err.message)
        // res.status(500).send({
        //     successful: false,
        //     message: err.message
        // })
    }

}

module.exports = {
    getAllLogs,
    addLog,
    deleteLogs
}