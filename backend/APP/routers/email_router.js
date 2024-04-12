const express = require('express')
const emailController = require('../controllers/email_controller')
const router = express.Router()

router.get('/sendcode', emailController.sendCode)

module.exports = router