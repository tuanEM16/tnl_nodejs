const contactModel = require('../models/contactModel');
const contactService = {
    saveContact: async (data) => {
        return await contactModel.insert(data);
    },
    getAll: async () => {
        return await contactModel.findAll();
    }
};
module.exports = contactService;