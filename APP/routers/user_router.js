const express = require('express')
const studentController = require('../controllers/user_controller')
const router = express.Router()
const userController = require('../controllers/user_controller')

//for reference lang
// router.post('/add', studentController.addStudent)
router.get('/viewProfile', userController.viewProfileSetting)
// router.get('/filter', studentController.filterStudents)
// router.delete('/delete/:id', studentController.deleteStudent)
// router.put('/update/:id', studentController.updateStudent)

module.exports = router
