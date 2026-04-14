const db = require('../config/db');
const productModel = {
    insert: async (data, connection) => {
        const sql = `INSERT INTO product (category_id, name, slug, thumbnail, content, description, price_buy, created_at, created_by, status) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, 1)`;
        const executor = connection || db;
        const [res] = await executor.execute(sql, [data.category_id, data.name, data.slug, data.thumbnail, data.content, data.description, data.price_buy, data.created_by || 1]);
        return res.insertId;
    },
    insertStore: async (productId, priceRoot, qty, connection) => {
        const sql = `INSERT INTO product_store (product_id, price_root, qty, created_at, created_by) VALUES (?, ?, ?, NOW(), 1)`;
        const executor = connection || db;
        await executor.execute(sql, [productId, priceRoot, qty]);
    },
    insertImages: async (productId, images, connection) => {
        if (!images || images.length === 0) return;
        const values = images.map(img => [productId, img]);
        const sql = `INSERT INTO product_image (product_id, image) VALUES ?`;
        const executor = connection || db;
        await executor.query(sql, [values]); 
    },
    insertAttributes: async (productId, attributes, connection) => {
        if (!attributes || attributes.length === 0) return;
        const values = attributes.map(attr => [productId, attr.attribute_id, attr.value]);
        const sql = `INSERT INTO product_attribute (product_id, attribute_id, value) VALUES ?`;
        const executor = connection || db;
        await executor.query(sql, [values]);
    },
    getAllWithDetails: async () => {
        const sql = `
            SELECT p.*, s.qty, ps.price_sale, ps.date_begin, ps.date_end
            FROM product p
            LEFT JOIN product_store s ON p.id = s.product_id
            LEFT JOIN product_sale ps ON p.id = ps.product_id AND ps.status = 1
            WHERE p.status = 1`;
        const [rows] = await db.execute(sql);
        return rows;
    }
};
module.exports = productModel;