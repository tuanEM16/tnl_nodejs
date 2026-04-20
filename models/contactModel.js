const pool = require('../config/db');
const Contact = {
    getAll: async (filters = {}) => {
        let sql = `SELECT * FROM contact WHERE 1=1`;
        const params = [];


        if (filters.keyword) {
            sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
            const searchPattern = `%${filters.keyword}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }


        if (filters.status !== undefined && filters.status !== '') {
            sql += ` AND status = ?`;
            params.push(filters.status);
        }

        sql += ` ORDER BY created_at DESC`;


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
        const [rows] = await pool.query(`SELECT * FROM contact WHERE id = ?`, [id]);
        return rows[0];
    },

    create: async (data) => {
        const { name, email, phone, content, reply_id = 0 } = data;
        const [result] = await pool.query(
            `INSERT INTO contact (name, email, phone, content, reply_id, created_at, status)
             VALUES (?, ?, ?, ?, ?, NOW(), 0)`,
            [name, email || null, phone, content, reply_id]
        );
        return result.insertId;
    },

    updateStatus: async (id, status) => {
        const [result] = await pool.query(
            `UPDATE contact SET status = ?, updated_at = NOW() WHERE id = ?`,
            [status, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query(`DELETE FROM contact WHERE id = ?`, [id]);
        return result.affectedRows;
    },

    softDelete: async (id) => {
        const [result] = await pool.query(`UPDATE contact SET status = 2 WHERE id = ?`, [id]);
        return result.affectedRows;
    }
};

module.exports = Contact;