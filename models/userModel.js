const pool = require('../config/db');

const User = {
    // models/userModel.js

    getAll: async (filters = {}) => {
        // 1. Khai báo 2 câu lệnh gốc
        let sql = `SELECT id, name, email, phone, username, roles, avatar, created_at,updated_at, status FROM user`;
        let countSql = `SELECT COUNT(*) as total FROM user`;

        // 2. Tạo phần điều kiện (WHERE) chung
        let whereClause = ` WHERE status != 0`; // Mặc định không lấy những người đã bị xóa (Soft Delete)
        const params = [];

        // Lọc theo trạng thái (nếu có truyền vào)
        if (filters.status !== undefined && filters.status !== '') {
            whereClause += ` AND status = ?`;
            params.push(filters.status);
        }

        // Lọc theo từ khóa (Search)
        if (filters.keyword) {
            whereClause += ` AND (name LIKE ? OR email LIKE ? OR username LIKE ?)`;
            const kw = `%${filters.keyword}%`;
            params.push(kw, kw, kw);
        }

        // 3. 🟢 Ráp phần WHERE vào cả 2 câu SQL
        sql += whereClause;
        countSql += whereClause;

        // 4. Lấy TỔNG SỐ trước (Dùng chung params đã bốc ở trên)
        const [totalRows] = await pool.query(countSql, params);
        const total = totalRows[0].total;

        // 5. Thêm Sắp xếp và Phân trang (Chỉ dành cho câu lệnh lấy dữ liệu)
        sql += ` ORDER BY created_at DESC`;

        if (filters.limit) {
            sql += ` LIMIT ?`;
            params.push(parseInt(filters.limit));

            if (filters.offset) {
                sql += ` OFFSET ?`;
                params.push(parseInt(filters.offset));
            }
        }

        // 6. Thực thi lấy dữ liệu
        const [rows] = await pool.query(sql, params);

        // 7. Trả về cả hai để Frontend làm phân trang
        return {
            data: rows,
            total: total
        };
    },

    getById: async (id) => {
        const [rows] = await pool.query(
            `SELECT id, name, email, phone, username, roles, avatar, created_at,updated_at, status FROM user WHERE id = ?`,
            [id]
        );
        return rows[0];
    },

    getByIdWithPassword: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM user WHERE id = ?`, [id]);
        return rows[0];
    },

    getByUsername: async (username) => {
        const [rows] = await pool.query(`SELECT * FROM user WHERE username = ?`, [username]);
        return rows[0];
    },

    getByEmail: async (email) => {
        const [rows] = await pool.query(`SELECT * FROM user WHERE email = ?`, [email]);
        return rows[0];
    },

    create: async (data) => {
        const { name, email, phone, username, password, roles = 'admin', avatar = null, created_by = null } = data;
        const [result] = await pool.query(
            `INSERT INTO user (name, email, phone, username, password, roles, avatar, created_at, created_by, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, 1)`,
            [name, email, phone || null, username, password, roles, avatar || null, created_by]
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
    getByIdentifier: async (identifier) => {
        const [rows] = await pool.query(
            "SELECT * FROM user WHERE (email = ? OR username = ?) AND status != 0 LIMIT 1",
            [identifier, identifier]
        );
        return rows.length > 0 ? rows[0] : null;
    },
    updatePassword: async (id, hashedPassword) => {
        const [result] = await pool.query(
            `UPDATE user SET password = ?, updated_at = NOW() WHERE id = ?`,
            [hashedPassword, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query(`DELETE FROM user WHERE id = ?`, [id]);
        return result.affectedRows;
    },
    hardDelete: async (id) => {
        const [result] = await pool.query(`DELETE FROM user WHERE id = ?`, [id]);
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