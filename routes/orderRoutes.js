const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/checkout', orderController.checkout); // Khách đặt hàng
router.get('/list', orderController.list); // Admin xem danh sách đơn

module.exports = router;