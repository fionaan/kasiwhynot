const express = require('express')
const patientController = require('../controllers/patient_controller')
const router = express.Router()
const { authenticateToken } = require('../controllers/auth_controller')

const multer = require('multer')
const fs = require('fs-extra')
const convertExcelToJson = require('convert-excel-to-json')

const app = express()
const upload = multer({ dest: 'uploads/' })



router.put('/addDental', patientController.addDentalRecord)
router.post('/add', patientController.addRecord)
router.post('/get/:pageNumber?', patientController.getPatientList)
router.get('/getone', patientController.getPatient)
router.get('/getDental/:pageNumber?', patientController.getPatientList)
router.get('/search/:pageNumber?', patientController.searchPatientList)
router.put('/update/:id', patientController.updateRecord)
router.put('/archivePatient', patientController.archivePatient)
router.put('/unarchivePatient', patientController.unarchivePatient)
router.get('/filterList', patientController.getFilterList)
router.post('/getFilter/:pageNumber?', patientController.getFilteredResultList)
router.put('/bulkArchive', patientController.bulkArchivePatients)
router.put('/bulkUnarchive', patientController.bulkUnarchivePatients)

// ALL ROUTERS BELOW ARE FOR TESTING PURPOSES ONLY
router.delete('/deletestud', patientController.deleteStudents)
router.delete('/deleteemp', patientController.deleteEmployees)
router.delete('/deletebase', patientController.deleteBase)
router.post('/addBulk', upload.single('file'), patientController.addBulk)
router.post('/addBulkExcel', upload.single('xlxsfile'), patientController.addBulkExcel)
router.get('/studbase', patientController.testSb)

module.exports = router;