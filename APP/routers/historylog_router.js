const express = require('express')
const historyLogController = require('../controllers/historylog_controller')
const router = express.Router()

router.get('/all', historyLogController.getAllLogs)



module.exports = router