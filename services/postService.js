const Post = require('../models/postModel');
const PostCategory = require('../models/postCategoryModel');
const { toSlug } = require('../utils/helpers');
const { deleteFile } = require('../utils/fileHelpers'); // 🟢 Triệu hồi chổi quét rác

const postService = {

    getCategories: async () => {
        return await PostCategory.getAll();
    },

    getCategoryById: async (id) => {
        return await PostCategory.getById(id);
    },

    storeCategory: async (data) => {
        let slug = data.slug || toSlug(data.name);
        let exists = await PostCategory.slugExists(slug);
        let counter = 1;
        let newSlug = slug;
        while (exists) {
            newSlug = `${slug}-${counter}`;
            exists = await PostCategory.slugExists(newSlug);
            counter++;
        }
        return await PostCategory.create({ ...data, slug: newSlug });
    },

    updateCategory: async (id, data) => {
        if (data.slug) {
            const exists = await PostCategory.slugExists(data.slug, id);
            if (exists) throw new Error('Slug danh mục đã tồn tại');
        }
        const affected = await PostCategory.update(id, data);
        if (!affected) throw new Error('Không tìm thấy danh mục');
    },

    destroyCategory: async (id) => {
        const affected = await PostCategory.delete(id);
        if (!affected) throw new Error('Không tìm thấy danh mục');
    },


    index: async (filters) => {
        return await Post.getAll(filters);
    },

    show: async (id) => {
        return await Post.getById(id);
    },

    showBySlug: async (slug) => {
        return await Post.getBySlug(slug);
    },

    // 🟢 THÊM MỚI BÀI VIẾT
    store: async (data, file) => {
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

        // Nếu có upload ảnh thì gán vào payload
        if (file) {
            payload.image = file.filename;
        }

        return await Post.create(payload);
    },


    // 🟢 CẬP NHẬT BÀI VIẾT (Xử lý dọn rác ảnh cũ)
    update: async (id, data, file) => {
        const updateData = { ...data };
        delete updateData._method;

        // 🗑️ DỌN RÁC VẬT LÝ KHI THAY ẢNH
        if (file) {
            // 1. Lấy bài viết cũ để tìm tên ảnh hiện tại
            const oldPost = await Post.getById(id);
            if (oldPost && oldPost.image) {
                // 2. Xóa file ảnh cũ trong thư mục uploads
                await deleteFile(oldPost.image);
            }
            // 3. Cập nhật tên ảnh mới
            updateData.image = file.filename;
        }

        if (updateData.slug) {
            const exists = await Post.slugExists(updateData.slug, id);
            if (exists) throw new Error('Slug đã tồn tại');
        }

        if (updateData.title && !updateData.slug) {
            let slug = toSlug(updateData.title);
            let exists = await Post.slugExists(slug, id);
            let counter = 1;
            let newSlug = slug;
            while (exists) {
                newSlug = `${slug}-${counter}`;
                exists = await Post.slugExists(newSlug, id);
                counter++;
            }
            updateData.slug = newSlug;
        }

        const affected = await Post.update(id, updateData);
        if (!affected) throw new Error('Không tìm thấy bài viết hoặc dữ liệu không đổi');
    },

    // 🟢 XÓA BÀI VIẾT (Dọn sạch cả DB lẫn File)
    destroy: async (id) => {
        // 1. Tìm thông tin bài viết để lấy tên ảnh
        const post = await Post.getById(id);
        if (post && post.image) {
            // 2. Xóa file vật lý
            await deleteFile(post.image);
        }

        // 3. Xóa bản ghi trong DB
        const affected = await Post.delete(id);
        if (!affected) throw new Error('Không tìm thấy bài viết');
    }
};

module.exports = postService;