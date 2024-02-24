const historyLog = require('../models/historylog_model')

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

const addLog = (req, res, next, historyType, recordClass, patientName) => {
    const {dateTime, editedBy} = req.body

    //check if null or empty
    const emptyOrNullVariables = []
    
    if (!dateTime || dateTime == "" || dateTime === null) emptyOrNullVariables.push('date & time')
    if (!editedBy || editedBy == "" || editedBy === null) emptyOrNullVariables.push('edited by')
    if (historyType == "" || historyType === null) emptyOrNullVariables.push('history type')
    if (recordClass == "" || recordClass === null) emptyOrNullVariables.push('record class')
    if (patientName == "" || patientName === null) emptyOrNullVariables.push('patient name')


    if(emptyOrNullVariables.length > 0){
        res.status(404).send({
            successful: false,
            message: `Missing data in the following fields: ${emptyOrNullVariables.join(', ')}`
        })
    }

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

module.exports = {
    getAllLogs,
    addLog
}