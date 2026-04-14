const bannerModel = require('../models/bannerModel');
const bannerService = {
    getBanners: async (position) => {
        return await bannerModel.getByPosition(position || 'slideshow');
    },
};
module.exports = bannerService;