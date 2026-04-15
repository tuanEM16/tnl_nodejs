// controllers/orderController.js
const orderService = require('../services/orderService');

const orderController = {
    index: async (req, res) => {
        try {
            const filters = {
                status: req.query.status,
                user_id: req.query.user_id || (req.user ? req.user.id : null),
                payment_status: req.query.payment_status,
                from_date: req.query.from_date,
                to_date: req.query.to_date,
                limit: req.query.limit || 20,
                offset: req.query.offset || 0
            };
            const data = await orderService.index(filters);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    store: async (req, res) => {
        try {
            const orderData = {
                ...req.body,
                user_id: req.user ? req.user.id : null
            };
            const result = await orderService.store(orderData, req.body.items);
            res.status(201).json({ 
                success: true, 
                message: 'Đặt hàng thành công', 
                order_id: result.orderId,
                total_amount: result.totalAmount
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    show: async (req, res) => {
        try {
            const data = await orderService.show(req.params.id);
            if (!data) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
            }
            if (req.user && req.user.roles !== 'admin' && data.user_id !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Bạn không có quyền xem đơn hàng này' });
            }
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    update: async (req, res) => {
        try {
            await orderService.update(req.params.id, req.body);
            res.status(200).json({ success: true, message: 'Cập nhật đơn hàng thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateStatus: async (req, res) => {
        try {
            await orderService.updateStatus(req.params.id, req.body.status);
            res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updatePaymentStatus: async (req, res) => {
        try {
            await orderService.updatePaymentStatus(req.params.id, req.body.payment_status);
            res.status(200).json({ success: true, message: 'Cập nhật trạng thái thanh toán thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    cancel: async (req, res) => {
        try {
            await orderService.cancel(req.params.id);
            res.status(200).json({ success: true, message: 'Hủy đơn hàng thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    destroy: async (req, res) => {
        try {
            await orderService.destroy(req.params.id);
            res.status(200).json({ success: true, message: 'Xóa đơn hàng thành công' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = orderController;