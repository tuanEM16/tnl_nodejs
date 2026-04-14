const postModel = require('../models/postModel');
const postService = {
    getAllPosts: async (type) => {
        return await postModel.getByType(type || 'post');
    },
    getPostBySlug: async (slug) => {
        return await postModel.getDetail(slug);
    }
};
module.exports = postService;