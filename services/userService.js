const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = {
    login: async (username, password) => {
        const user = await userModel.findByUsername(username);
        if (!user) throw new Error("Tài khoản không tồn tại!");
        if (user.status !== 1) throw new Error("Tài khoản đang bị khóa!");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Mật khẩu không đúng!");
        const token = jwt.sign(
            { id: user.id, role: user.roles },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );
        return { token, user: { name: user.name, role: user.roles } };
    }
};
module.exports = userService;