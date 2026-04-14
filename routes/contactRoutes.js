const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Khách hàng gửi form liên hệ
router.post('/send', contactController.sendContact);

// Admin lấy danh sách các liên hệ đã gửi
router.get('/list', contactController.getContacts);

module.exports = router;