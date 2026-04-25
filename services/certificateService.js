const Certificate = require('../models/certificateModel');
const { deleteFile } = require('../utils/fileHelpers'); 
const db = require('../config/db');

const certificateService = {
    // 🟢 1. LẤY DANH SÁCH
    index: async () => {
        return await Certificate.getAll();
    },

    // 🟢 2. XEM CHI TIẾT
    show: async (id) => {
        return await Certificate.getById(id);
    },

    // 🟢 3. THÊM MỚI (Xử lý ảnh luôn)
    store: async (data, file) => {
        const payload = { ...data };
        if (file) {
            payload.image = file.filename;
        }
        return await Certificate.create(payload);
    },

    // 🟢 4. CẬP NHẬT (Dọn rác ảnh cũ khi thay ảnh mới)
    update: async (id, data, file) => {
        const updateData = { ...data };

        // 🗑️ Kiểm tra nếu đại ca có upload ảnh mới
        if (file) {
            // Bốc thằng cũ ra để lấy tên ảnh hiện tại
            const oldItem = await Certificate.getById(id);
            if (oldItem && oldItem.image) {
                // Tiêu hủy ảnh cũ khỏi folder uploads
                await deleteFile(oldItem.image);
            }
            // Gán tên ảnh mới vào bộ dữ liệu
            updateData.image = file.filename;
        }

        const affected = await Certificate.update(id, updateData);
        if (!affected) throw new Error('Không tìm thấy chứng chỉ hoặc dữ liệu không đổi');
        
        return true;
    },

    // 🟢 5. XÓA SẠCH SÀNH SANH (Cả File lẫn DB)
    delete: async (id) => {
        // 1. Tìm thông tin bài viết để lấy tên ảnh
        const item = await Certificate.getById(id);

        if (item && item.image) {
            // 2. Xóa file vật lý bằng chổi chuẩn của đại ca
            await deleteFile(item.image);
        }

        // 3. Xóa bản ghi trong Database bằng db.query trực tiếp (Chuẩn bài postService)
        const [result] = await db.query('DELETE FROM certificates WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            throw new Error('ĐÉO TÌM THẤY CHỨNG CHỈ TRONG DB ĐỂ XÓA!');
        }

        return true;
    }
};

module.exports = certificateService;