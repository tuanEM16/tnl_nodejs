const pool = require('../config/db');
const Banner = {
    getAll: async (position = null) => {
        let sql = `SELECT * FROM banner WHERE status = 1`;
        const params = [];
        if (position) {
            sql += ` AND position = ?`;
            params.push(position);
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
        const { name, image, link, position, sort_order, description, created_by = 1 } = data;
        const [result] = await pool.query(
            `INSERT INTO banner (name, image, link, position, sort_order, description, created_at, created_by, status)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 1)`,
            [name, image, link, position, sort_order, description, created_by]
        );
        return result.insertId;
    },
    update: async (id, data) => {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = Object.values(data);
        values.push(id);
        const [result] = await pool.query(`UPDATE banner SET ${fields}, updated_at = NOW() WHERE id = ?`, values);
        return result.affectedRows;
    },
    delete: async (id) => {
        const [result] = await pool.query(`UPDATE banner SET status = 0 WHERE id = ?`, [id]);
        return result.affectedRows;
    }
};
module.exports = Banner;