const AnalyticsModel = require('../models/analyticsModel');

const analyticsService = {

    track: async (data) => {
        const allowed = ['product', 'post', 'project', 'home', 'other'];
        if (!allowed.includes(data.page_type)) data.page_type = 'other';
        return await AnalyticsModel.track(data);
    },

    getSummary: async (days = 30) => {
        const [totalViews, conversions, periodComp, trafficSources] = await Promise.all([
            AnalyticsModel.getTotalViews(days),
            AnalyticsModel.getConversionStats(days),
            AnalyticsModel.getPeriodComparison(days),
            AnalyticsModel.getTrafficSources(days)
        ]);

        // Map totalViews array thành object
        const viewMap = {};
        totalViews.forEach(r => { viewMap[r.page_type] = parseInt(r.total); });

        return {
            period_days:    days,
            total_views:    periodComp.current,
            view_change:    periodComp.change_percent,
            product_views:  viewMap.product  || 0,
            post_views:     viewMap.post     || 0,
            project_views:  viewMap.project  || 0,
            conversions,
            traffic_sources: trafficSources
        };
    },

    getTopProducts: async (days = 30) => {
        return await AnalyticsModel.getTopProducts(days, 10);
    },

    getChartData: async (days = 30) => {
        return await AnalyticsModel.getViewsByDay(days);
    }
};

module.exports = analyticsService;