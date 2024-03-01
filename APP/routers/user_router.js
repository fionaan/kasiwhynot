const express = require('express')
const userController = require('../controllers/user_controller')
const router = express.Router()

//for reference lang
// router.post('/add', studentController.addStudent)
// router.get('/getAll', studentController.getAllStudents)
// router.get('/filter', studentController.filterStudents)
// router.delete('/delete/:id', studentController.deleteStudent)
// router.put('/update/:id', studentController.updateStudent)

router.post('/create', userController.addUser)

module.exports = router

