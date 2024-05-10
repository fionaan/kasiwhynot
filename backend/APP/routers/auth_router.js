const express = require('express')
const authController = require('../controllers/auth_controller')
const router = express.Router()

router.get('/login', authController.login)
router.put('/set-new-password', authController.setNewPassword)
router.put('/change-old-password', authController.changeOldPassword)
router.delete('/logout', authController.logout)

module.exports = router