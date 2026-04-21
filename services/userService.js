const User = require('../models/userModel');
const PasswordReset = require('../models/passwordResetModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { resetPasswordTemplate } = require('../utils/emailTemplates');
const pool = require('../config/db');
const logoUrl = "https://tanngocluc.com.vn/wp-content/uploads/2025/06/logo.png";
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT == 465,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const userService = {
    index: async (filters) => {
        return await User.getAll(filters);
    },

    show: async (id) => {
        return await User.getById(id);
    },

    login: async (username, password) => {
        const user = await User.getByUsername(username);
        if (!user) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        if (user.status === 0) throw new Error('Tài khoản đã bị khóa');
        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
        const token = jwt.sign(
            { id: user.id, username: user.username, roles: user.roles },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        const { password: _, ...userInfo } = user;
        return { user: userInfo, token };
    },

    changePassword: async (id, oldPassword, newPassword) => {
        const user = await User.getByIdWithPassword(id);
        if (!user) throw new Error('Không tìm thấy người dùng');
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) throw new Error('Mật khẩu cũ không đúng');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(id, hashedPassword);
    },

    forgotPassword: async (identifier) => {
        // 1. Quét User: Tìm xem có ông nào tên đó không
        const user = await User.getByIdentifier(identifier);
        if (!user) throw new Error('Lỗi: Không có tài khoản nào với tên người dùng hoặc địa chỉ email đó.');

        // 2. Lấy Config: Bốc tên công ty từ Database
        const [configRows] = await pool.query("SELECT site_name FROM config LIMIT 1");
        const siteName = configRows[0]?.site_name || "TÂN NGỌC LỰC STEEL";

        // 3. Xử lý Logo: Dùng cái link HTTPS con vừa gửi cho "nét"
        const logoUrl = "https://tanngocluc.com.vn/wp-content/uploads/2025/06/logo.png";

        // 4. Xử lý Password Reset: Xóa cũ, tạo mới
        const email = user.email;
        await PasswordReset.deleteByEmail(email);

        // 🔥 Tạo token kèm thời gian 5 phút (Nhớ sửa Model như má dặn nhé)
        const token = await PasswordReset.create(email, 5);

        // 5. Tạo Link Reset: Phải tạo link XONG mới làm Template
        const baseUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        // 6. Đổ dữ liệu vào Template: Giờ thì resetLink đã có thực rồi!
        const htmlContent = resetPasswordTemplate(user.name, user.username, resetLink, siteName, logoUrl);

        // 7. Gửi Mail
        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: email,
            subject: `[${siteName}] XÁC THỰC PHỤC HỒI MẬT MÃ`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        return true;
    },


    resetPassword: async (token, newPassword) => {
        const record = await PasswordReset.verify(token);
        if (!record) throw new Error('Token không hợp lệ hoặc đã hết hạn');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await User.getByEmail(record.email);
        if (!user) throw new Error('Người dùng không tồn tại');
        await User.updatePassword(user.id, hashedPassword);
        await PasswordReset.deleteByToken(token);
    },

    store: async (data, createdBy) => {
        if (!data.name || !data.email || !data.username || !data.password) {
            throw new Error('Vui lòng nhập đầy đủ thông tin');
        }
        if (await User.emailExists(data.email)) {
            throw new Error('Email đã được sử dụng');
        }
        if (await User.usernameExists(data.username)) {
            throw new Error('Tên đăng nhập đã tồn tại');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return await User.create({
            ...data,
            password: hashedPassword,
            roles: 'admin',
            created_by: createdBy
        });
    },

    update: async (id, data, currentUserId) => {
        if (data.email) {
            const exists = await User.emailExists(data.email, id);
            if (exists) throw new Error('Email đã được sử dụng');
        }
        if (data.username) {
            const exists = await User.usernameExists(data.username, id);
            if (exists) throw new Error('Tên đăng nhập đã tồn tại');
        }
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        const affected = await User.update(id, data);
        if (!affected) throw new Error('Không tìm thấy người dùng');
    },

    destroy: async (id) => {
        const affected = await User.delete(id);
        if (!affected) throw new Error('Không tìm thấy người dùng');
    }
};

module.exports = userService;