const userService = require('../services/userService');
const userController = {
    register: async (req, res) => {
        try {
            const user = await userService.registerUser(req.body);
            res.status(201).json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const result = await userService.loginUser(username, password);
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    }
};
module.exports = userController;