const express = require('express')
const historyLogController = require('../controllers/historylog_controller')
const router = express.Router()

router.get('/all/:pageNumber?', historyLogController.getAllLogs)
router.post('/create', historyLogController.addLog) //for testing purposes

module.exports = router