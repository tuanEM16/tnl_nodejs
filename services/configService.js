const Config = require('../models/configModel');
const { deleteFile } = require('../utils/fileHelpers'); // 🟢 Triệu hồi chổi quét rác

const configService = {
    show: async () => {
        return await Config.getFullConfig();
    },

    // 🟢 Nhận thêm tham số files từ Controller để xử lý upload
    update: async (data, files) => {
        const currentConfig = await Config.getFullConfig();
        const updateData = { ...data };

        // 🗑️ 1. XỬ LÝ DỌN RÁC LOGO & FAVICON
        if (files) {
            // Xử lý Logo
            if (files['logo']) {
                if (currentConfig && currentConfig.logo) {
                    await deleteFile(currentConfig.logo); // Xóa logo cũ vật lý
                }
                updateData.logo = files['logo'][0].filename;
            }

            // Xử lý Favicon
            if (files['favicon']) {
                if (currentConfig && currentConfig.favicon) {
                    await deleteFile(currentConfig.favicon); // Xóa favicon cũ vật lý
                }
                updateData.favicon = files['favicon'][0].filename;
            }
        }

        const fixedFields = [
            'site_name', 'slogan', 'logo', 'favicon', 'email', 'phone',
            'hotline', 'address', 'map_embed', 'facebook', 'youtube',
            'meta_title', 'meta_description', 'meta_keywords'
        ];

        const fixedData = {};
        const metaData = {};

        // 2. Phân loại dữ liệu (Fixed Data vs Meta Data)
        Object.keys(updateData).forEach(key => {
            if (fixedFields.includes(key)) {
                fixedData[key] = updateData[key];
            } else {
                // Tránh lưu các trường spoofing hoặc rác vào Meta
                if (key !== '_method') {
                    metaData[key] = updateData[key];
                }
            }
        });

        // 3. Cập nhật bảng chính `config`
        if (Object.keys(fixedData).length > 0) {
            await Config.updateFixed(fixedData);
        }

        // 4. Cập nhật bảng `config_meta`
        for (const [key, value] of Object.entries(metaData)) {
            if (value !== undefined && value !== null) {
                await Config.upsertMeta(key, value);
            }
        }
    }
};

module.exports = configService;