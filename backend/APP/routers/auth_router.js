const express = require('express')
const authController = require('../controllers/auth_controller')
const router = express.Router()

router.get('/login', authController.login)
router.put('/change-password', authController.changePassword)
router.put('/forget-password', authController.forgetPassword)
router.post('/token', authController.tokenRefresh)

module.exports = router