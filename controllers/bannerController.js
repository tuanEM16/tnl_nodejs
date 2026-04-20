const bannerService = require('../services/bannerService');

const bannerController = {

    index: async (req, res) => {
        try {

            const { page, keyword } = req.query;


            const banners = await bannerService.index({
                page: page || '',
                keyword: keyword || ''
            });

            res.json({
                status: true,
                data: banners
            });
        } catch (error) {
            console.error("Lỗi Controller Banner:", error);
            res.status(500).json({ status: false, message: "LỖI HỆ THỐNG TRUY XUẤT" });
        }
    },


    store: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Không có file ảnh' });
            }

            // Tạo object data sạch, lấy image từ file upload
            const data = {
                name: req.body.name,
                link: req.body.link,
                page: req.body.page,
                sort_order: req.body.sort_order,
                description: req.body.description,
                image: req.file.filename // 🟢 Ưu tiên lấy từ Multer
            };

            const id = await bannerService.store(data);
            res.status(201).json({ success: true, message: 'Thêm banner thành công', id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    show: async (req, res) => {
        try {
            const data = await bannerService.show(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },


    update: async (req, res) => {
        try {

            await bannerService.update(req.params.id, req.body, req.file);
            res.status(200).json({ success: true, message: 'Cập nhật thành công' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    destroy: async (req, res) => {
        try {
            await bannerService.destroy(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa banner thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = bannerController;