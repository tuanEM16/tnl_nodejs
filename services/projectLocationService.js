const ProjectLocation = require('../models/projectLocationModel');

const projectLocationService = {

    // Lấy tất cả (public)
    index: async () => {
        return await ProjectLocation.getAll();
    },

    // Lấy 1 bản ghi theo id
    show: async (id) => {
        const data = await ProjectLocation.getById(id);
        if (!data) return null;
        return data;
    },

    // Tạo mới — kiểm tra post_id chưa có tọa độ
    store: async (data) => {
        if (!data.post_id) throw new Error('Vui lòng chọn dự án');
        if (!data.lat || !data.lng) throw new Error('Vui lòng nhập tọa độ');

        // Kiểm tra dự án này đã có tọa độ chưa
        const existing = await ProjectLocation.getByPostId(data.post_id);
        if (existing) throw new Error('Dự án này đã có tọa độ trên bản đồ');

        return await ProjectLocation.create(data);
    },

    // Cập nhật
    update: async (id, data) => {
        // Nếu đổi post_id thì kiểm tra post_id mới chưa bị dùng
        if (data.post_id) {
            const existing = await ProjectLocation.getByPostId(data.post_id);
            if (existing && existing.id !== parseInt(id)) {
                throw new Error('Dự án này đã có tọa độ trên bản đồ');
            }
        }

        const affected = await ProjectLocation.update(id, data);
        if (!affected) throw new Error('Không tìm thấy bản ghi hoặc dữ liệu không đổi');
    },

    // Xóa
    destroy: async (id) => {
        const affected = await ProjectLocation.delete(id);
        if (!affected) throw new Error('Không tìm thấy bản ghi');
    },

    // Lấy danh sách dự án chưa có tọa độ (cho dropdown admin)
    getAvailablePosts: async () => {
        return await ProjectLocation.getPostsWithoutLocation();
    }
};

module.exports = projectLocationService;