const pool = require('../config/db');

const Banner = {
    getAll: async (page = null) => {
        let sql = `SELECT * FROM banner WHERE status = 1`;
        const params = [];
        if (page) {
            sql += ` AND page = ?`;
            params.push(page);
        }
        sql += ` ORDER BY sort_order ASC, created_at DESC`;
        const [rows] = await pool.query(sql, params);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM banner WHERE id = ?`, [id]);
        return rows[0];
    },

    create: async (data) => {
        const { name, image, link, page, sort_order, description, created_by = 1 } = data;
        const [result] = await pool.query(
            `INSERT INTO banner (name, image, link, page, sort_order, description, created_at, created_by, status)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 1)`,
            [name, image, link || null, page || 'home', sort_order || 0, description || null, created_by]
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
            `UPDATE banner SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query(`UPDATE banner SET status = 0 WHERE id = ?`, [id]);
        return result.affectedRows;
    }
};

module.exports = Banner;