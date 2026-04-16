const pool = require('../config/db');

const Product = {
    getAll: async (filters = {}) => {
        let sql = `SELECT p.*, c.name as category_name 
                   FROM product p 
                   LEFT JOIN category c ON p.category_id = c.id 
                   WHERE p.status = 1`;
        const params = [];

        if (filters.category_id) {
            sql += ` AND p.category_id = ?`;
            params.push(filters.category_id);
        }
        if (filters.keyword) {
            sql += ` AND p.name LIKE ?`;
            params.push(`%${filters.keyword}%`);
        }

        if (filters.attributes && Object.keys(filters.attributes).length > 0) {
            const attrConditions = [];
            for (const [attrId, value] of Object.entries(filters.attributes)) {
                attrConditions.push(`(pa.attribute_id = ? AND pa.value = ?)`);
                params.push(attrId, value);
            }
            sql += ` AND p.id IN (
                SELECT pa.product_id FROM product_attribute pa 
                WHERE ${attrConditions.join(' AND ')}
                GROUP BY pa.product_id
                HAVING COUNT(DISTINCT pa.attribute_id) = ?
            )`;
            params.push(Object.keys(filters.attributes).length);
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
            `SELECT p.*, c.name as category_name 
             FROM product p 
             LEFT JOIN category c ON p.category_id = c.id 
             WHERE p.id = ?`,
            [id]
        );
        return rows[0];
    },

    getBySlug: async (slug) => {
        const [rows] = await pool.query(
            `SELECT p.*, c.name as category_name 
             FROM product p 
             LEFT JOIN category c ON p.category_id = c.id 
             WHERE p.slug = ? AND p.status = 1`,
            [slug]
        );
        return rows[0];
    },

    getImages: async (productId) => {
        const [rows] = await pool.query(
            `SELECT * FROM product_image WHERE product_id = ?`,
            [productId]
        );
        return rows;
    },

    getAttributes: async (productId) => {
        const [rows] = await pool.query(
            `SELECT pa.*, a.name as attribute_name 
             FROM product_attribute pa 
             JOIN attribute a ON pa.attribute_id = a.id 
             WHERE pa.product_id = ?`,
            [productId]
        );
        return rows;
    },

    getRelated: async (categoryId, excludeId, limit = 4) => {
        const [rows] = await pool.query(
            `SELECT * FROM product 
             WHERE category_id = ? AND id != ? AND status = 1 
             ORDER BY created_at DESC LIMIT ?`,
            [categoryId, excludeId, limit]
        );
        return rows;
    },

    create: async (data) => {
        const { category_id, name, slug, thumbnail, content, description, standard, application, created_by = 1 } = data;
        const [result] = await pool.query(
            `INSERT INTO product (category_id, name, slug, thumbnail, content, description, standard, application, created_at, created_by, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 1)`,
            [category_id, name, slug, thumbnail, content, description || null, standard || null, application || null, created_by]
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
            `UPDATE product SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.query(`UPDATE product SET status = 0 WHERE id = ?`, [id]);
        return result.affectedRows;
    },

    slugExists: async (slug, excludeId = null) => {
        let sql = `SELECT id FROM product WHERE slug = ?`;
        const params = [slug];
        if (excludeId) {
            sql += ` AND id != ?`;
            params.push(excludeId);
        }
        const [rows] = await pool.query(sql, params);
        return rows.length > 0;
    },

    addImage: async (productId, image, alt = null, title = null) => {
        await pool.query(
            `INSERT INTO product_image (product_id, image, alt, title) VALUES (?, ?, ?, ?)`,
            [productId, image, alt, title]
        );
    },

    deleteImages: async (productId) => {
        await pool.query(`DELETE FROM product_image WHERE product_id = ?`, [productId]);
    },

    addAttribute: async (productId, attributeId, value) => {
        await pool.query(
            `INSERT INTO product_attribute (product_id, attribute_id, value) VALUES (?, ?, ?)`,
            [productId, attributeId, value]
        );
    },

    deleteAttributes: async (productId) => {
        await pool.query(`DELETE FROM product_attribute WHERE product_id = ?`, [productId]);
    }
};

module.exports = Product;