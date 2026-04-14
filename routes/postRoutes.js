const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');


router.get('/', postController.getPosts);


router.get('/:slug', postController.getDetail);

module.exports = router;