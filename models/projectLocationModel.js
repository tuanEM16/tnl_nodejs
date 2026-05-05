const pool = require('../config/db');

const ProjectLocation = {

    // Lấy tất cả dự án có tọa độ (public — dùng cho bản đồ frontend)
    getAll: async () => {
        const [rows] = await pool.execute(`
            SELECT
                pl.id,
                pl.post_id,
                pl.lat,
                pl.lng,
                pl.location_name,
                pl.province,
                pl.year,
                pl.sort_order,
                pl.status,
                p.title,
                p.slug,
                p.image,
                p.description
            FROM project_location pl
            LEFT JOIN post p ON pl.post_id = p.id
            ORDER BY pl.sort_order ASC, pl.year DESC
        `);
        return rows;
    },

    // Lấy theo id (dùng cho admin edit)
    getById: async (id) => {
        const [rows] = await pool.execute(
            `SELECT pl.*, p.title, p.slug, p.image, p.description
             FROM project_location pl
             LEFT JOIN post p ON pl.post_id = p.id
             WHERE pl.id = ?`,
            [id]
        );
        return rows[0] || null;
    },

    // Lấy theo post_id (kiểm tra đã có tọa độ chưa)
    getByPostId: async (postId) => {
        const [rows] = await pool.execute(
            'SELECT * FROM project_location WHERE post_id = ?',
            [postId]
        );
        return rows[0] || null;
    },

    // Tạo mới
    create: async (data) => {
        const [result] = await pool.execute(
            `INSERT INTO project_location (post_id, lat, lng, location_name, province, year, sort_order, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.post_id,
                data.lat,
                data.lng,
                data.location_name || null,
                data.province || null,
                data.year || null,
                data.sort_order || 0,
                data.status !== undefined ? data.status : 1
            ]
        );
        return result.insertId;
    },

    // Cập nhật
    update: async (id, data) => {
        const fields = [];
        const values = [];

        if (data.post_id !== undefined) { fields.push('post_id = ?'); values.push(data.post_id); }
        if (data.lat !== undefined) { fields.push('lat = ?'); values.push(data.lat); }
        if (data.lng !== undefined) { fields.push('lng = ?'); values.push(data.lng); }
        if (data.location_name !== undefined) { fields.push('location_name = ?'); values.push(data.location_name); }
        if (data.province !== undefined) { fields.push('province = ?'); values.push(data.province); }
        if (data.year !== undefined) { fields.push('year = ?'); values.push(data.year); }
        if (data.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(data.sort_order); }
        if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }

        if (fields.length === 0) return 0;

        values.push(id);
        const [result] = await pool.execute(
            `UPDATE project_location SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },

    // Xóa
    delete: async (id) => {
        const [result] = await pool.execute(
            'DELETE FROM project_location WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    },

    // Lấy danh sách dự án chưa có tọa độ (dùng cho dropdown admin)
    getPostsWithoutLocation: async () => {
        const [rows] = await pool.execute(`
            SELECT p.id, p.title, p.slug
            FROM post p
            LEFT JOIN project_location pl ON pl.post_id = p.id
            WHERE p.post_type = 'project' AND p.status = 1 AND pl.id IS NULL
            ORDER BY p.sort_order ASC
        `);
        return rows;
    }
};

module.exports = ProjectLocation;