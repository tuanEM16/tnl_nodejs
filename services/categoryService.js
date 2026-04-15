const Category = require('../models/categoryModel');
const { toSlug } = require('../utils/helpers');
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
    store: async (data) => {
        let slug = data.slug;
        if (!slug) {
            slug = toSlug(data.name);
        }
        let exists = await Category.slugExists(slug);
        let counter = 1;
        let newSlug = slug;
        while (exists) {
            newSlug = `${slug}-${counter}`;
            exists = await Category.slugExists(newSlug);
            counter++;
        }
        const payload = { ...data, slug: newSlug };
        return await Category.create(payload);
    },
    update: async (id, data) => {
        if (data.slug) {
            const exists = await Category.slugExists(data.slug, id);
            if (exists) {
                throw new Error('Slug đã tồn tại');
            }
        }
        if (data.name && !data.slug) {
            data.slug = toSlug(data.name);
            let exists = await Category.slugExists(data.slug, id);
            let counter = 1;
            let newSlug = data.slug;
            while (exists) {
                newSlug = `${data.slug}-${counter}`;
                exists = await Category.slugExists(newSlug, id);
                counter++;
            }
            data.slug = newSlug;
        }
        const affected = await Category.update(id, data);
        if (!affected) throw new Error('Không tìm thấy danh mục');
    },
    destroy: async (id) => {
        const affected = await Category.delete(id);
        if (!affected) throw new Error('Không tìm thấy danh mục');
    }
};
module.exports = categoryService;