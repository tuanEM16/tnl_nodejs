const projectLocationService = require('../services/projectLocationService');

const projectLocationController = {

    // GET /api/project-locations — public, dùng cho bản đồ frontend
    index: async (req, res) => {
        try {
            const data = await projectLocationService.index();
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/project-locations/:id
    show: async (req, res) => {
        try {
            const data = await projectLocationService.show(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy' });
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // POST /api/project-locations — admin
    store: async (req, res) => {
        try {
            const id = await projectLocationService.store(req.body);
            res.status(201).json({ success: true, message: 'Thêm tọa độ thành công', id });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // PUT /api/project-locations/:id — admin
    update: async (req, res) => {
        try {
            await projectLocationService.update(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Cập nhật thành công' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // DELETE /api/project-locations/:id — admin
    destroy: async (req, res) => {
        try {
            await projectLocationService.destroy(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/project-locations/available-posts — admin dropdown
    getAvailablePosts: async (req, res) => {
        try {
            const data = await projectLocationService.getAvailablePosts();
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = projectLocationController;