const pool = require('../config/db');

const Post = {
getAll: async (filters = {}) => {
        let sql = `SELECT p.*, pc.name as category_name, ppc.name as page_category_name 
                   FROM post p 
                   LEFT JOIN post_category pc ON p.category_id = pc.id 
                   LEFT JOIN post_page_category ppc ON p.page_category_id = ppc.id 
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
        if (filters.page_slug) {
            sql += ` AND ppc.slug = ?`;
            params.push(filters.page_slug);
        }
        if (filters.page_category_id) {
            sql += ` AND p.page_category_id = ?`;
            params.push(filters.page_category_id);
        }
        if (filters.keyword) {
            sql += ` AND p.title LIKE ?`;
            params.push(`%${filters.keyword}%`);
        }

        sql += ` ORDER BY p.sort_order ASC, p.created_at DESC`;

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

    // 2. TẠO MỚI (🔴 CHỖ NÀY PHẢI THÊM CỘT LAYOUT VÀO)
    create: async (data) => {
        const {
            category_id,
            page_category_id,
            title,
            slug,
            image,
            content,
            description,
            post_type = 'post',
            created_by = 1,
            sort_order = 0,
            layout = 'text' // 🟢 Hứng thêm thằng layout ở đây
        } = data;

        const [result] = await pool.query(
            `INSERT INTO post (
                category_id, page_category_id, title, slug, image, 
                content, description, post_type, created_at, created_by, 
                sort_order, layout, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, 1)`,
            [
                category_id || null,
                page_category_id || null,
                title,
                slug,
                image || null,
                content,
                description || null,
                post_type,
                created_by,
                sort_order,
                layout // 🟢 Đẩy layout vào DB
            ]
        );
        return result.insertId;
    },

    // 3. CẬP NHẬT (Hàm này của đại ca quá xịn rồi, nó tự duyệt key nên ko cần sửa gì)
 // be_nodejs/models/postModel.js
update: async (id, data) => {
    const fields = [];
    const values = [];
    
    // 🟢 CHỈ LIỆT KÊ CÁC CỘT THỰC SỰ CÓ TRONG BẢNG POST
    const allowedColumns = [
        'category_id', 'page_category_id', 'title', 'slug', 'image', 
        'content', 'description', 'post_type', 'status', 'sort_order', 'layout'
    ];

    Object.keys(data).forEach(key => {
        // 🎯 Lọc bỏ category_name, page_category_name...
        if (allowedColumns.includes(key) && data[key] !== undefined) {
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

// models/postModel.js

    getById: async (id) => {
        const [rows] = await pool.query(
            `SELECT p.*, pc.name as category_name, ppc.name as page_category_name 
             FROM post p 
             LEFT JOIN post_category pc ON p.category_id = pc.id 
             LEFT JOIN post_page_category ppc ON p.page_category_id = ppc.id 
             WHERE p.id = ?`,
            [id]
        );
        return rows[0];
    },

    getBySlug: async (slug) => {
        const [rows] = await pool.query(
            `SELECT p.*, pc.name as category_name, ppc.name as page_category_name 
             FROM post p 
             LEFT JOIN post_category pc ON p.category_id = pc.id 
             LEFT JOIN post_page_category ppc ON p.page_category_id = ppc.id 
             WHERE p.slug = ? AND p.status = 1`,
            [slug]
        );
        return rows[0];
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
    },
    // 🟠 BLOCK 2: ABOUT SECTIONS (TRANG GIỚI THIỆU)
    // ==========================================

};
module.exports = Post;