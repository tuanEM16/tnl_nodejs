const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/analyticsController');
const verifyToken = require('../middleware/authMiddleware');

// Public — frontend gọi khi user xem trang (không cần auth)
router.post('/analytics/track', ctrl.track);

// Admin — cần đăng nhập
router.get('/analytics/summary',      verifyToken, ctrl.getSummary);
router.get('/analytics/top-products', verifyToken, ctrl.getTopProducts);
router.get('/analytics/chart',        verifyToken, ctrl.getChartData);

module.exports = router;