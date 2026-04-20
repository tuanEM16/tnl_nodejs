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


        if (file) {
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
        if (!affected) throw new Error('Không tìm thấy danh mục');
    },

    destroy: async (id) => {
        const affected = await Category.delete(id);
        if (!affected) throw new Error('Không tìm thấy danh mục');
    }
};

module.exports = categoryService;