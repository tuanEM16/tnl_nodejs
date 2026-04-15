const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const orderService = {
    index: async (filters) => {
        return await Order.getAll(filters);
    },
    show: async (id) => {
        const order = await Order.getById(id);
        if (!order) return null;
        order.details = await Order.getDetails(id);
        return order;
    },
    store: async (data, items) => {
        const orderId = await Order.create(data);
        let totalAmount = 0;
        for (const item of items) {
            const amount = item.price * item.qty - (item.discount || 0);
            totalAmount += amount;
            await Order.createDetail(orderId, {
                product_id: item.product_id,
                price: item.price,
                qty: item.qty,
                amount: amount,
                discount: item.discount || 0
            });
            await Product.updateStoreQuantity(item.product_id, -item.qty);
        }
        return { orderId, totalAmount };
    },
    update: async (id, data) => {
        const affected = await Order.update(id, data);
        if (!affected) throw new Error('Không tìm thấy đơn hàng');
    },
    updateStatus: async (id, status) => {
        const affected = await Order.updateStatus(id, status);
        if (!affected) throw new Error('Không tìm thấy đơn hàng');
    },
    updatePaymentStatus: async (id, payment_status) => {
        const affected = await Order.updatePaymentStatus(id, payment_status);
        if (!affected) throw new Error('Không tìm thấy đơn hàng');
    },
    cancel: async (id) => {
        const order = await Order.getById(id);
        if (!order) throw new Error('Không tìm thấy đơn hàng');
        if (order.status >= 3) throw new Error('Không thể hủy đơn hàng đang giao hoặc đã giao');
        await Order.updateStatus(id, 5);
        const details = await Order.getDetails(id);
        for (const item of details) {
            await Product.updateStoreQuantity(item.product_id, item.qty);
        }
    },
    destroy: async (id) => {
        const affected = await Order.delete(id);
        if (!affected) throw new Error('Không tìm thấy đơn hàng');
    }
};
module.exports = orderService;