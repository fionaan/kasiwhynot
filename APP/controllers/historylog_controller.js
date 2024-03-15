const historyLog = require('../models/historylog_model')
const { BaseModel } = require('../models/patient_model')
const user = require('../models/user_model')
const { historyTypeList,
    recordClassList,
    isObjIdValid,
    checkIfNull2,
    checkObjNull,
    toProperCase } = require('../../utils')


const getAllLogs = async(req, res, next)=>{
    try{
        
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
                    from: 'basepatients',
                    localField: 'patientName',
                    foreignField: '_id',
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
                                        $ne: [ {$type: '$users.fullName.middleName'}, 'missing']
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    { $ne: ['$users.fullName.middleName', null] },
                                                    { $ne: ['$users.fullName.middleName', ''] },
                                                    { $ne: ['$users.fullName.middleName', 'null'] },
                                                    { $ne: [{ $trim: { input: '$users.fullName.middleName' }}, ''] },
                                                    { $ne: [{ $trim: { input: '$users.fullName.middleName' }}, 'null'] }
                                                ]
                                            }, 
                                            then: {
                                                $concat: [
                                                    ' ',
                                                    { $substr: ['$users.fullName.middleName', 0, 1]},
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
                                        $ne: [{type: '$patients.basicInfo.fullName.middleName'}, 'missing']
                                    },
                                    then: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    { $ne: ['$patients.basicInfo.fullName.middleName', null] },
                                                    { $ne: ['$patients.basicInfo.fullName.middleName', ''] },
                                                    { $ne: ['$patients.basicInfo.fullName.middleName', 'null'] },
                                                    { $ne: [{ $trim: { input: '$patients.basicInfo.fullName.middleName' }}, ''] },
                                                    { $ne: [{ $trim: { input: '$patients.basicInfo.fullName.middleName' }}, 'null'] }
                                                ]
                                            },
                                            then: {
                                                $concat: [
                                                    ' ',
                                                    { $substr: ['$patients.basicInfo.fullName.middleName', 0, 1]},
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

        if(logs.length === 0){
            res.status(404).send({
                successful: false,
                message: "No history logs recorded yet."
            })
        }else{
            res.status(200).send({
                successful: true,
                message: "Retrieved all history logs.",
                count: logs.length,
                data: logs
            })
        }
    }
    catch(err){
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }
}

const addLog = async (req, res, next) => {
    try{

        let {editedBy, historyType, recordClass, patientName} = req.body

        //CHECK FOR NULL OR EMPTY FIELDS
        const nullFields = []
        if (checkObjNull(editedBy)) nullFields.push('edited by')
        if (checkIfNull2(historyType)) nullFields.push('history type')
        if (checkIfNull2(recordClass)) nullFields.push('record class')
        if (checkObjNull(patientName)) nullFields.push('patient name')

        //CHECKS IF USER EXISTS
        if (!isObjIdValid(editedBy)) {
            nullFields.push('edited by')
        }
        else {
            let editor = await user.findOne({_id: editedBy})

            if (editor === null) {
                nullFields.push('`edited by` user not existing')
            }
            else {
                //CHECK IF USER OBJ HAS COMPLETE NAME
                if (checkObjNull(editor.fullName)) {
                    nullFields.push('edited by - full name')
                }
                else {
                    if (checkIfNull2(editor.fullName.firstName)) nullFields.push('edited by - first name')
                    if (!(typeof editor.fullName.middleName === "undefined") && checkIfNull2(editor.fullName.middleName)) nullFields.push('edited by - middle name')
                    if (checkIfNull2(editor.fullName.lastName)) nullFields.push('edited by - last name')
                }
            }
        }

        // CHECKS IF PATIENT EXISTS
        if (!isObjIdValid(patientName)) {
            nullFields.push('patient name')
        }
        else {
            let patient = await BaseModel.findOne({_id: patientName})

            if (patient === null) {
                nullFields.push('patientName/patient not existing')
            }
            else {
                if (checkObjNull(patient.basicInfo.fullName)) {
                    nullFields.push('patientName - full name')
                } 
                else {
                    if (checkIfNull2(patient.basicInfo.fullName.firstName)) nullFields.push('patientName - first name')
                    if (!(typeof patient.basicInfo.fullName.middleName === "undefined") && checkIfNull2(patient.basicInfo.fullName.middleName)) nullFields.push('patientName - middle name')
                    if (checkIfNull2(patient.basicInfo.fullName.lastName)) nullFields.push('patientName - last name')
                }
            }
        }

        if(nullFields.length > 0){
            res.status(404).send({
                successful: false,
                message: `Missing data in the following fields: ${nullFields.join(', ')}`
            })
        } 
        else {

            historyType = historyType.trim().toUpperCase()
            recordClass = recordClass.trim().toProperCase()

            //CHECK FOR FIELDS W INVALID VALUES
            const invalidFields = []

            if (!historyTypeList.includes(historyType)) invalidFields.push('history type')
            if (!recordClassList.includes(recordClass)) invalidFields.push('record class')
            
            if (invalidFields.length > 0){
                res.status(404).send({
                    successful: false,
                    message: `Invalid values detected for the following fields: ${invalidFields.join(', ')}`
                })
            }
            else {
                const log = new historyLog ({
                    dateTime: Date.now(),
                    editedBy: editedBy,
                    historyType: historyType,
                    recordClass: recordClass,
                    patientName: patientName
                })
    
                log.save()
                .then((result)=>{
                    res.status(200).send({
                        successful: true,
                        message: "Successfully added a new history log.",
                        added_log: result
                    })
                })
                .catch((error) => {
                    res.status(500).send({
                        successful: false,
                        message: error.message
                    })
                })
            }
        }
    }
    catch(err){
        res.status(500).send({
            successful: false,
            message: err.message
        })
    }

}

module.exports = {
    getAllLogs,
    addLog
}