const Category = require('../models/categoryModel');
const { toSlug } = require('../utils/helpers');
const { deleteFile } = require('../utils/fileHelpers'); // 🟢 Triệu hồi đội vệ sinh

const categoryService = {
    index: async (parentId = null) => {
        return await Category.getAll(parentId);
    },

    getTree: async (parentId = 0) => {
        const categories = await Category.getChildren(parentId);
        for (let cat of categories) {
            cat.children = await categoryService.getTree(cat.id);
        }
        return categories;
    },

    show: async (id) => {
        return await Category.getById(id);
    },

    showBySlug: async (slug) => {
        return await Category.getBySlug(slug);
    },

    store: async (data, file) => {
        let slug = data.slug || toSlug(data.name);
        let exists = await Category.slugExists(slug);
        let counter = 1;
        let newSlug = slug;
        while (exists) {
            newSlug = `${slug}-${counter}`;
            exists = await Category.slugExists(newSlug);
            counter++;
        }

        const payload = { ...data, slug: newSlug };

        if (file) {
            payload.image = file.filename;
        }

        return await Category.create(payload);
    },

    update: async (id, data, file) => {
        const updateData = { ...data };
        delete updateData._method;

        // 🟢 XỬ LÝ DỌN RÁC KHI ĐỔI ẢNH DANH MỤC
        if (file) {
            // 1. Lấy dữ liệu cũ để tìm tên ảnh hiện tại
            const oldCategory = await Category.getById(id);
            if (oldCategory && oldCategory.image) {
                // 2. Tống khứ ảnh cũ ra khỏi thư mục uploads
                await deleteFile(oldCategory.image);
            }
            // 3. Gán tên ảnh mới vào bộ dữ liệu
            updateData.image = file.filename;
        }

        if (updateData.name && !updateData.slug) {
            let slug = toSlug(updateData.name);
            let exists = await Category.slugExists(slug, id);
            let counter = 1;
            let newSlug = slug;
            while (exists) {
                newSlug = `${slug}-${counter}`;
                exists = await Category.slugExists(newSlug, id);
                counter++;
            }
            updateData.slug = newSlug;
        }

        const affected = await Category.update(id, updateData);
        if (!affected) throw new Error('Không tìm thấy danh mục hoặc dữ liệu không đổi');
    },

    destroy: async (id) => {
        // 🟢 DỌN RÁC TRƯỚC KHI XÓA DANH MỤC
        const category = await Category.getById(id);
        if (category && category.image) {
            await deleteFile(category.image);
        }

        const affected = await Category.delete(id);
        if (!affected) throw new Error('Không tìm thấy danh mục');
    }
};

module.exports = categoryService;