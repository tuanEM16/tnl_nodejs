const db = require('../config/db');

const categoryModel = {
    // Lấy toàn bộ danh mục đang hoạt động
    getAllActive: async () => {
        const sql = `SELECT * FROM category WHERE status = 1 ORDER BY sort_order ASC`;
        const [rows] = await db.execute(sql);
        return rows;
    },

    // Thêm danh mục mới
    insert: async (data) => {
        const sql = `INSERT INTO category (name, slug, parent_id, sort_order, description, created_at, status) 
                     VALUES (?, ?, ?, ?, ?, NOW(), 1)`;
        const [res] = await db.execute(sql, [data.name, data.slug, data.parent_id || 0, data.sort_order || 0, data.description]);
        return res.insertId;
    }
};

// QUAN TRỌNG: Phải export cái object này ra
module.exports = categoryModel;