const productService = require('../services/productService');
const pool = require('../config/db');
const productController = {

    getAttributes: async (req, res) => {
        try {
            const data = await productService.getAttributes();
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getAttributeById: async (req, res) => {
        try {
            const { id } = req.params;
            // Query vào bảng attribute số ít như ảnh đại ca gửi
            const [rows] = await pool.query(`SELECT * FROM attribute WHERE id = ?`, [id]);

            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'KHÔNG TÌM THẤY THÔNG SỐ NÀY' });
            }

            res.json({ success: true, data: rows[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    storeAttribute: async (req, res) => {
        try {
            const id = await productService.storeAttribute(req.body);
            res.status(201).json({ success: true, message: 'Thêm thuộc tính thành công', id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateAttribute: async (req, res) => {
        try {
            await productService.updateAttribute(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Cập nhật thuộc tính thành công' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    destroyAttribute: async (req, res) => {
        try {
            await productService.destroyAttribute(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa thuộc tính thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },


    index: async (req, res) => {
        try {
            const filters = {
                category_id: req.query.category_id,
                keyword: req.query.keyword,
                attributes: req.query.attributes ? JSON.parse(req.query.attributes) : undefined,
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
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    showBySlug: async (req, res) => {
        try {
            const data = await productService.showBySlug(req.params.slug);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // controllers/productController.js
    update: async (req, res) => {
        try {
            const updateData = { ...req.body };

            // 🟢 SỬA LỖI THUMBNAIL: Vì dùng upload.fields nên phải bốc thế này
            if (req.files && req.files['thumbnail']) {
                updateData.thumbnail = req.files['thumbnail'][0].filename;
            }

            // 🟢 QUAN TRỌNG: Không được delete attributes ở đây 
            // vì Service cần nó để biết có nên update thuộc tính hay không
            // delete updateData.attributes; <-- BỎ DÒNG NÀY ĐI

            await productService.update(req.params.id, updateData, req.files);
            res.status(200).json({ success: true, message: 'Cập nhật thành công' });
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