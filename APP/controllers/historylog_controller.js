const historyLog = require('../models/historylog_model')

const getAllLogs = async(req, res, next)=>{
    try{
        let logs = await historyLogs.find()
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

module.exports = {
    getAllLogs
}