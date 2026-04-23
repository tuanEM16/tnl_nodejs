const Banner = require('../models/bannerModel');
const { deleteFile } = require('../utils/fileHelpers'); // 🟢 Triệu hồi chổi quét rác từ utils

const bannerService = {
    index: async (filters) => {
        return await Banner.getAll(filters);
    },

    show: async (id) => {
        return await Banner.getById(id);
    },

    store: async (data, file) => {
        const insertData = { ...data };

        if (file) {
            insertData.image = file.filename; 
        }

        return await Banner.create(insertData);
    },

    // 🟢 CẬP NHẬT BANNER (Xử lý dọn rác ảnh cũ khi đổi ảnh mới)
    update: async (id, data, file) => {
        const updateData = { ...data };
        delete updateData._method; 

        if (file) {
            // 🗑️ 1. Lấy dữ liệu banner cũ để tìm tên file hiện tại
            const oldBanner = await Banner.getById(id);
            if (oldBanner && oldBanner.image) {
                // 2. Xóa file vật lý trong thư mục uploads
                await deleteFile(oldBanner.image);
            }
            // 3. Gán tên file mới cho bộ dữ liệu cập nhật
            updateData.image = file.filename; 
        }

        const affected = await Banner.update(id, updateData);
        
        // Tránh lỗi 500 khi bấm Save mà không đổi dữ liệu
        if (!affected && !file) {
            console.log("Dữ liệu banner không thay đổi");
        }
        
        return affected;
    },

    // 🟢 XÓA BANNER (Dọn sạch cả File lẫn bản ghi DB)
    destroy: async (id) => {
        // 1. Tìm thông tin banner trước khi xóa trong DB
        const banner = await Banner.getById(id);
        if (banner && banner.image) {
            // 2. Tiêu hủy file ảnh vật lý
            await deleteFile(banner.image);
        }

        // 3. Xóa bản ghi trong Database
        const affected = await Banner.delete(id);
        if (!affected) throw new Error('Không tìm thấy banner để xóa');
    }
};

module.exports = bannerService;