const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// 1. Lấy danh sách đối tác
router.get('/', partnerController.index);


// 3. Thêm mới (Phải có auth mới cho thêm)
router.post('/', authMiddleware, upload.single('logo'), partnerController.create);
router.get('/:id', partnerController.show);
// 4. Sắp xếp (Để trên :id để tránh trùng lặp)
router.put('/reorder', authMiddleware, partnerController.reorder);

// 5. Cập nhật
router.put('/:id', authMiddleware, upload.single('logo'), partnerController.update);

// 🔴 6. XÓA (Đổi tên thành delete cho đồng bộ với Controller và Service)
router.delete('/:id', authMiddleware, partnerController.delete); 

module.exports = router;