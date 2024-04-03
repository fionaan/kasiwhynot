const express = require('express');
const userController = require('../controllers/user_controller');
const router = express.Router();

router.get('/viewProfile', userController.viewProfileSetting);
router.post('/create', userController.addUser);
router.put('/archive', userController.archiveUser)
router.put('/unarchive', userController.unarchiveUser)

module.exports = router