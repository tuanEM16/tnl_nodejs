const Menu = require('../models/menuModel');

const menuService = {
    index: async (position) => {
        return await Menu.getAll(position);
    },

    getTree: async (position = null, parentId = 0) => {
        const items = await Menu.getChildren(parentId, position);
        for (let item of items) {
            item.children = await menuService.getTree(position, item.id);
        }
        return items;
    },

    show: async (id) => {
        return await Menu.getById(id);
    },

    store: async (data) => {
        return await Menu.create(data);
    },

    update: async (id, data) => {
        const affected = await Menu.update(id, data);
        if (!affected) throw new Error('Không tìm thấy menu');
    },

    destroy: async (id) => {
        const affected = await Menu.delete(id);
        if (!affected) throw new Error('Không tìm thấy menu');
    },

    reorder: async (items, parentId = 0) => {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            await Menu.update(item.id, { sort_order: i, parent_id: parentId });
            if (item.children && item.children.length > 0) {
                await menuService.reorder(item.children, item.id);
            }
        }
    }
};

module.exports = menuService;