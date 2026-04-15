// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/orders', orderController.store);

router.get('/orders', authMiddleware, orderController.index);
router.get('/orders/:id', authMiddleware, orderController.show);
router.put('/orders/:id', authMiddleware, orderController.update);
router.patch('/orders/:id/status', authMiddleware, orderController.updateStatus);
router.patch('/orders/:id/payment', authMiddleware, orderController.updatePaymentStatus);
router.post('/orders/:id/cancel', authMiddleware, orderController.cancel);
router.delete('/orders/:id', authMiddleware, orderController.destroy);

module.exports = router;