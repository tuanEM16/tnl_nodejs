const categoryService = require('../services/categoryService');

const categoryController = {
    index: async (req, res) => {
        try {
            const { parent_id, tree } = req.query;
            let data;
            if (tree === 'true') {
                data = await categoryService.getTree(parent_id || 0);
            } else {
                data = await categoryService.index(parent_id || null);
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    store: async (req, res) => {
        try {

            const id = await categoryService.store(req.body, req.file);
            res.status(201).json({ success: true, message: 'Thêm danh mục thành công', id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },



    update: async (req, res) => {
        try {

            await categoryService.update(req.params.id, req.body, req.file);
            res.status(200).json({ success: true, message: 'Cập nhật danh mục thành công' });
        } catch (error) {

            res.status(500).json({ success: false, message: error.message });
        }
    },

    show: async (req, res) => {
        try {
            const data = await categoryService.show(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    showBySlug: async (req, res) => {
        try {
            const data = await categoryService.showBySlug(req.params.slug);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },


    destroy: async (req, res) => {
        try {
            await categoryService.destroy(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa danh mục thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = categoryController;