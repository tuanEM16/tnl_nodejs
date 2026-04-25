const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

// 🟢 GỌI ĐÚNG TÊN ĐẠI CA ĐANG XÀI
const upload = require('../middleware/uploadMiddleware'); 
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', certificateController.index);
router.get('/:id', certificateController.show);
// Thêm authMiddleware cho giống mấy trang đại ca đã làm cho chắc cú
router.post('/', authMiddleware, upload.single('image'), certificateController.store);
router.put('/reorder', authMiddleware, certificateController.reorder);
router.put('/:id', authMiddleware, upload.single('image'), certificateController.update);
router.delete('/:id', authMiddleware, certificateController.delete);

module.exports = router;