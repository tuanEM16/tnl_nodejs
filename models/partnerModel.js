const pool = require('../config/db');
const { deleteFile } = require('../utils/fileHelpers');
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
    destroy: async (id) => {
        const [rows] = await pool.query('SELECT logo FROM partners WHERE id = ?', [id]);
        const item = rows[0];

        if (item && item.logo) {
            await deleteFile(item.logo);
        }

        const [result] = await pool.query('DELETE FROM partners WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
    updateOrder: async (ids) => {
        const queries = ids.map((id, index) =>
            pool.query('UPDATE partners SET sort_order = ? WHERE id = ?', [index, id])
        );
        return await Promise.all(queries);
    }
};

module.exports = Partner;