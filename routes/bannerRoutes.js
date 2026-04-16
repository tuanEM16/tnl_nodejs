const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/banners', bannerController.index);
router.get('/banners/:id', bannerController.show);

router.post('/banners', authMiddleware, upload.single('image'), bannerController.store);
router.put('/banners/:id', authMiddleware, upload.single('image'), bannerController.update);
router.delete('/banners/:id', authMiddleware, bannerController.destroy);

module.exports = router;