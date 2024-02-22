const express = require('express')
const studentController = require('../controllers/student_controller')
const router = express.Router()

router.post('/add', studentController.addStudent)
router.get('/getAll', studentController.getAllStudents)
router.get('/filter', studentController.filterStudents)
router.delete('/delete/:id', studentController.deleteStudent)
router.put('/update/:id', studentController.updateStudent)

module.exports = router
