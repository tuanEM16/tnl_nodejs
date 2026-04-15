// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/posts', postController.index);
router.get('/posts/slug/:slug', postController.showBySlug);
router.get('/posts/:id', postController.show);

router.post('/posts', authMiddleware, upload.single('image'), postController.store);
router.put('/posts/:id', authMiddleware, upload.single('image'), postController.update);
router.delete('/posts/:id', authMiddleware, postController.destroy);

module.exports = router;