const Contact = require('../models/contactModel');

const contactService = {
    index: async (filters) => {
        return await Contact.getAll(filters);
    },

    show: async (id) => {
        return await Contact.getById(id);
    },

    store: async (data) => {
        if (!data.name || !data.phone || !data.content) {
            throw new Error('Vui lòng nhập đầy đủ họ tên, số điện thoại và nội dung');
        }
        return await Contact.create(data);
    },

    updateStatus: async (id, status) => {
        const affected = await Contact.updateStatus(id, status);
        if (!affected) throw new Error('Không tìm thấy liên hệ');
    },

    destroy: async (id) => {
        const affected = await Contact.delete(id);
        if (!affected) throw new Error('Không tìm thấy liên hệ');
    }
};

module.exports = contactService;