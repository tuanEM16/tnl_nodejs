const productService = require('../services/productService');

const productController = {

    getAttributes: async (req, res) => {
        try {
            const data = await productService.getAttributes();
            res.status(200).json({ success: true, data });
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





    update: async (req, res) => {
        try {
            const updateData = { ...req.body };


            delete updateData._method;
            delete updateData.attributes;



            if (req.file) {
                updateData.thumbnail = req.file.filename; // Gán tên file thật vào
            } else {


                delete updateData.thumbnail;
            }

            await productService.update(req.params.id, updateData, req.files);
            res.status(200).json({ success: true, message: 'Cập nhật thành công' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
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