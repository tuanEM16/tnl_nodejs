const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/categories', categoryController.index);
router.get('/categories/slug/:slug', categoryController.showBySlug);
router.get('/categories/:id', categoryController.show);

router.post('/categories', authMiddleware, upload.single('image'), categoryController.store);
router.put('/categories/:id', authMiddleware, upload.single('image'), categoryController.update);
router.delete('/categories/:id', authMiddleware, categoryController.destroy);

module.exports = router;