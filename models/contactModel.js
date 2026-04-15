const pool = require('../config/db');
const Contact = {
    getAll: async (filters = {}) => {
        let sql = `SELECT c.*, u.name as user_name, u.email as user_email 
                   FROM contact c 
                   LEFT JOIN user u ON c.user_id = u.id 
                   WHERE 1=1`;
        const params = [];
        if (filters.status !== undefined) {
            sql += ` AND c.status = ?`;
            params.push(filters.status);
        }
        if (filters.user_id) {
            sql += ` AND c.user_id = ?`;
            params.push(filters.user_id);
        }
        sql += ` ORDER BY c.created_at DESC`;
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
            `SELECT c.*, u.name as user_name, u.email as user_email 
             FROM contact c 
             LEFT JOIN user u ON c.user_id = u.id 
             WHERE c.id = ?`,
            [id]
        );
        return rows[0];
    },
    getReplies: async (contactId) => {
        const [rows] = await pool.query(
            `SELECT c.*, u.name as user_name 
             FROM contact c 
             LEFT JOIN user u ON c.created_by = u.id 
             WHERE c.reply_id = ? 
             ORDER BY c.created_at ASC`,
            [contactId]
        );
        return rows;
    },
    create: async (data) => {
        const { user_id, name, email, phone, content, reply_id = 0, created_by = null } = data;
        const [result] = await pool.query(
            `INSERT INTO contact (user_id, name, email, phone, content, reply_id, created_at, created_by, status)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 1)`,
            [user_id || null, name, email, phone, content, reply_id, created_by || 1]
        );
        return result.insertId;
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
            `UPDATE contact SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },
    updateStatus: async (id, status) => {
        const [result] = await pool.query(
            `UPDATE contact SET status = ?, updated_at = NOW() WHERE id = ?`,
            [status, id]
        );
        return result.affectedRows;
    },
    delete: async (id) => {
        const [result] = await pool.query(`UPDATE contact SET status = 0 WHERE id = ?`, [id]);
        return result.affectedRows;
    }
};
module.exports = Contact;