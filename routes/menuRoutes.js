const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/menus', menuController.index);
router.get('/menus/:id', menuController.show);

router.post('/menus', authMiddleware, menuController.store);
router.put('/menus/:id', authMiddleware, menuController.update);
router.delete('/menus/:id', authMiddleware, menuController.destroy);
router.post('/menus/reorder', authMiddleware, menuController.reorder);

module.exports = router;