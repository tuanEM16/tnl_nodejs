const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware'); // Dùng Multer để up ảnh

router.get('/', productController.getAll); // Lấy danh sách kèm giá sale/kho
router.get('/:slug', productController.getDetail); // Chi tiết sản phẩm


router.post('/store', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), productController.create);

module.exports = router;