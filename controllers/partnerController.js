const Partner = require('../models/partnerModel');

const partnerController = {
    index: async (req, res) => {
        try {
            const data = await Partner.getAll();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    store: async (req, res) => {
        try {
            const data = {
                name: req.body.name,
                link: req.body.link,
                status: req.body.status || 1,
                logo: req.file ? req.file.filename : null // 🟢 Dùng 'logo' cho đối tác
            };
            const id = await Partner.create(data);
            res.json({ success: true, id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const data = {
                name: req.body.name,
                link: req.body.link,
                status: req.body.status
            };
            if (req.file) data.logo = req.file.filename;
            await Partner.update(req.params.id, data);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    destroy: async (req, res) => {
        try {
            await Partner.delete(req.params.id);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    reorder: async (req, res) => {
        try {
            await Partner.updateOrder(req.body.ids);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = partnerController;