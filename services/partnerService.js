// services/partnerService.js (BACKEND)

const Partner = require('../models/partnerModel');
const { deleteFile } = require('../utils/fileHelpers');
const db = require('../config/db');

const partnerService = {
    // 🟢 ĐỔI: Gọi Model chứ đéo sài api.get ở đây
    index: async () => {
        return await Partner.getAll();
    },

    // 🟢 ĐỔI: Tên hàm là show (để khớp với Controller của đại ca)
    show: async (id) => {
        return await Partner.getById(id);
    },

    // 🟢 ĐỔI: Tên hàm là store (để khớp với Controller)
    store: async (data, file) => {
        const payload = { ...data };
        if (file) {
            payload.logo = file.filename;
        }
        return await Partner.create(payload);
    },

    update: async (id, data, file) => {
        const updateData = { ...data };
        if (file) {
            const oldItem = await Partner.getById(id);
            if (oldItem && oldItem.logo) {
                await deleteFile(oldItem.logo);
            }
            updateData.logo = file.filename;
        }
        return await Partner.update(id, updateData);
    },

    delete: async (id) => {
        const item = await Partner.getById(id);
        if (item && item.logo) {
            await deleteFile(item.logo);
        }
        // Gọi hàm xóa trong Model (Model chỉ việc xóa DB)
        return await Partner.delete(id);
    }
};

module.exports = partnerService;