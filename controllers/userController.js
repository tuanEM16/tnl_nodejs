// controllers/userController.js
const userService = require('../services/userService');

const userController = {
    // 🟢 LOGIN: Nhận 2 token và set 2 Cookie
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const { user, accessToken, refreshToken } = await userService.login(username, password);

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                path: '/',
            };
            // maxAge: 15 * 60 * 1000
            // maxAge: 10 * 1000
            // Set Access Token (15 phút)
            res.cookie('token', accessToken, { ...cookieOptions, maxAge: 1 * 60 * 60 * 1000 });
            // Set Refresh Token (7 ngày)
            res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 4 * 60 * 60 * 1000 });

            res.status(200).json({ success: true, user });
        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    },

    // 🟢 REFRESH: Cổng "Hồi sinh" Access Token
    refresh: async (req, res) => {
        try {
            const rfToken = req.cookies.refreshToken;
            if (!rfToken) throw new Error('Phiên làm việc hết hạn');

            const { accessToken, refreshToken } = await userService.refresh(rfToken);

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                path: '/',
            };

            // Xoay vòng cặp token mới
            res.cookie('token', accessToken, { ...cookieOptions, maxAge: 1 * 60 * 60 * 1000 });
            res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 4 * 60 * 60 * 1000 });

            res.json({ success: true });
        } catch (error) {
            // Nếu có biến (hacker dùng lại token cũ), xóa sạch cookie
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            res.status(403).json({ success: false, message: error.message });
        }
    },

    // 🟢 LOGOUT: Đốt sạch cả 2 hòm
    logout: async (req, res) => {
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Đã đăng xuất' });
    },
    // ... các hàm khác giữ nguyên

    // 🟢 3. PROFILE: Giữ nguyên logic vì Middleware đã lo phần bốc Token từ Cookie
    profile: async (req, res) => {
        try {
            const data = await userService.show(req.user.id);
            if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ... Các hàm updateProfile, update, changePassword, index, store, destroy giữ nguyên ...
    // (Vì chúng đã tách biệt logic với Token rồi)

    updateProfile: async (req, res) => {
        try {
            let userData = { ...req.body };
            if (req.file) userData.avatar = req.file.filename;

            if (userData.password && userData.password.trim() !== "") {
                const salt = await bcrypt.genSalt(10);
                userData.password = await bcrypt.hash(userData.password, salt);
            } else {
                delete userData.password;
            }

            await userService.update(req.user.id, userData);
            res.status(200).json({ success: true, message: 'Cập nhật thành công' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            let updateData = { ...req.body };
            if (!updateData.password || updateData.password.trim() === "") {
                delete updateData.password;
            }
            await userService.update(req.params.id, req.body, req.file);
            res.json({ success: true, message: 'Cập nhật thành công!' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            await userService.forgotPassword(email);
            res.status(200).json({ success: true, message: 'Mã xác thực đã được gửi!' });
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
            const userData = { ...req.body };
            if (req.file) userData.avatar = req.file.filename;
            const newId = await userService.store(userData, req.user.id);
            res.status(201).json({ success: true, id: newId });
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