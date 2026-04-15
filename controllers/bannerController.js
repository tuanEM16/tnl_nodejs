const bannerService = require('../services/bannerService');

const bannerController = {
    index: async (req, res) => {
        try {
            const { position } = req.query;
            const data = await bannerService.index(position);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    store: async (req, res) => {
        try {
            const id = await bannerService.store(req.body);
            res.status(201).json({ success: true, message: 'Thêm banner thành công', id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    show: async (req, res) => {
        try {
            const data = await bannerService.show(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy banner' });
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            await bannerService.update(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Cập nhật banner thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
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