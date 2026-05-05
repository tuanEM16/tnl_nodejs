const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/projectLocationController');
const verifyToken = require('../middleware/authMiddleware');
// const authMiddleware = require('../middleware/authMiddleware');

router.get('/project-locations',              ctrl.index);
router.get('/project-locations/available-posts', verifyToken, ctrl.getAvailablePosts);
router.get('/project-locations/:id',          ctrl.show);

// ── Admin (cần đăng nhập) ─────────────────────────────────────────────────────
router.post('/project-locations',             verifyToken, ctrl.store);
router.put('/project-locations/:id',          verifyToken, ctrl.update);
router.delete('/project-locations/:id',       verifyToken, ctrl.destroy);

module.exports = router;