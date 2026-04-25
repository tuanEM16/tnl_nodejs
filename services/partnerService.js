import api from '@/lib/api';
const { deleteFile } = require('../utils/fileHelpers'); 

export const partnerService = {
    getAll: async () => {
        const res = await api.get('/partners');
        return res.data;
    },

    getById: async (id) => {
        const res = await api.get(`/partners/${id}`);
        return res.data;
    },

    create: async (formData) => {
        const res = await api.post('/partners', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },

    update: async (id, formData) => {
        const res = await api.put(`/partners/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data;
    },
    delete: async (id) => {
        const item = await Partner.getById(id);
        if (item && item.logo) {
            await deleteFile(item.logo);
        }
        const [result] = await db.query('DELETE FROM partners WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    updateOrder: (ids) => api.put('/partners/reorder', { ids }).then(res => res.data),
};