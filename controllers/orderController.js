const orderService = require('../services/orderService');
const orderController = {
    checkout: async (req, res) => {
        try {
            const order = await orderService.createOrder(req.body);
            res.status(201).json({ success: true, message: "Đặt hàng thành công", orderId: order.id });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    list: async (req, res) => {
        try {
            const orders = await orderService.getAllOrders();
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
module.exports = orderController;