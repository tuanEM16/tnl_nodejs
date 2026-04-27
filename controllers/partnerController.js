// 🟢 DÒNG QUAN TRỌNG NHẤT: Triệu hồi Service để làm việc
const partnerService = require('../services/partnerService'); 
const db = require('../config/db');
const partnerController = {
    index: async (req, res) => {
        try {
            const data = await partnerService.index();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    show: async (req, res) => {
        try {
            const data = await partnerService.show(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'Đéo thấy đối tác!' });
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    create: async (req, res) => {
        try {
            // Đẩy sang service xử lý cả body và file logo
            const id = await partnerService.store(req.body, req.file);
            res.status(201).json({ success: true, message: 'Thêm đối tác thành công', id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            await partnerService.update(req.params.id, req.body, req.file);
            res.json({ success: true, message: 'Cập nhật & dọn rác mướt mờ!' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await partnerService.delete(req.params.id);
            res.json({ success: true, message: 'Xóa sạch sành sanh!' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    reorder: async (req, res) => {
        try {
            // Nếu đại ca để logic reorder ở Service thì gọi service
            // Ở đây em ví dụ gọi thẳng db từ Controller nếu đại ca muốn nhanh
            const db = require('../config/db');
            const { ids } = req.body;
            for (let i = 0; i < ids.length; i++) {
                await db.query('UPDATE partners SET sort_order = ? WHERE id = ?', [i, ids[i]]);
            }
            res.json({ success: true, message: 'Chốt vị trí thép!' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = partnerController;