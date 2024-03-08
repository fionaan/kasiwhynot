const express = require('express')
const patientController = require('../controllers/patient_controller')
const router = express.Router()

router.put('/addDental', patientController.addDentalRecord)
router.post('/add', patientController.addRecord)
router.get('/get/:pageNumber?', patientController.getPatientList)
router.get('/getone', patientController.getPatient)
router.get('/search/:pageNumber?', patientController.searchPatientList)
router.put('/update/:id', patientController.updateRecord)
router.put('/archive/:id', patientController.archivePatient);
router.put('/unarchive/:id', patientController.unarchivePatient);

module.exports = router;
