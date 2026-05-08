const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// r
router.post('/', chatController.chat);

module.exports = router;