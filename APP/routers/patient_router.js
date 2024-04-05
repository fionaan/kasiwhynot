const express = require('express')
const patientController = require('../controllers/patient_controller')
const router = express.Router()

router.put('/addDental', patientController.addDentalRecord)
router.post('/add', patientController.addRecord)
router.get('/get/:pageNumber?', patientController.getPatientList)
router.get('/getone', patientController.getPatient)
router.get('/getDental/:pageNumber?', patientController.getPatientList)
router.get('/search/:pageNumber?', patientController.searchPatientList)
router.put('/update/:id', patientController.updateRecord)
router.put('/archive/:id', patientController.archivePatient)
router.put('/unarchive/:id', patientController.unarchivePatient)
router.get('/filterList', patientController.getFilterList)
router.get('/getFilter/:pageNumber?', patientController.getFilteredResultList)

// ALL 'DELETE' ROUTERS ARE FOR TESTING PURPOSES ONLY
router.delete('/deletestud', patientController.deleteStudents)
router.delete('/deleteemp', patientController.deleteEmployees)
router.delete('/deletebase', patientController.deleteBase)

module.exports = router;