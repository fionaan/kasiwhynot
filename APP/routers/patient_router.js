const express = require('express')
const patientController = require('../controllers/patient_controller')
const router = express.Router()

//for reference lang
router.post('/add', patientController.addRecord)




// router.get('/filter', studentController.filterStudents)
// router.delete('/delete/:id', studentController.deleteStudent)
// router.put('/update/:id', studentController.updateStudent)

router.get('/get/:pageNumber?', patientController.getPatientList)
router.get('/getone', patientController.getPatient)
router.get('/search/:pageNumber?', patientController.searchPatientList)

module.exports = router

