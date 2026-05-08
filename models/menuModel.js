const pool = require('../config/db');

const Menu = {

    // ── Lấy tất cả + JOIN slug động theo type ────────────────────────────────
    // 1 query duy nhất — không N+1
    getAllWithSlug: async (position = null) => {
        let sql = `
            SELECT
                m.id, m.name, m.type, m.parent_id, m.sort_order,
                m.table_id, m.position, m.status,
                -- Link động: ưu tiên slug thật từ DB, fallback về link cứng
                CASE
                    WHEN m.type = 'category' AND c.slug IS NOT NULL
                        THEN CONCAT('/products?category=', c.slug)
                    WHEN m.type = 'page' AND p_page.slug IS NOT NULL
                        THEN m.link 
                    WHEN m.type = 'project' AND p_proj.slug IS NOT NULL
                        THEN CONCAT('/projects/', p_proj.slug)
                    ELSE m.link
                END AS link,
                -- Tên thật từ bảng gốc (phòng khi admin nhập tên cũ)
                COALESCE(c.name, p_page.title, p_proj.title, m.name) AS display_name
            FROM menu m
            LEFT JOIN category c
                ON m.type = 'category' AND m.table_id = c.id AND c.status = 1
            LEFT JOIN post p_page
                ON m.type = 'page' AND m.table_id = p_page.id AND p_page.post_type = 'page'
            LEFT JOIN post p_proj
                ON m.type = 'project' AND m.table_id = p_proj.id AND p_proj.post_type = 'project'
            WHERE m.status = 1
        `;
        const params = [];
        if (position) {
            sql += ` AND m.position = ?`;
            params.push(position);
        }
        sql += ` ORDER BY m.parent_id ASC, m.sort_order ASC`;

        const [rows] = await pool.query(sql, params);
        return rows;
    },

    // ── Build tree trong JS — không query thêm ───────────────────────────────
    buildTree: (items, parentId = 0) => {
        return items
            .filter(item => parseInt(item.parent_id) === parentId)
            .map(item => ({
                ...item,
                children: Menu.buildTree(items, item.id)
            }));
    },

    // ── Dùng cho admin list (kể cả ẩn, không JOIN slug) ─────────────────────
    getAll: async (position = null) => {
        let sql = `SELECT * FROM menu WHERE 1=1`;
        const params = [];
        if (position) {
            sql += ` AND position = ?`;
            params.push(position);
        }
        sql += ` ORDER BY parent_id ASC, sort_order ASC`;
        const [rows] = await pool.query(sql, params);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query(`SELECT * FROM menu WHERE id = ?`, [id]);
        return rows[0] || null;
    },

    create: async (data) => {
        const {
            name, link, type,
            parent_id  = 0,
            sort_order = 0,
            table_id   = null,
            position   = 'mainmenu',
            created_by = 1
        } = data;
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
        const allowed = ['name', 'link', 'type', 'parent_id', 'sort_order', 'table_id', 'position', 'status', 'updated_by'];
        Object.keys(data).forEach(key => {
            if (allowed.includes(key) && data[key] !== undefined) {
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
        const [result] = await pool.query(`DELETE FROM menu WHERE id = ?`, [id]);
        return result.affectedRows;
    }
};

module.exports = Menu;