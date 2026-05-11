const pool = require('../config/db');

const PostCategory = {
    getAll: async () => {
        const [rows] = await pool.query(
            `SELECT * FROM post_category WHERE status = 1 ORDER BY sort_order ASC`
        );
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM post_category WHERE id = ?`, [id]);
        return rows[0];
    },

    create: async (data) => {
        const { name, slug, parent_id = 0 } = data;
        const sort_order = parseInt(data.sort_order ?? 0) || 0;
        const category_id = data.category_id ? parseInt(data.category_id) : null;
        const page_category_id = data.page_category_id ? parseInt(data.page_category_id) : null;
        const [result] = await pool.query(
            `INSERT INTO post_category (name, slug, parent_id, sort_order, created_at, status)
             VALUES (?, ?, ?, ?, NOW(), 1)`,
            [name, slug, parent_id, sort_order]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const fields = [];
        const values = [];

        const allowedColumns = [
            'category_id', 'page_category_id', 'title', 'slug', 'image',
            'content', 'description', 'post_type', 'status', 'sort_order', 'layout'
        ];

        // 🟢 Các cột INTEGER cần parse
        const integerColumns = ['category_id', 'page_category_id', 'sort_order', 'status'];

        Object.keys(data).forEach(key => {
            if (allowedColumns.includes(key) && data[key] !== undefined) {
                fields.push(`${key} = ?`);

                if (integerColumns.includes(key)) {
                    // 🟢 Nếu rỗng/null => null, ngược lại parseInt
                    const val = data[key] === '' || data[key] === null
                        ? null
                        : parseInt(data[key], 10);
                    values.push(val);
                } else {
                    values.push(data[key]);
                }
            }
        });

        if (fields.length === 0) return 0;

        values.push(id);
        const sql = `UPDATE post SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        const [result] = await pool.query(sql, values);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query(`UPDATE post_category SET status = 0 WHERE id = ?`, [id]);
        return result.affectedRows;
    },

    slugExists: async (slug, excludeId = null) => {
        let sql = `SELECT id FROM post_category WHERE slug = ?`;
        const params = [slug];
        if (excludeId) {
            sql += ` AND id != ?`;
            params.push(excludeId);
        }
        const [rows] = await pool.query(sql, params);
        return rows.length > 0;
    }
};

module.exports = PostCategory;