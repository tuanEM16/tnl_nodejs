const contactService = require('../services/contactService');
const contactController = {
    sendContact: async (req, res) => {
        try {
            const contact = await contactService.saveContact(req.body);
            res.status(201).json({ success: true, message: "Đã gửi thông tin liên hệ thành công" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    getContacts: async (req, res) => {
        try {
            const contacts = await contactService.getAll();
            res.status(200).json({ success: true, data: contacts });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
module.exports = contactController;