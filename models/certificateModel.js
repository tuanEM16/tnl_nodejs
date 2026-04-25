const pool = require('../config/db');
// 🟢 Chỉnh lại tên fileHelpers (có s) cho đúng con hàng chuẩn của đại ca
const { deleteFile } = require('../utils/fileHelpers'); 

const Certificate = {
    getAll: async () => {
        const [rows] = await pool.query('SELECT * FROM certificates ORDER BY sort_order ASC, created_at DESC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await pool.query('SELECT * FROM certificates WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const [result] = await pool.query('INSERT INTO certificates SET ?', [data]);
        return result.insertId;
    },

    update: async (id, data) => {
        return await pool.query('UPDATE certificates SET ? WHERE id = ?', [data, id]);
    },

    // 🔴 ĐÃ ĐỔI TÊN THÀNH delete ĐỂ ĐỒNG BỘ VỚI POST
    delete: async (id) => {
        // 1. Lấy thông tin ảnh trước khi xóa bản ghi
        const [rows] = await pool.query('SELECT image FROM certificates WHERE id = ?', [id]);
        const item = rows[0];

        if (item && item.image) {
            // 2. Tiêu hủy file vật lý bằng utils chuẩn của đại ca
            await deleteFile(item.image);
        }

        // 3. Xóa hẳn trong Database
        const [result] = await pool.query('DELETE FROM certificates WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            throw new Error('ĐÉO TÌM THẤY CHỨNG CHỈ ĐỂ XÓA ĐẠI CA ƠI!');
        }

        return true;
    },

    updateOrder: async (ids) => {
        const queries = ids.map((id, index) => 
            pool.query('UPDATE certificates SET sort_order = ? WHERE id = ?', [index, id])
        );
        return await Promise.all(queries);
    }
};

module.exports = Certificate;