// models/userModel.js
const pool = require('../config/db');

const User = {
    getAll: async (filters = {}) => {
        let sql = `SELECT id, name, email, phone, username, roles, avatar, created_at, status FROM user WHERE 1=1`;
        const params = [];
        if (filters.status !== undefined) {
            sql += ` AND status = ?`;
            params.push(filters.status);
        }
        if (filters.roles) {
            sql += ` AND roles = ?`;
            params.push(filters.roles);
        }
        if (filters.keyword) {
            sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
            const kw = `%${filters.keyword}%`;
            params.push(kw, kw, kw);
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
        const [rows] = await pool.query(
            `SELECT id, name, email, phone, username, roles, avatar, created_at, status FROM user WHERE id = ?`,
            [id]
        );
        return rows[0];
    },

    // Hàm mới: lấy user kèm password (dùng cho đổi mật khẩu, login)
    getByIdWithPassword: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM user WHERE id = ?`, [id]);
        return rows[0];
    },

    getByEmail: async (email) => {
        const [rows] = await pool.query(`SELECT * FROM user WHERE email = ?`, [email]);
        return rows[0];
    },

    getByUsername: async (username) => {
        const [rows] = await pool.query(`SELECT * FROM user WHERE username = ?`, [username]);
        return rows[0];
    },

    create: async (data) => {
        const { name, email, phone, username, password, roles = 'customer', avatar = null, created_by = null } = data;
        const [result] = await pool.query(
            `INSERT INTO user (name, email, phone, username, password, roles, avatar, created_at, created_by, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, 1)`,
            [name, email, phone, username, password, roles, avatar, created_by || 1]
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
            `UPDATE user SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },

    updatePassword: async (id, hashedPassword) => {
        const [result] = await pool.query(
            `UPDATE user SET password = ?, updated_at = NOW() WHERE id = ?`,
            [hashedPassword, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query(`UPDATE user SET status = 0 WHERE id = ?`, [id]);
        return result.affectedRows;
    },

    emailExists: async (email, excludeId = null) => {
        let sql = `SELECT id FROM user WHERE email = ?`;
        const params = [email];
        if (excludeId) {
            sql += ` AND id != ?`;
            params.push(excludeId);
        }
        const [rows] = await pool.query(sql, params);
        return rows.length > 0;
    },

    usernameExists: async (username, excludeId = null) => {
        let sql = `SELECT id FROM user WHERE username = ?`;
        const params = [username];
        if (excludeId) {
            sql += ` AND id != ?`;
            params.push(excludeId);
        }
        const [rows] = await pool.query(sql, params);
        return rows.length > 0;
    }
};

module.exports = User;