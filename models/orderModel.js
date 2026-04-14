const db = require('../config/db');
const orderModel = {
    create: async (data, connection) => {
        const sql = `INSERT INTO \`order\` (user_id, name, email, phone, address, note, created_at, created_by, status) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 1)`;
        const executor = connection || db;
        const [res] = await executor.execute(sql, [data.user_id, data.name, data.email, data.phone, data.address, data.note, data.user_id]);
        return res.insertId;
    },
    insertDetails: async (orderId, cartItems, connection) => {
        const values = cartItems.map(item => [orderId, item.product_id, item.price, item.qty, item.price * item.qty, item.discount || 0]);
        const sql = `INSERT INTO order_detail (order_id, product_id, price, qty, amount, discount) VALUES ?`;
        const executor = connection || db;
        await executor.query(sql, [values]);
    }
};
module.exports = orderModel;