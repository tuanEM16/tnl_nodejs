const pool = require('../config/db');
const Menu = {
    getAll: async (position = null) => {
        let sql = `SELECT * FROM menu WHERE status = 1`;
        const params = [];
        if (position) {
            sql += ` AND position = ?`;
            params.push(position);
        }
        sql += ` ORDER BY parent_id ASC, sort_order ASC, created_at DESC`;
        const [rows] = await pool.query(sql, params);
        return rows;
    },
    getById: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM menu WHERE id = ?`, [id]);
        return rows[0];
    },
    getChildren: async (parentId) => {
        const [rows] = await pool.query(
            `SELECT * FROM menu WHERE parent_id = ? AND status = 1 ORDER BY sort_order ASC`,
            [parentId]
        );
        return rows;
    },
    create: async (data) => {
        const { name, link, type, parent_id = 0, sort_order = 0, table_id = null, position = 'mainmenu', created_by = 1 } = data;
        const [result] = await pool.query(
            `INSERT INTO menu (name, link, type, parent_id, sort_order, table_id, position, created_at, created_by, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, 1)`,
            [name, link, type, parent_id, sort_order, table_id, position, created_by]
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
            `UPDATE menu SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },
    delete: async (id) => {
        const [result] = await pool.query(`UPDATE menu SET status = 0 WHERE id = ?`, [id]);
        return result.affectedRows;
    },
    hardDelete: async (id) => {
        const [result] = await pool.query(`DELETE FROM menu WHERE id = ?`, [id]);
        return result.affectedRows;
    }
};
module.exports = Menu;