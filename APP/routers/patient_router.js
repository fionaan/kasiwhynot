const express = require('express')
const patientController = require('../controllers/patient_controller')
const router = express.Router()

//for reference lang
// router.post('/add', studentController.addStudent)
// router.get('/getAll', studentController.getAllStudents)
// router.get('/filter', studentController.filterStudents)
// router.delete('/delete/:id', studentController.deleteStudent)
// router.put('/update/:id', studentController.updateStudent)

router.get('/get/:pageNumber?', patientController.getPatientList)
router.get('/getone', patientController.getPatient)
router.get('/search', patientController.searchPatient)

module.exports = router

