const configService = require('../services/configService');
const db = require('../config/db');
const fs = require('fs');
const Config = require('../models/configModel');
const path = require('path');
const configController = {
    // controllers/configController.js (BACKEND)
    index: async (req, res) => {
        try {
            // 1. Bốc thông tin chính
            const [config] = await db.query('SELECT * FROM config WHERE id = 1');

            // 2. 🟢 QUAN TRỌNG: Bốc thêm đống Meta đi kèm
            const [meta] = await db.query('SELECT meta_key, meta_value FROM config_meta WHERE config_id = 1');

            // Trộn tụi nó lại rồi mới nhả về cho Frontend
            res.json({
                success: true,
                data: { ...config[0], meta: meta }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    show: async (req, res) => {
        try {
            // 🟢 ĐỒNG BỘ: Chép nguyên xi logic từ index sang để chắc chắn có meta
            const [config] = await db.query('SELECT * FROM config WHERE id = 1');
            const [meta] = await db.query('SELECT meta_key, meta_value FROM config_meta WHERE config_id = 1');

            res.status(200).json({
                success: true,
                data: { ...config[0], meta: meta }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // controllers/configController.js
    update: async (req, res) => {
        try {
            const updateData = { ...req.body };
            const configId = 1;

            // 1. 🟢 TRIỆU HỒI DỮ LIỆU CŨ
            const fullConfig = await Config.getFullConfig();

            // 2. 🟢 ĐƯỜNG DẪN CHUẨN (Tính từ gốc dự án)
            const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

            // 3. 🟢 XỬ LÝ VIDEO (Bốc từ mảng meta)
            const oldVideo = fullConfig.meta?.find(m => m.meta_key === 'intro_video')?.meta_value;

            if (req.files && req.files.intro_video) {
                const newVideo = req.files.intro_video[0].filename;
                if (oldVideo) {
                    const oldPath = path.join(UPLOAD_DIR, oldVideo);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                        console.log("👉 ĐÃ TRẢM VIDEO CŨ:", oldVideo);
                    }
                }
                await Config.upsertMeta('intro_video', newVideo);
            }

            // 4. 🟢 XỬ LÝ LOGO & FAVICON
            if (req.files) {
                if (req.files.logo) {
                    updateData.logo = req.files.logo[0].filename;
                    if (fullConfig.logo) {
                        const oldLogoPath = path.join(UPLOAD_DIR, fullConfig.logo);
                        if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath);
                    }
                }
                if (req.files.favicon) {
                    updateData.favicon = req.files.favicon[0].filename;
                    if (fullConfig.favicon) {
                        const oldFavPath = path.join(UPLOAD_DIR, fullConfig.favicon);
                        if (fs.existsSync(oldFavPath)) fs.unlinkSync(oldFavPath);
                    }
                }
            }

            // 5. CẬP NHẬT BẢNG CHÍNH
            await Config.updateFixed(updateData);

            res.status(200).json({ success: true, message: 'Đã siết ốc và dọn dẹp file cũ xong!' });
        } catch (error) {
            console.error("LỖI UPDATE:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = configController;