const Banner = require('../models/bannerModel');

const bannerService = {
    index: async (page) => {
        return await Banner.getAll(page);
    },

    show: async (id) => {
        return await Banner.getById(id);
    },

    store: async (data) => {
        return await Banner.create(data);
    },

    update: async (id, data) => {
        const affected = await Banner.update(id, data);
        if (!affected) throw new Error('Không tìm thấy banner');
    },

    destroy: async (id) => {
        const affected = await Banner.delete(id);
        if (!affected) throw new Error('Không tìm thấy banner');
    }
};

module.exports = bannerService;