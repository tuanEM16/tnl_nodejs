const pool = require('../config/db');

const Attribute = {
    getAll: async () => {
        const [rows] = await pool.query(
            `SELECT * FROM attribute WHERE status = 1 ORDER BY sort_order ASC`
        );
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM attribute WHERE id = ?`, [id]);
        return rows[0];
    },

    create: async (data) => {
        const { name, sort_order = 0 } = data;
        const [result] = await pool.query(
            `INSERT INTO attribute (name, sort_order, created_at, status) VALUES (?, ?, NOW(), 1)`,
            [name, sort_order]
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
            `UPDATE attribute SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query(`UPDATE attribute SET status = 0 WHERE id = ?`, [id]);
        return result.affectedRows;
    }
};

module.exports = Attribute;