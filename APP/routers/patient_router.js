const express = require('express')
const patientController = require('../controllers/patient_controller')
const router = express.Router()

router.post('/add', patientController.addRecord)
router.get('/get/:pageNumber?', patientController.getPatientList)
router.get('/getone', patientController.getPatient)
router.get('/search/:pageNumber?', patientController.searchPatientList)
router.get('/filterList', patientController.getFilterList)
router.get('/getFilter/:pageNumber?', patientController.getFilteredResultList)

module.exports = router

