// models/orderModel.js
const pool = require('../config/db');

const Order = {
    getAll: async (filters = {}) => {
        let sql = `SELECT o.*, u.name as user_name, u.email as user_email 
                   FROM \`order\` o 
                   LEFT JOIN user u ON o.user_id = u.id 
                   WHERE 1=1`;
        const params = [];
        if (filters.status !== undefined) {
            sql += ` AND o.status = ?`;
            params.push(filters.status);
        }
        if (filters.user_id) {
            sql += ` AND o.user_id = ?`;
            params.push(filters.user_id);
        }
        if (filters.payment_status) {
            sql += ` AND o.payment_status = ?`;
            params.push(filters.payment_status);
        }
        if (filters.from_date) {
            sql += ` AND DATE(o.created_at) >= ?`;
            params.push(filters.from_date);
        }
        if (filters.to_date) {
            sql += ` AND DATE(o.created_at) <= ?`;
            params.push(filters.to_date);
        }
        sql += ` ORDER BY o.created_at DESC`;
        if (filters.limit) {
            sql += ` LIMIT ?`;
            params.push(parseInt(filters.limit));
            if (filters.offset) {
                sql += ` OFFSET ?`;
                params.push(parseInt(filters.offset));
            }
        }
        const [rows] = await pool.query(sql, params);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query(
            `SELECT o.*, u.name as user_name, u.email as user_email 
             FROM \`order\` o 
             LEFT JOIN user u ON o.user_id = u.id 
             WHERE o.id = ?`,
            [id]
        );
        return rows[0];
    },

    getDetails: async (orderId) => {
        const [rows] = await pool.query(
            `SELECT od.*, p.name as product_name, p.slug, p.thumbnail 
             FROM order_detail od 
             LEFT JOIN product p ON od.product_id = p.id 
             WHERE od.order_id = ?`,
            [orderId]
        );
        return rows;
    },

    create: async (data) => {
        const { user_id, name, email, phone, address, note, payment_method = 'cod', created_by = null } = data;
        const [result] = await pool.query(
            `INSERT INTO \`order\` (user_id, name, email, phone, address, note, payment_method, payment_status, created_at, created_by, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), ?, 1)`,
            [user_id, name, email, phone, address, note || null, payment_method, created_by || user_id]
        );
        return result.insertId;
    },

    createDetail: async (orderId, detail) => {
        const { product_id, price, qty, amount, discount = 0 } = detail;
        await pool.query(
            `INSERT INTO order_detail (order_id, product_id, price, qty, amount, discount)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, product_id, price, qty, amount, discount]
        );
    },

    update: async (id, data) => {
        const fields = [];
        const values = [];
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        });
        if (fields.length === 0) return 0;
        values.push(id);
        const [result] = await pool.query(
            `UPDATE \`order\` SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },

    updateStatus: async (id, status) => {
        const [result] = await pool.query(
            `UPDATE \`order\` SET status = ?, updated_at = NOW() WHERE id = ?`,
            [status, id]
        );
        return result.affectedRows;
    },

    updatePaymentStatus: async (id, payment_status, paid_at = null) => {
        const [result] = await pool.query(
            `UPDATE \`order\` SET payment_status = ?, paid_at = ?, updated_at = NOW() WHERE id = ?`,
            [payment_status, paid_at || (payment_status === 'paid' ? new Date() : null), id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query(`UPDATE \`order\` SET status = 5 WHERE id = ?`, [id]);
        return result.affectedRows;
    },

    getTotalAmount: async (orderId) => {
        const [rows] = await pool.query(
            `SELECT SUM(amount) as total FROM order_detail WHERE order_id = ?`,
            [orderId]
        );
        return rows[0].total || 0;
    }
};

module.exports = Order;