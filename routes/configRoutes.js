const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
router.get('/config', configController.show);
router.put('/config', authMiddleware, upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
    { name: 'intro_video', maxCount: 1 }
]), configController.update);
module.exports = router;