const menuModel = require('../models/menuModel');
const menuService = {
    getMenusByPosition: async (position) => {
        const menus = await menuModel.getByPosition(position || 'mainmenu');
        return menus.filter(m => m.parent_id === 0).map(parent => ({
            ...parent,
            subs: menus.filter(child => child.parent_id === parent.id)
        }));
    }
};
module.exports = menuService;