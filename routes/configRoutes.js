const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/config', configController.show);
router.put('/config', authMiddleware, configController.update);

module.exports = router;