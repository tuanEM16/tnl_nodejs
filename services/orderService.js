const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const db = require('../config/db');
const orderService = {
    processCheckout: async (orderData) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();
        try {
            const orderId = await orderModel.create(orderData, connection);
            for (const item of orderData.items) {
                const stock = await productModel.checkStock(item.product_id);
                if (stock < item.qty) {
                    throw new Error(`Sản phẩm ID ${item.product_id} không đủ số lượng trong kho!`);
                }
                await orderModel.insertDetail(orderId, item, connection);
                await productModel.updateStock(item.product_id, item.qty, connection);
            }
            await connection.commit();
            return orderId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};
module.exports = orderService;