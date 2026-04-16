const User = require('../models/userModel');
const PasswordReset = require('../models/passwordResetModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

    forgotPassword: async (email) => {
        const user = await User.getByEmail(email);
        if (!user) throw new Error('Email không tồn tại trong hệ thống');

        // Xóa token cũ
        await PasswordReset.deleteByEmail(email);

        // Tạo token mới
        const token = await PasswordReset.create(email);
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        // Gửi email
        const mailOptions = {
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Đặt lại mật khẩu - Website Thép Xây Dựng',
            html: `
                <h3>Yêu cầu đặt lại mật khẩu</h3>
                <p>Nhấn vào link bên dưới để đặt lại mật khẩu của bạn. Link có hiệu lực trong 15 phút.</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
            `
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