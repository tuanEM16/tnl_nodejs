const pool = require('../config/db');

const AnalyticsModel = {

    // Ghi 1 lượt xem
    track: async ({ page_type, ref_id, ref_slug, referrer, utm_source }) => {
        const [result] = await pool.execute(
            `INSERT INTO page_views (page_type, ref_id, ref_slug, referrer, utm_source)
             VALUES (?, ?, ?, ?, ?)`,
            [page_type, ref_id || null, ref_slug || null, referrer || null, utm_source || null]
        );
        return result.insertId;
    },

    // Tổng lượt xem theo page_type trong N ngày gần nhất
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

    // Top sản phẩm được xem nhiều nhất
    getTopProducts: async (days = 30, limit = 10) => {
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
             LIMIT ?`,
            [days, limit]
        );
        return rows;
    },

    // Lượt xem theo ngày (chart data)
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

    // Nguồn traffic (referrer domain)
    getTrafficSources: async (days = 30) => {
        const [rows] = await pool.execute(
            `SELECT 
                CASE
                    WHEN utm_source IS NOT NULL AND utm_source != '' THEN utm_source
                    WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
                    WHEN referrer LIKE '%google%'   THEN 'Google'
                    WHEN referrer LIKE '%facebook%' THEN 'Facebook'
                    WHEN referrer LIKE '%zalo%'     THEN 'Zalo'
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

    // Thống kê chuyển đổi: xem sản phẩm → gửi báo giá/liên hệ
    getConversionStats: async (days = 30) => {
        const [viewRows] = await pool.execute(
            `SELECT COUNT(*) AS product_views
             FROM page_views
             WHERE page_type = 'product'
               AND viewed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [days]
        );
        const [estimateRows] = await pool.execute(
            `SELECT COUNT(*) AS estimates
             FROM estimate_items
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [days]
        );
        const [contactRows] = await pool.execute(
            `SELECT COUNT(*) AS contacts
             FROM contact
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [days]
        );

        const views     = viewRows[0]?.product_views  || 0;
        const estimates = estimateRows[0]?.estimates  || 0;
        const contacts  = contactRows[0]?.contacts    || 0;
        const total_conversions = estimates + contacts;

        return {
            product_views:     views,
            estimate_requests: estimates,
            contact_requests:  contacts,
            total_conversions,
            conversion_rate: views > 0 ? ((total_conversions / views) * 100).toFixed(1) : '0.0'
        };
    },

    // So sánh period hiện tại vs period trước (để tính % tăng/giảm)
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
        const curr = current[0]?.total  || 0;
        const prev = previous[0]?.total || 0;
        const change = prev > 0 ? (((curr - prev) / prev) * 100).toFixed(1) : null;
        return { current: curr, previous: prev, change_percent: change };
    }
};

module.exports = AnalyticsModel;