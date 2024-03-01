const historyLog = require('../models/historylog_model')
const { dateTimeRegex,
    nameRegex,
    historyTypeList,
    recordClassList,
    checkIfNull,
    toProperCase } = require('../../utils')


const getAllLogs = async(req, res, next)=>{
    try{
        let logs = await historyLog.find()
        if(logs === ""){
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

        let {dateTime, editedBy, historyType, recordClass, patientName} = req.body

        //CHECK FOR NULL OR EMPTY FIELDS
        const nullFields = []
        if (checkIfNull(dateTime)) nullFields.push('date & time')
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
            if (!dateTimeRegex.test(dateTime)) invalidFields.push('date & time')
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
                    dateTime: dateTime,
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