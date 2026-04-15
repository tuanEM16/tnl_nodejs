const contactService = require('../services/contactService');

const contactController = {
    index: async (req, res) => {
        try {
            const filters = {
                status: req.query.status,
                user_id: req.query.user_id,
                limit: req.query.limit || 20,
                offset: req.query.offset || 0
            };
            const data = await contactService.index(filters);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    store: async (req, res) => {
        try {
            const payload = {
                ...req.body,
                user_id: req.user ? req.user.id : null
            };
            const id = await contactService.store(payload);
            res.status(201).json({ success: true, message: 'Gửi liên hệ thành công', id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    show: async (req, res) => {
        try {
            const data = await contactService.show(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy liên hệ' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    reply: async (req, res) => {
        try {
            const id = await contactService.storeReply(req.params.id, req.body, req.user.id);
            res.status(201).json({ success: true, message: 'Gửi phản hồi thành công', id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            await contactService.update(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Cập nhật liên hệ thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateStatus: async (req, res) => {
        try {
            await contactService.updateStatus(req.params.id, req.body.status);
            res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    destroy: async (req, res) => {
        try {
            await contactService.destroy(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa liên hệ thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = contactController;