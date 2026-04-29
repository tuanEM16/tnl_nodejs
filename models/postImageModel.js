// be_nodejs/models/postImageModel.js
const pool = require('../config/db');

const PostImage = {

    // Lấy tất cả ảnh của một bài viết
    getByPostId: async (postId) => {
        const [rows] = await pool.query(
            'SELECT * FROM post_images WHERE post_id = ? ORDER BY sort_order ASC',
            [postId]
        );
        return rows;
    },

    // Chèn nhiều ảnh cùng lúc (batch insert)
  bulkInsert: async (postId, filenames) => {
        if (!filenames || filenames.length === 0) return;

        // 🟢 CHỐT CHẶN: Ép kiểu và kiểm tra lại lần nữa cho chắc
        const sql = "INSERT INTO post_images (post_id, image) VALUES ?";
        
        // Biến mảng tên file thành mảng các hàng [postId, filename]
        const values = filenames.map(filename => [postId, filename]);

        try {
            const [result] = await pool.query(sql, [values]);
            return result;
        } catch (err) {
            console.error("❌ LỖI BULK INSERT GALLERY:", err.message);
            throw err;
        }
    },

    // Xóa toàn bộ ảnh cũ của bài viết (dùng trước khi sync lại)
    deleteByPostId: async (postId) => {
        const [rows] = await pool.query(
            'SELECT image FROM post_images WHERE post_id = ?',
            [postId]
        );
        await pool.query('DELETE FROM post_images WHERE post_id = ?', [postId]);
        return rows.map(r => r.image); // trả về danh sách filename để xóa file vật lý
    },
};

module.exports = PostImage;