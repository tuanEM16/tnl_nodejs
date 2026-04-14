const menuService = require('../services/menuService');
const menuController = {
    getMenus: async (req, res) => {
        try {
            const { position } = req.query;
            const menus = await menuService.getMenusByPosition(position);
            res.status(200).json({ success: true, data: menus });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
module.exports = menuController;