const categoryService = require('../services/categoryService');
const categoryController = {
    index: async (req, res) => {
        try {
            const categories = await categoryService.getList();
            res.status(200).json({ success: true, data: categories });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    store: async (req, res) => {
        try {
            const category = await categoryService.add(req.body);
            res.status(201).json({ success: true, data: category });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const result = await categoryService.edit(req.params.id, req.body);
            res.status(200).json({ success: true, message: "Cập nhật thành công" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
module.exports = categoryController;