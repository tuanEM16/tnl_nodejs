const analyticsService = require('../services/analyticsService');

const analyticsController = {

    // POST /api/analytics/track — public, gọi từ frontend khi user xem trang
    track: async (req, res) => {
        try {
            await analyticsService.track(req.body);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error("🔴 LỖI INSERT TRACKING:", error.message);
            res.status(200).json({ success: false });
        }
    },

    // GET /api/analytics/summary?days=30 — admin
    getSummary: async (req, res) => {
        try {
            const days = parseInt(req.query.days) || 30;
            const data = await analyticsService.getSummary(days);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/analytics/top-products?days=30 — admin
    getTopProducts: async (req, res) => {
        try {
            const days = parseInt(req.query.days) || 30;
            const data = await analyticsService.getTopProducts(days);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // GET /api/analytics/chart?days=30 — admin
    getChartData: async (req, res) => {
        try {
            const days = parseInt(req.query.days) || 30;
            const data = await analyticsService.getChartData(days);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = analyticsController;