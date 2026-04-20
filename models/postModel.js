const pool = require('../config/db');

const Post = {
    getAll: async (filters = {}) => {
        let sql = `SELECT p.*, pc.name as category_name, pc.slug as category_slug 
                   FROM post p 
                   LEFT JOIN post_category pc ON p.category_id = pc.id 
                   WHERE p.status = 1`;
        const params = [];
        if (filters.post_type) {
            sql += ` AND p.post_type = ?`;
            params.push(filters.post_type);
        }
        if (filters.category_id) {
            sql += ` AND p.category_id = ?`;
            params.push(filters.category_id);
        }
        if (filters.keyword) {
            sql += ` AND p.title LIKE ?`;
            params.push(`%${filters.keyword}%`);
        }
        sql += ` ORDER BY p.created_at DESC`;
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
            `SELECT p.*, pc.name as category_name, pc.slug as category_slug 
             FROM post p 
             LEFT JOIN post_category pc ON p.category_id = pc.id 
             WHERE p.id = ?`,
            [id]
        );
        return rows[0];
    },

    getBySlug: async (slug) => {
        const [rows] = await pool.query(
            `SELECT p.*, pc.name as category_name, pc.slug as category_slug 
             FROM post p 
             LEFT JOIN post_category pc ON p.category_id = pc.id 
             WHERE p.slug = ? AND p.status = 1`,
            [slug]
        );
        return rows[0];
    },

    create: async (data) => {
        const { category_id, title, slug, image, content, description, post_type = 'post', created_by = 1 } = data;
        const [result] = await pool.query(
            `INSERT INTO post (category_id, title, slug, image, content, description, post_type, created_at, created_by, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, 1)`,
            [category_id || null, title, slug, image || null, content, description || null, post_type, created_by]
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
        const sql = `UPDATE post SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        const [result] = await pool.query(sql, values);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query(`UPDATE post SET status = 0 WHERE id = ?`, [id]);
        return result.affectedRows;
    },

    slugExists: async (slug, excludeId = null) => {
        let sql = `SELECT id FROM post WHERE slug = ?`;
        const params = [slug];
        if (excludeId) {
            sql += ` AND id != ?`;
            params.push(excludeId);
        }
        const [rows] = await pool.query(sql, params);
        return rows.length > 0;
    }
};

module.exports = Post;