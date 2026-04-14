const postService = require('../services/postService');
const postController = {
    getPosts: async (req, res) => {
        try {
            const { type } = req.query; 
            const posts = await postService.getAllPosts(type);
            res.status(200).json({ success: true, data: posts });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getDetail: async (req, res) => {
        try {
            const post = await postService.getPostBySlug(req.params.slug);
            if (!post) return res.status(404).json({ success: false, message: "Không tìm thấy bài viết" });
            res.status(200).json({ success: true, data: post });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
module.exports = postController;