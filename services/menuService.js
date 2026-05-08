const Menu = require('../models/menuModel');

const menuService = {

    // Admin list — flat, kể cả ẩn
    index: async (position) => {
        return await Menu.getAll(position);
    },

    // Public + admin preview — dạng cây, slug động, 1 query
    getTree: async (position = null) => {
        const flat = await Menu.getAllWithSlug(position);
        return Menu.buildTree(flat);
    },

    show: async (id) => {
        return await Menu.getById(id);
    },

    store: async (data) => {
        if (!data.name) throw new Error('Vui lòng nhập tên menu');
        if (!data.type) throw new Error('Vui lòng chọn loại menu');
        // if (data.type === 'post') data.type = 'page';
        return await Menu.create(data);
    },

    update: async (id, data) => {
        delete data.id;
        delete data.created_at;
        delete data.updated_at;
        delete data.created_by;
        // if (data.type === 'post') data.type = 'page';
        const affected = await Menu.update(id, data);
        if (!affected) throw new Error('Không tìm thấy menu hoặc dữ liệu không đổi');
    },

    destroy: async (id) => {
        const affected = await Menu.delete(id);
        if (!affected) throw new Error('Không tìm thấy menu');
    },

    // Sắp xếp đệ quy — cập nhật sort_order + parent_id
    reorder: async (items, parentId = 0) => {
        for (let i = 0; i < items.length; i++) {
            await Menu.update(items[i].id, { sort_order: i, parent_id: parentId });
            if (items[i].children?.length > 0) {
                await menuService.reorder(items[i].children, items[i].id);
            }
        }
    }
};

module.exports = menuService;