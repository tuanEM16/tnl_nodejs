const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Lấy danh sách bài viết (truyền ?type=post hoặc ?type=page)
router.get('/', postController.getPosts);

// Lấy chi tiết một bài viết qua slug
router.get('/:slug', postController.getDetail);

module.exports = router;