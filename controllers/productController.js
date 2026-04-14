const productService = require('../services/productService');
const productController = {
    getAll: async (req, res) => {
        try {
            const products = await productService.getAllProducts(req.query);
            res.status(200).json({ success: true, data: products });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getDetail: async (req, res) => {
        try {
            const product = await productService.getProductBySlug(req.params.slug);
            if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
            res.status(200).json({ success: true, data: product });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    create: async (req, res) => {
        try {
            const newProduct = await productService.createProduct(req.body);
            res.status(201).json({ success: true, data: newProduct });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
module.exports = productController;