const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat — endpoint duy nhất cho chatbox
router.post('/', chatController.chat);

module.exports = router;