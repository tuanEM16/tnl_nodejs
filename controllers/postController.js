const postService = require('../services/postService');
const postController = {
    index: async (req, res) => {
        try {
            const filters = {
                topic_id: req.query.topic_id,
                post_type: req.query.post_type || 'post',
                keyword: req.query.keyword,
                limit: req.query.limit || 20,
                offset: req.query.offset || 0
            };
            const data = await postService.index(filters);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    store: async (req, res) => {
        try {
            const id = await postService.store(req.body);
            res.status(201).json({ success: true, message: 'Thêm bài viết thành công', id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    show: async (req, res) => {
        try {
            const data = await postService.show(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    showBySlug: async (req, res) => {
        try {
            const data = await postService.showBySlug(req.params.slug);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            await postService.update(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Cập nhật bài viết thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    destroy: async (req, res) => {
        try {
            await postService.destroy(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa bài viết thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
module.exports = postController;