const categoryModel = require('../models/categoryModel');
const categoryService = {
    getList: async () => {
        return await categoryModel.getAllActive();
    },
    add: async (data) => {
        return await categoryModel.insert(data);
    }
};
module.exports = categoryService;