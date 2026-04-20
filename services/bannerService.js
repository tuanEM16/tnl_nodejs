const Banner = require('../models/bannerModel');

const bannerService = {
    index: async (filters) => {
        return await Banner.getAll(filters);
    },

    show: async (id) => {
        return await Banner.getById(id);
    },


    store: async (data, file) => {
        const insertData = { ...data };
        

        if (file) {
            insertData.image = file.filename; 
        }

        return await Banner.create(insertData);
    },


    update: async (id, data, file) => {
        const updateData = { ...data };


        delete updateData._method; 


        if (file) {
            updateData.image = file.filename; 
        }

        const affected = await Banner.update(id, updateData);
        if (!affected) throw new Error('Không tìm thấy banner');
        return affected;
    },

    destroy: async (id) => {
        const affected = await Banner.delete(id);
        if (!affected) throw new Error('Không tìm thấy banner');
    }
};

module.exports = bannerService;