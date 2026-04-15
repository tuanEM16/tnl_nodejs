const menuService = require('../services/menuService');
const menuController = {
    index: async (req, res) => {
        try {
            const { position, tree } = req.query;
            let data;
            if (tree === 'true') {
                data = await menuService.getTree(position);
            } else {
                data = await menuService.index(position);
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    store: async (req, res) => {
        try {
            const id = await menuService.store(req.body);
            res.status(201).json({ success: true, message: 'Thêm menu thành công', id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    show: async (req, res) => {
        try {
            const data = await menuService.show(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy menu' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            await menuService.update(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Cập nhật menu thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    destroy: async (req, res) => {
        try {
            await menuService.destroy(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa menu thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    reorder: async (req, res) => {
        try {
            await menuService.reorder(req.body.items);
            res.status(200).json({ success: true, message: 'Sắp xếp menu thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
module.exports = menuController;