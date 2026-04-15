// models/productModel.js
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
        if (filters.min_price) {
            sql += ` AND p.price_buy >= ?`;
            params.push(filters.min_price);
        }
        if (filters.max_price) {
            sql += ` AND p.price_buy <= ?`;
            params.push(filters.max_price);
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

    getCurrentSale: async (productId) => {
        const now = new Date();
        const [rows] = await pool.query(
            `SELECT * FROM product_sale 
             WHERE product_id = ? AND status = 1 
               AND date_begin <= ? AND date_end >= ? 
             ORDER BY price_sale ASC LIMIT 1`,
            [productId, now, now]
        );
        return rows[0];
    },

    getStore: async (productId) => {
        const [rows] = await pool.query(
            `SELECT * FROM product_store WHERE product_id = ? AND status = 1`,
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
        const { category_id, name, slug, thumbnail, content, description, price_buy, created_by = 1 } = data;
        const [result] = await pool.query(
            `INSERT INTO product (category_id, name, slug, thumbnail, content, description, price_buy, created_at, created_by, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, 1)`,
            [category_id, name, slug, thumbnail, content, description || null, price_buy, created_by]
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
        const [result] = await pool.query(
            `INSERT INTO product_image (product_id, image, alt, title) VALUES (?, ?, ?, ?)`,
            [productId, image, alt, title]
        );
        return result.insertId;
    },

    deleteImages: async (productId) => {
        await pool.query(`DELETE FROM product_image WHERE product_id = ?`, [productId]);
    },

    addAttribute: async (productId, attributeId, value) => {
        const [result] = await pool.query(
            `INSERT INTO product_attribute (product_id, attribute_id, value) VALUES (?, ?, ?)`,
            [productId, attributeId, value]
        );
        return result.insertId;
    },

    deleteAttributes: async (productId) => {
        await pool.query(`DELETE FROM product_attribute WHERE product_id = ?`, [productId]);
    },

    updateStore: async (productId, price_root, qty) => {
        await pool.query(`DELETE FROM product_store WHERE product_id = ?`, [productId]);
        if (qty !== undefined) {
            await pool.query(
                `INSERT INTO product_store (product_id, price_root, qty, created_at, status) VALUES (?, ?, ?, NOW(), 1)`,
                [productId, price_root || 0, qty]
            );
        }
    },

    updateStoreQuantity: async (productId, delta) => {
        await pool.query(
            `UPDATE product_store SET qty = qty + ? WHERE product_id = ?`,
            [delta, productId]
        );
    }
};

module.exports = Product;