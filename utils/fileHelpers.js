// utils/fileHelper.js
const fs = require('fs').promises;
const path = require('path');

const deleteFile = async (filename) => {
    if (!filename) return;
    try {
        // Đường dẫn đến thư mục uploads của đại ca
        const filePath = path.join(__dirname, '../uploads', filename); 
        await fs.unlink(filePath);
        console.log(`Đã dọn dẹp file: ${filename}`);
    } catch (err) {
        console.error(`Không thể xóa file ${filename}:`, err.message);
    }
};

module.exports = { deleteFile };