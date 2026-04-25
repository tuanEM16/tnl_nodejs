const Certificate = require('../models/certificateModel');
const certificateService = require('../services/certificateService');
const db = require('../config/db');
const certificateController = {
    index: async (req, res) => {
        try {
            const data = await Certificate.getAll();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    store: async (req, res) => {
        try {
            const data = {
                title: req.body.title,
                issue_year: req.body.issue_year,
                organization: req.body.organization,
                status: req.body.status || 1,
                image: req.file ? req.file.filename : null
            };
            const id = await Certificate.create(data);
            res.json({ success: true, id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    show: async (req, res) => {
        try {
            const data = await Certificate.getById(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'KHÔNG TÌM THẤY!' });
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

   update: async (req, res) => {
        try {
            // 🟢 Truyền cả id, body và file sang service xử lý
            await certificateService.update(req.params.id, req.body, req.file);
            res.json({ success: true, message: 'Cập nhật thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 🟢 ĐÃ ĐỔI TÊN THÀNH delete ĐỂ KHỚP VỚI MODEL
    delete: async (req, res) => {
        try {
            // Gọi đúng hàm Certificate.delete trong Model
            await Certificate.delete(req.params.id); 
            res.json({ success: true, message: 'XÓA SẠCH SÀNH SANH CẢ FILE LẪN DB!' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    reorder: async (req, res) => {
        try {
            await Certificate.updateOrder(req.body.ids);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = certificateController;