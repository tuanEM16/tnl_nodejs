// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/contacts', contactController.store);

router.get('/contacts', authMiddleware, contactController.index);
router.get('/contacts/:id', authMiddleware, contactController.show);
router.post('/contacts/:id/reply', authMiddleware, contactController.reply);
router.put('/contacts/:id', authMiddleware, contactController.update);
router.patch('/contacts/:id/status', authMiddleware, contactController.updateStatus);
router.delete('/contacts/:id', authMiddleware, contactController.destroy);

module.exports = router;