const productService = require('../services/productService');
const productController = {
    index: async (req, res) => {
        try {
            const filters = {
                category_id: req.query.category_id,
                keyword: req.query.keyword,
                min_price: req.query.min_price,
                max_price: req.query.max_price,
                limit: req.query.limit || 20,
                offset: req.query.offset || 0
            };
            const data = await productService.index(filters);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    store: async (req, res) => {
        try {
            const id = await productService.store(req.body, req.files);
            res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    show: async (req, res) => {
        try {
            const data = await productService.show(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    showBySlug: async (req, res) => {
        try {
            const data = await productService.showBySlug(req.params.slug);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            await productService.update(req.params.id, req.body, req.files);
            res.status(200).json({ success: true, message: 'Cập nhật sản phẩm thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    destroy: async (req, res) => {
        try {
            await productService.destroy(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa sản phẩm thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
module.exports = productController;