// services/menuService.js
const Menu = require('../models/menuModel');

const menuService = {
    index: async (position) => {
        return await Menu.getAll(position);
    },

    getTree: async (position = null, parentId = 0) => {
        const allMenus = await Menu.getAll(position);
        const buildTree = (parentId) => {
            const items = allMenus
                .filter(m => m.parent_id === parentId)
                .sort((a, b) => a.sort_order - b.sort_order);
            for (let item of items) {
                item.children = buildTree(item.id);
            }
            return items;
        };
        return buildTree(parentId);
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