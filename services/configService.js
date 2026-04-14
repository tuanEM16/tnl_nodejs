const configModel = require('../models/configModel');
const configService = {
    getConfig: async () => {
        return await configModel.getLatest();
    },
    update: async (data) => {
        return await configModel.updateSystem(data);
    }
};
module.exports = configService;