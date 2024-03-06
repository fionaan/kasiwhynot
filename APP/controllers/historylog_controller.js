const historyLog = require('../models/historylog_model')
const { dateTimeRegex,
    nameRegex,
    historyTypeList,
    recordClassList,
    checkIfNull,
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
                message: "Invalid page number. No history logs found."
            })
        }

        let logs = await historyLog.aggregate([
            {
                $project: {  // 1 is to include the field ; 0 to exclude 
                    dateTime: {  // converts UTC dateTime value to YYYY-mm-dd HH:MM local timezone
                        $dateToString: {
                            format: "%Y-%m-%d %H:%M",
                            date: { $toDate: "$dateTime" },
                            timezone: "Asia/Manila"
                        }
                    },
                    editedBy: 1,
                    historyType: 1,
                    recordClass: 1,
                    patientName: 1
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

const addLog = (req, res, next) => {
    try{

        let {editedBy, historyType, recordClass, patientName} = req.body

        //CHECK FOR NULL OR EMPTY FIELDS
        const nullFields = []
        if (checkIfNull(editedBy)) nullFields.push('edited by')
        if (checkIfNull(historyType)) nullFields.push('history type')
        if (checkIfNull(recordClass)) nullFields.push('record class')
        if (checkIfNull(patientName)) nullFields.push('patient name')

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
            if (!nameRegex.test(editedBy)) invalidFields.push('edited by')
            if (!historyTypeList.includes(historyType)) invalidFields.push('history type')
            if (!recordClassList.includes(recordClass)) invalidFields.push('record class')
            if (!nameRegex.test(patientName)) invalidFields.push('patient name')
            
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
                        id: result._id
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