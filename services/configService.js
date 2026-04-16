const Config = require('../models/configModel');

const configService = {
    show: async () => {
        return await Config.getFullConfig();
    },

    update: async (data) => {
        const fixedFields = [
            'site_name', 'slogan', 'logo', 'favicon', 'email', 'phone',
            'hotline', 'address', 'map_embed', 'facebook', 'youtube',
            'meta_title', 'meta_description', 'meta_keywords'
        ];

        const fixedData = {};
        const metaData = {};

        Object.keys(data).forEach(key => {
            if (fixedFields.includes(key)) {
                fixedData[key] = data[key];
            } else {
                metaData[key] = data[key];
            }
        });

        if (Object.keys(fixedData).length > 0) {
            await Config.updateFixed(fixedData);
        }

        for (const [key, value] of Object.entries(metaData)) {
            if (value === null || value === undefined || value === '') {
                await Config.deleteMeta(key);
            } else {
                await Config.upsertMeta(key, value);
            }
        }
    }
};

module.exports = configService;