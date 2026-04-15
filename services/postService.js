// services/postService.js
const Post = require('../models/postModel');
const { toSlug } = require('../utils/helpers');

const postService = {
    index: async (filters) => {
        return await Post.getAll(filters);
    },

    show: async (id) => {
        return await Post.getById(id);
    },

    showBySlug: async (slug) => {
        return await Post.getBySlug(slug);
    },

    store: async (data) => {
        let slug = data.slug || toSlug(data.title);
        let exists = await Post.slugExists(slug);
        let counter = 1;
        let newSlug = slug;
        while (exists) {
            newSlug = `${slug}-${counter}`;
            exists = await Post.slugExists(newSlug);
            counter++;
        }
        const payload = { ...data, slug: newSlug };
        return await Post.create(payload);
    },

    update: async (id, data) => {
        if (data.slug) {
            const exists = await Post.slugExists(data.slug, id);
            if (exists) throw new Error('Slug đã tồn tại');
        }
        if (data.title && !data.slug) {
            let slug = toSlug(data.title);
            let exists = await Post.slugExists(slug, id);
            let counter = 1;
            let newSlug = slug;
            while (exists) {
                newSlug = `${slug}-${counter}`;
                exists = await Post.slugExists(newSlug, id);
                counter++;
            }
            data.slug = newSlug;
        }
        const affected = await Post.update(id, data);
        if (!affected) throw new Error('Không tìm thấy bài viết');
    },

    destroy: async (id) => {
        const affected = await Post.delete(id);
        if (!affected) throw new Error('Không tìm thấy bài viết');
    }
};

module.exports = postService;