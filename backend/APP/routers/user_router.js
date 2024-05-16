const express = require('express');
const userController = require('../controllers/user_controller');
const router = express.Router();

router.get('/viewProfile', userController.viewProfileSetting);
router.get('/get/:pageNumber?', userController.getUser)
router.post('/create', userController.addUser);
router.put('/archiveUser', userController.archiveUser)
router.put('/unarchiveUser', userController.unarchiveUser)
router.put('/change-name', userController.setNewName)

module.exports = router