const mongoose = require('mongoose')

const Schema = mongoose.Schema

const historyLogSchema = new Schema({
    dateTime: {type: Date, required: true, default: Date.now()},
    editedBy: {type: mongoose.ObjectId, required: true, ref: "Users"},
    historyType: {type: String, enum: ['ADD', 'UPDATE', 'ARCHIVE', 'UNARCHIVE'], required: true},
    recordClass: {type: String, enum: ['Medical', 'Dental'], required: true},
    patientName: {type: String, required: true}
})

const HistoryLog = mongoose.model('History Logs', historyLogSchema)

module.exports = HistoryLog