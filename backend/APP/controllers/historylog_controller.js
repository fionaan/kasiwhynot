const historyLog = require('../models/historylog_model')
const utils = require('../../utils')
const { toProperCase } = require('../../utils')
const { BaseModel, Student, Employee } = require('../models/patient_model')
const user = require('../models/user_model')

const deleteLogs = async (req, res) => {
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
        let { filters } = req.body
        const pageNumber = parseInt(req.params.pageNumber) || 1 // default to 1 if no param is set
        const pageSize = 50 // limits of records to be fetched per page
        const skip = (pageNumber - 1) * pageSize
        let matchCondition = {}

        // CHECK IF pageNumber IS VALID BASED ON NUMBER OF AVAILABLE RECORDS
        const totalCount = await historyLog.countDocuments()

        if (skip >= totalCount && totalCount !== 0) { // lagyan ng pagenumber sa condition
            return res.status(404).send({
                successful: false,
                message: "Invalid page number."
            })
        }
        if (filters) {
            if (filters.dateTime) {
                if (!Array.isArray(filters.dateTime)) utils.throwError('Filter dateTime must be an array.', 400)
                matchCondition['dateTime'] = { $in: filters.dateTime }
            }
            if (filters.editedBy) {
                if (!Array.isArray(filters.editedBy)) utils.throwError('Filter editedBy must be an array.', 400)
                matchCondition['users._id'] = { $in: filters.editedBy }
            }
            if (filters.historyType) {
                if (!Array.isArray(filters.historyType)) utils.throwError('Filter historyType must be an array.', 400)
                filters.historyType = filters.historyType.map(type => type.trim().toUpperCase())
                matchCondition['historyType'] = { $in: filters.historyType }
            }
            if (filters.recordClass) {
                if (!Array.isArray(filters.recordClass)) utils.throwError('Filter recordClass must be an array.', 400)
                filters.recordClass = filters.recordClass.map(record => record.trim().toProperCase());
                matchCondition['recordClass'] = { $in: filters.recordClass }
            }
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
                $match: matchCondition
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
    try {

        //CHECK FOR NULL OR EMPTY FIELDS
        const nullFields = []
        // if (utils.checkIfNull(editedBy)) nullFields.push('edited by')
        // if (utils.checkIfNull(historyType)) nullFields.push('history type')
        // if (utils.checkIfNull(recordClass)) nullFields.push('record class')
        // if (utils.checkIfNull(patientName)) nullFields.push('patient name')

        // ADDITIONAL/SPECIFIC VALIDATIONS 
        //CHECKS IF USER EXISTS
        let editor = await user.findOne({ _id: editedBy })

        if (editor === null) {
            nullFields.push('"Edited by" user not existing')
        }
        // else {
        //     //CHECK IF USER OBJ HAS COMPLETE NAME
        //     if (utils.checkObjNull(editor.fullName)) {
        //         nullFields.push('edited by - full name')
        //     }
        //     else {
        //         if (utils.checkIfNull(editor.fullName.firstName)) nullFields.push('edited by - first name')
        //         if (!(typeof editor.fullName.middleName === "undefined") && utils.checkIfNull(editor.fullName.middleName)) nullFields.push('edited by - middle name')
        //         if (utils.checkIfNull(editor.fullName.lastName)) nullFields.push('edited by - last name')
        //     }
        // }

        if (nullFields.length > 0) {
            callback(400, false, `Missing data in the following fields: ${nullFields.join(', ')}.`)
        }
        else {
            historyType = historyType.trim().toUpperCase()
            recordClass = recordClass.trim().toProperCase()

            //CHECK FOR FIELDS W INVALID VALUES
            const invalidFields = []

            if (!utils.historyTypeList.includes(historyType)) invalidFields.push('history type')
            if (!utils.recordClassList.includes(recordClass)) invalidFields.push('record class')

            if (invalidFields.length > 0) {
                callback(404, false, `Invalid values detected for the following fields: ${invalidFields.join(', ')}.`)
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
                    .then((result) => {
                        callback(200, true, result)
                    })
                    .catch((error) => {
                        callback(500, false, error.message)
                    })
            }
        }
    }
    catch (err) {
        callback(500, false, err.message)
    }

}

module.exports = {
    getAllLogs,
    addLog,
    deleteLogs
}