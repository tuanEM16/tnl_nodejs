const Config = require('../models/configModel');
const configService = {
    show: async () => {
        return await Config.get();
    },
    update: async (data) => {
        await Config.update(data);
    }
};
module.exports = configService;