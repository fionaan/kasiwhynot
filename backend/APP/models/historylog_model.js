const mongoose = require('mongoose')

const Schema = mongoose.Schema

const historyLogSchema = new Schema({
    dateTime: {
        type: Date,
        required: [true, "(History Log) DateTime is required"],
        default: Date.now()
    },
    editedBy: { 
        type: mongoose.ObjectId,
        required: [true, "(History Log) EditedBy is rquired"],
        trim: true,
        ref: "Users"
    },
    historyType: {
        type: String,
        required: [true, "(History Log) History Type is required"],
        trim: true,
        enum: {
            values: ['ADD', 'UPDATE', 'ARCHIVE', 'UNARCHIVE'],
            message: "Invalid (History Log) History Type"
        }
    },
    recordClass: {
        type: String,
        required: [true, "(History Log) Record Class is required"],
        trim: true,
        enum: {
            values: ['Medical', 'Dental', 'All'],
            message: "Invalid (History Log) Record Class"
        },
    },
    patientName: {
        type: mongoose.ObjectId,
        required: [true, "(History Log) Patient Name is required"],
        trim: true,
        ref: "BasePatients"
    }
})

const HistoryLog = mongoose.model('History Logs', historyLogSchema)

module.exports = HistoryLog