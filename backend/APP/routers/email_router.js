const express = require('express')
const emailController = require('../controllers/email_controller')
const router = express.Router()

router.get('/sendcode', emailController.sendCode)
router.post('/req-otp', emailController.reqOTP)
router.post('/verify-otp', emailController.verifyOTP)

module.exports = router