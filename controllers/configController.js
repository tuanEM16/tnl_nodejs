const configService = require('../services/configService');

const configController = {
    show: async (req, res) => {
        try {
            const data = await configService.show();
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            await configService.update(req.body);
            res.status(200).json({ success: true, message: 'Cập nhật cấu hình thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = configController;