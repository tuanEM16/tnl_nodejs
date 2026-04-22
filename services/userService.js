const User = require('../models/userModel');
const PasswordReset = require('../models/passwordResetModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { resetPasswordTemplate } = require('../utils/emailTemplates');
const pool = require('../config/db');

// Cấu hình Mailer
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT == 465,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

// 🟢 HÀM ĐÚC CHÌA KHÓA TỔNG HỢP (Private Helper)
const generateTokens = async (user) => {
    // 1. Access Token sống ngắn (15 phút) - Dùng để ra vào các cửa
    const accessToken = jwt.sign(
        { id: user.id, username: user.username, roles: user.roles }, 
        process.env.JWT_SECRET, 
        { expiresIn: '10s' }
    );

    // 2. Refresh Token sống dài (7 ngày) - Dùng để xin cấp lại Access Token
    const refreshToken = jwt.sign(
        { id: user.id }, 
        process.env.JWT_REFRESH_SECRET, // Nhớ thêm biến này vào file .env
        { expiresIn: '4h' }
    );

    // 3. Lưu vào DB để quản lý Rotation (Xoay vòng bảo mật)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, refreshToken, expiresAt]
    );

    return { accessToken, refreshToken };
};

const userService = {
    // 🟢 LOGIN: Bây giờ trả về cả 2 loại chìa khóa
    login: async (username, password) => {
        const user = await User.getByUsername(username);
        if (!user) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        if (user.status === 0) throw new Error('Tài khoản đã bị khóa');

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');

        // 🔥 Gọi hàm đúc cặp chìa khóa mới
        const { accessToken, refreshToken } = await generateTokens(user);

        const { password: _, ...userInfo } = user;
        return { user: userInfo, accessToken, refreshToken };
    },

    // 🟢 HÀM REFRESH: Dùng để đổi Access Token mới mà không cần đăng nhập lại
    refresh: async (rfToken) => {
        try {
            // 1. Kiểm tra Token có tồn tại trong DB không
            const [rows] = await pool.query('SELECT * FROM refresh_tokens WHERE token = ?', [rfToken]);
            
            if (rows.length === 0) {
                // 🚩 PHÁT HIỆN XÂM NHẬP: Token này không có trong máy hoặc đã bị dùng trộm
                const decoded = jwt.decode(rfToken);
                if (decoded) {
                    // Hủy sạch mọi phiên làm việc của user này để bảo mật
                    await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [decoded.id]);
                }
                throw new Error('Cảnh báo bảo mật: Phiên làm việc không hợp lệ!');
            }

            // 2. Xác thực JWT (Chữ ký và thời hạn)
            const decoded = jwt.verify(rfToken, process.env.JWT_REFRESH_SECRET);

            // 3. XOAY VÒNG: Xóa token cũ, lấy user mới và đúc cặp mới tinh
            await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [rfToken]);
            const user = await User.getById(decoded.id);
            if (!user) throw new Error('Người dùng không tồn tại');

            return await generateTokens(user);
        } catch (error) {
            throw new Error(error.message || 'Phiên làm việc hết hạn');
        }
    },

    // 🟢 FORGOT PASSWORD: Giữ nguyên logic thép
    forgotPassword: async (identifier) => {
        const user = await User.getByIdentifier(identifier);
        if (!user) throw new Error('Lỗi: Không có tài khoản nào với tên người dùng hoặc địa chỉ email đó.');

        const [configRows] = await pool.query("SELECT site_name FROM config LIMIT 1");
        const siteName = configRows[0]?.site_name || "TÂN NGỌC LỰC STEEL";
        const logoUrl = "https://tanngocluc.com.vn/wp-content/uploads/2025/06/logo.png";

        const email = user.email;
        await PasswordReset.deleteByEmail(email);
        const token = await PasswordReset.create(email, 5);

        const baseUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
        const resetLink = `${baseUrl}/reset-password?token=${token}`;
        const htmlContent = resetPasswordTemplate(user.name, user.username, resetLink, siteName, logoUrl);

        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: email,
            subject: `[${siteName}] XÁC THỰC PHỤC HỒI MẬT MÃ`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        return true;
    },

    // --- CÁC HÀM CRUD GIỮ NGUYÊN ---
    index: async (filters) => await User.getAll(filters),
    show: async (id) => await User.getById(id),
    resetPassword: async (token, newPassword) => {
        const record = await PasswordReset.verify(token);
        if (!record) throw new Error('Token không hợp lệ hoặc đã hết hạn');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await User.getByEmail(record.email);
        if (user) {
            await User.updatePassword(user.id, hashedPassword);
            await PasswordReset.deleteByToken(token);
        }
    },
    changePassword: async (id, oldPassword, newPassword) => {
        const user = await User.getByIdWithPassword(id);
        if (!user || !(await bcrypt.compare(oldPassword, user.password))) throw new Error('Mật khẩu không đúng');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(id, hashedPassword);
    },
    store: async (data, createdBy) => {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return await User.create({ ...data, password: hashedPassword, roles: 'admin', created_by: createdBy });
    },
    update: async (id, data) => {
        if (data.password) data.password = await bcrypt.hash(data.password, 10);
        const affected = await User.update(id, data);
        if (!affected) throw new Error('Cập nhật thất bại');
    },
    destroy: async (id) => {
        const affected = await User.delete(id);
        if (!affected) throw new Error('Xóa thất bại');
    }
};

module.exports = userService;