
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.index); // Lấy danh mục
router.post('/store', categoryController.store); // Admin thêm
router.put('/update/:id', categoryController.update); // Admin sửa

module.exports = router;