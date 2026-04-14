const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

// Lấy danh sách banner (truyền ?position=slideshow hoặc ?position=ads)
router.get('/', bannerController.getByPosition);

module.exports = router;