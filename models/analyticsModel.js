const pool = require('../config/db');

const AnalyticsModel = {

    track: async ({ page_type, ref_id, ref_slug, referrer, utm_source }) => {
        const [result] = await pool.execute(
            `INSERT INTO page_views (page_type, ref_id, ref_slug, referrer, utm_source)
             VALUES (?, ?, ?, ?, ?)`,
            [page_type, ref_id || null, ref_slug || null, referrer || null, utm_source || null]
        );
        return result.insertId;
    },

    getTotalViews: async (days = 30) => {
        const [rows] = await pool.execute(
            `SELECT page_type, COUNT(*) AS total
             FROM page_views
             WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
             GROUP BY page_type`,
            [days]
        );
        return rows;
    },

getTopProducts: async (days = 30, limit = 10) => {
    const safedays = parseInt(days) || 30;
    const safeLimit = parseInt(limit) || 10;
    const [rows] = await pool.execute(
        `SELECT pv.ref_id, pv.ref_slug, p.name AS product_name,
                c.name AS category_name,
                COUNT(*) AS views
         FROM page_views pv
         LEFT JOIN product p ON pv.ref_id = p.id
         LEFT JOIN category c ON p.category_id = c.id
         WHERE pv.page_type = 'product'
           AND pv.viewed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY pv.ref_id, pv.ref_slug, p.name, c.name
         ORDER BY views DESC
         LIMIT ${safeLimit}`,
        [safedays]
    );
    return rows;
},

    getViewsByDay: async (days = 30) => {
        const [rows] = await pool.execute(
            `SELECT DATE(viewed_at) AS date,
                    COUNT(*) AS total,
                    SUM(page_type = 'product') AS product_views
             FROM page_views
             WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
             GROUP BY DATE(viewed_at)
             ORDER BY date ASC`,
            [days]
        );
        return rows;
    },

    // ── Nguồn traffic — map ref code → tên hiển thị ──────────────────────────
    getTrafficSources: async (days = 30) => {
        const [rows] = await pool.execute(
            `SELECT 
                CASE
                    WHEN utm_source = 'fb' THEN 'Facebook'
                    WHEN utm_source = 'zl' THEN 'Zalo'
                    WHEN utm_source = 'gg' THEN 'Google'
                    WHEN utm_source = 'tt' THEN 'TikTok'
                    WHEN utm_source = 'cp' THEN 'Copy Link'
                    WHEN utm_source IS NOT NULL AND utm_source != '' THEN utm_source
                    WHEN referrer IS NULL OR referrer = ''       THEN 'Direct'
                    WHEN referrer LIKE '%localhost%'             THEN 'Direct'
                    WHEN referrer LIKE '%tanngocluc.com%'        THEN 'Direct'
                    WHEN referrer LIKE '%google%'                THEN 'Google'
                    WHEN referrer LIKE '%facebook%'              THEN 'Facebook'
                    WHEN referrer LIKE '%zalo%'                  THEN 'Zalo'
                    ELSE 'Other'
                END AS source,
                COUNT(*) AS total
             FROM page_views
             WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
             GROUP BY source
             ORDER BY total DESC`,
            [days]
        );
        return rows;
    },

    getConversionStats: async (days = 30) => {
        const [viewRows] = await pool.execute(
            `SELECT 
            COUNT(*) AS total_views,
            SUM(page_type = 'product') AS product_views,
            SUM(page_type = 'post')    AS post_views,
            SUM(page_type = 'project') AS project_views,
            SUM(page_type = 'estimate') AS estimate_views,
            SUM(page_type = 'about')   AS about_views
         FROM page_views
         WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [days]
        );
        const [contactRows] = await pool.execute(
            `SELECT COUNT(*) AS contacts
         FROM contact
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [days]
        );

        const views = viewRows[0]?.total_views || 0;
        const contacts = contactRows[0]?.contacts || 0;

        return {
            total_views: views,
            product_views: viewRows[0]?.product_views || 0,
            post_views: viewRows[0]?.post_views || 0,
            project_views: viewRows[0]?.project_views || 0,
            estimate_views: viewRows[0]?.estimate_views || 0, // 🟢 Đã thêm đếm trang báo giá
            about_views: viewRows[0]?.about_views || 0,       // 🟢 Đã thêm đếm trang giới thiệu
            contact_requests: contacts,
            total_conversions: contacts,
            conversion_rate: views > 0 ? ((contacts / views) * 100).toFixed(1) : '0.0'
        };
    },
    
    getPeriodComparison: async (days = 30) => {
        const [current] = await pool.execute(
            `SELECT COUNT(*) AS total FROM page_views
             WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [days]
        );
        const [previous] = await pool.execute(
            `SELECT COUNT(*) AS total FROM page_views
             WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
               AND viewed_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [days * 2, days]
        );
        const curr = current[0]?.total || 0;
        const prev = previous[0]?.total || 0;
        const change = prev > 0 ? (((curr - prev) / prev) * 100).toFixed(1) : null;
        return { current: curr, previous: prev, change_percent: change };
    }
};

module.exports = AnalyticsModel;