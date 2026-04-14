const bannerService = require('../services/bannerService');
const bannerController = {
    getByPosition: async (req, res) => {
        try {
            const { position } = req.query;
            const banners = await bannerService.getBanners(position);
            res.status(200).json({ success: true, data: banners });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
};
module.exports = bannerController;