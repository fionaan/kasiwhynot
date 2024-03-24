const express = require('express')
const patientController = require('../controllers/patient_controller')
const router = express.Router()
const {authenticateToken} = require('../controllers/auth_controller')

const multer = require('multer')
const fs = require('fs-extra')
const convertExcelToJson = require('convert-excel-to-json')

const app = express()
const upload = multer({ dest: 'uploads/' })



router.put('/addDental', patientController.addDentalRecord)
router.post('/add', patientController.addRecord)
router.get('/get/:pageNumber?', authenticateToken, patientController.getPatientList)
router.get('/getone', patientController.getPatient)
router.get('/search/:pageNumber?', patientController.searchPatientList)
router.put('/update/:id', patientController.updateRecord)
router.put('/archive/:id', patientController.archivePatient);
router.put('/unarchive/:id', patientController.unarchivePatient);
router.get('/filterList', patientController.getFilterList)
router.get('/getFilter/:pageNumber?', patientController.getFilteredResultList)
router.post('/addBulk', upload.single('file'), patientController.addBulk)

module.exports = router;