const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Lấy menu theo vị trí (truyền ?position=mainmenu hoặc ?position=footermenu)
router.get('/', menuController.getMenus);

module.exports = router;