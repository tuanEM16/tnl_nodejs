const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/posts/upload-content', upload.single('image'), postController.uploadContentImage);

router.put('/posts/reorder', postController.updateOrder);
router.get('/posts', postController.index);
router.get('/posts/slug/:slug', postController.showBySlug);
router.get('/posts/:id', postController.show);

router.get('/post-page-categories', postController.getPageCategories);
router.post('/post-page-categories', authMiddleware, postController.storePageCategory);
router.delete('/post-page-categories/:id', authMiddleware, postController.destroyPageCategory);

router.get('/post-categories', postController.getCategories);
router.post('/post-categories', authMiddleware, postController.storeCategory);
router.put('/post-categories/:id', authMiddleware, postController.updateCategory);
router.delete('/post-categories/:id', authMiddleware, postController.destroyCategory);

router.post('/posts', authMiddleware, upload.single('image'), postController.store);
router.put('/posts/:id', authMiddleware, upload.single('image'), postController.update);
router.delete('/posts/:id', authMiddleware, postController.destroy);

module.exports = router;