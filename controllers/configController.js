const configService = require('../services/configService');

const configController = {
    show: async (req, res) => {
        try {
            const data = await configService.show();
            res.status(200).json({ success: true, data: data || {} });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {

            const updateData = { ...req.body };


            if (req.files) {
                if (req.files.logo) {
                    updateData.logo = req.files.logo[0].filename;
                }
                if (req.files.favicon) {
                    updateData.favicon = req.files.favicon[0].filename;
                }
            }


            delete updateData._method;

            await configService.update(updateData);
            res.status(200).json({ success: true, message: 'Cập nhật cấu hình thành công' });
        } catch (error) {
            console.error("Lỗi Config Update:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = configController;