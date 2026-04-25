const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');

// 🟢 GỌI ĐÚNG TÊN ĐẠI CA ĐANG XÀI
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', partnerController.index);

router.post('/', authMiddleware, upload.single('logo'), partnerController.store);
router.put('/reorder', authMiddleware, partnerController.reorder);
router.put('/:id', authMiddleware, upload.single('logo'), partnerController.update);
router.delete('/:id', partnerController.destroy);

module.exports = router;