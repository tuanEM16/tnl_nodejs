const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/posts', postController.index);
router.get('/posts/slug/:slug', postController.showBySlug);
router.get('/posts/:id', postController.show);
router.get('/post-categories', postController.getCategories);

// Admin routes
router.post('/post-categories', authMiddleware, postController.storeCategory);
router.put('/post-categories/:id', authMiddleware, postController.updateCategory);
router.delete('/post-categories/:id', authMiddleware, postController.destroyCategory);

router.post('/posts', authMiddleware, upload.single('image'), postController.store);
router.put('/posts/:id', authMiddleware, upload.single('image'), postController.update);
router.delete('/posts/:id', authMiddleware, postController.destroy);

module.exports = router;