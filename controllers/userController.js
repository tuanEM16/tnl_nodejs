const userService = require('../services/userService');

const userController = {

    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const result = await userService.login(username, password);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    },

    profile: async (req, res) => {
        try {
            const data = await userService.show(req.user.id);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateProfile: async (req, res) => {
        try {
            await userService.update(req.user.id, req.body, req.user.id);
            res.status(200).json({ success: true, message: 'Cập nhật thông tin thành công' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { old_password, new_password } = req.body;
            await userService.changePassword(req.user.id, old_password, new_password);
            res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // Backend: controllers/userController.js
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body; // 'email' ở đây là cái identifier người dùng nhập
            await userService.forgotPassword(email);
            res.status(200).json({
                success: true,
                message: 'Mã xác thực đã được gửi!'
            });
        } catch (error) {
            // 🔥 QUAN TRỌNG: Phải log ra đây để con nhìn thấy lỗi thật ở Terminal
            console.error("LỖI QUÊN MẬT KHẨU:", error.message);

            res.status(400).json({
                success: false,
                message: error.message // Trả về câu "Lỗi: Không có tài khoản..."
            });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { token, new_password } = req.body;
            await userService.resetPassword(token, new_password);
            res.status(200).json({ success: true, message: 'Đặt lại mật khẩu thành công' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },


    index: async (req, res) => {
        try {
            const filters = {
                status: req.query.status,
                keyword: req.query.keyword,
                limit: req.query.limit || 20,
                offset: req.query.offset || 0
            };
            const data = await userService.index(filters);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    store: async (req, res) => {
        try {
            const id = await userService.store(req.body, req.user.id);
            res.status(201).json({ success: true, message: 'Thêm tài khoản admin thành công', id });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    show: async (req, res) => {
        try {
            const data = await userService.show(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            await userService.update(req.params.id, req.body, req.user.id);
            res.status(200).json({ success: true, message: 'Cập nhật tài khoản thành công' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    destroy: async (req, res) => {
        try {
            await userService.destroy(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa tài khoản thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = userController;