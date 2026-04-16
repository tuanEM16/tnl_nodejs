const pool = require('../config/db');

const Category = {
    getAll: async (parentId = null, status = 1) => {
        let sql = `SELECT * FROM category WHERE status = ?`;
        const params = [status];
        if (parentId !== null) {
            sql += ` AND parent_id = ?`;
            params.push(parentId);
        }
        sql += ` ORDER BY sort_order ASC, created_at DESC`;
        const [rows] = await pool.query(sql, params);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM category WHERE id = ?`, [id]);
        return rows[0];
    },

    getBySlug: async (slug) => {
        const [rows] = await pool.query(`SELECT * FROM category WHERE slug = ? AND status = 1`, [slug]);
        return rows[0];
    },

    getChildren: async (parentId) => {
        const [rows] = await pool.query(
            `SELECT * FROM category WHERE parent_id = ? AND status = 1 ORDER BY sort_order ASC`,
            [parentId]
        );
        return rows;
    },

    create: async (data) => {
        const { name, slug, image, parent_id = 0, sort_order = 0, description, created_by = 1 } = data;
        const [result] = await pool.query(
            `INSERT INTO category (name, slug, image, parent_id, sort_order, description, created_at, created_by, status)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, 1)`,
            [name, slug, image || null, parent_id, sort_order, description || null, created_by]
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
            `UPDATE category SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query(`UPDATE category SET status = 0 WHERE id = ?`, [id]);
        return result.affectedRows;
    },

    slugExists: async (slug, excludeId = null) => {
        let sql = `SELECT id FROM category WHERE slug = ?`;
        const params = [slug];
        if (excludeId) {
            sql += ` AND id != ?`;
            params.push(excludeId);
        }
        const [rows] = await pool.query(sql, params);
        return rows.length > 0;
    }
};

module.exports = Category;