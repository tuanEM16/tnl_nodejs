const Config = require('../models/configModel');
const { deleteFile } = require('../utils/fileHelpers'); 

const configService = {
    show: async () => {
        return await Config.getFullConfig();
    },

 update: async (data, files) => {
        const currentConfig = await Config.getFullConfig();
        const updateData = { ...data };

        // 🗑️ 1. XỬ LÝ DỌN RÁC VẬT LÝ (Logo, Favicon & Video)
        if (files) {
            // Xóa Logo cũ
            if (files['logo']) {
                if (currentConfig && currentConfig.logo) {
                    await deleteFile(currentConfig.logo);
                }
                updateData.logo = files['logo'][0].filename;
            }

            // Xóa Favicon cũ
            if (files['favicon']) {
                if (currentConfig && currentConfig.favicon) {
                    await deleteFile(currentConfig.favicon);
                }
                updateData.favicon = files['favicon'][0].filename;
            }

            // 🟢 THÊM ĐOẠN NÀY: Để trảm clip cũ
            if (files['intro_video']) {
                // Vì Model của đại ca trộn meta vào config, nên bốc trực tiếp tên file ra
                const oldVideo = currentConfig.intro_video; 
                
                if (oldVideo) {
                    console.log("👉 ĐANG TRẢM CLIP CŨ:", oldVideo);
                    await deleteFile(oldVideo); // 🧹 Quét sạch file cũ
                }
                updateData.intro_video = files['intro_video'][0].filename;
            }
        }

        const fixedFields = [
            'site_name', 'slogan', 'logo', 'favicon', 'email', 'phone',
            'hotline', 'address', 'map_embed', 'facebook', 'youtube',
            'meta_title', 'meta_description', 'meta_keywords'
        ];

        const fixedData = {};
        const metaData = {};

        // 2. Phân loại dữ liệu
        Object.keys(updateData).forEach(key => {
            if (fixedFields.includes(key)) {
                fixedData[key] = updateData[key];
            } else {
                // Tránh lưu các trường rác vào Meta
                if (key !== '_method' && key !== 'meta') {
                    metaData[key] = updateData[key];
                }
            }
        });

        // 3. Cập nhật bảng chính `config`
        if (Object.keys(fixedData).length > 0) {
            await Config.updateFixed(fixedData);
        }

        // 4. Cập nhật bảng `config_meta` (Gồm cả intro_video mới)
        for (const [key, value] of Object.entries(metaData)) {
            if (value !== undefined && value !== null) {
                await Config.upsertMeta(key, value);
            }
        }
    }
};

module.exports = configService;