// models/partnerModel.js (BACKEND)

const pool = require('../config/db');

const Partner = {
    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM partners ORDER BY sort_order ASC, created_at DESC');
        return rows;
    },
    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM partners WHERE id = ?', [id]);
        return rows[0];
    },
    create: async (data) => {
        const [result] = await pool.query('INSERT INTO partners SET ?', [data]);
        return result.insertId;
    },
    update: async (id, data) => {
        return await pool.query('UPDATE partners SET ? WHERE id = ?', [data, id]);
    },
    delete: async (id) => {
        // Chỉ xóa trong Database thôi, file đã được Service xóa rồi
        const [result] = await pool.query('DELETE FROM partners WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = Partner;