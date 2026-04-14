const configService = require('../services/configService');
const configController = {
    getSystemConfig: async (req, res) => {
        try {
            const config = await configService.getConfig();
            res.status(200).json({ success: true, data: config });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    updateConfig: async (req, res) => {
        try {
            await configService.update(req.body);
            res.status(200).json({ success: true, message: "Đã cập nhật cấu hình hệ thống" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
module.exports = configController;