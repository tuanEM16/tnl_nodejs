const Contact = require('../models/contactModel');
const contactService = {
    index: async (filters) => {
        return await Contact.getAll(filters);
    },
    show: async (id) => {
        const contact = await Contact.getById(id);
        if (!contact) return null;
        if (contact.reply_id === 0) {
            contact.replies = await Contact.getReplies(id);
        } else {
            const parent = await Contact.getById(contact.reply_id);
            contact.parent = parent;
        }
        return contact;
    },
    store: async (data) => {
        return await Contact.create(data);
    },
    storeReply: async (contactId, data, userId) => {
        const parent = await Contact.getById(contactId);
        if (!parent) throw new Error('Không tìm thấy liên hệ gốc');
        const replyData = {
            name: parent.name,
            email: parent.email,
            phone: parent.phone,
            content: data.content,
            reply_id: contactId,
            created_by: userId
        };
        return await Contact.create(replyData);
    },
    update: async (id, data) => {
        const affected = await Contact.update(id, data);
        if (!affected) throw new Error('Không tìm thấy liên hệ');
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