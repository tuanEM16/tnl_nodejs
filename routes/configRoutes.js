const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/', configController.getSystemConfig);
router.put('/update', configController.updateConfig);

module.exports = router;