// services/userService.js
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userService = {
    index: async (filters) => {
        return await User.getAll(filters);
    },

    show: async (id) => {
        return await User.getById(id);
    },

    register: async (data) => {
        if (!data.name || !data.email || !data.phone || !data.username || !data.password) {
            throw new Error('Vui lòng nhập đầy đủ thông tin');
        }
        if (await User.emailExists(data.email)) {
            throw new Error('Email đã được sử dụng');
        }
        if (await User.usernameExists(data.username)) {
            throw new Error('Tên đăng nhập đã tồn tại');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const userData = {
            ...data,
            password: hashedPassword,
            roles: 'customer'
        };
        return await User.create(userData);
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
        // Sửa: dùng hàm có trả về password
        const user = await User.getByIdWithPassword(id);
        if (!user) throw new Error('Không tìm thấy người dùng');
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) throw new Error('Mật khẩu cũ không đúng');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(id, hashedPassword);
    },

    update: async (id, data) => {
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