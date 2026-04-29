// be_nodejs/utils/fileHelpers.js
const fs = require('fs').promises;
const path = require('path');

/**
 * 🟢 Hàm dọn rác file vật lý
 */
const deleteFile = async (filename) => {
    if (!filename) return;
    try {
        // Đường dẫn từ utils/ ngược ra root rồi vào uploads
        const filePath = path.join(__dirname, '../uploads', filename); 
        await fs.unlink(filePath);
        console.log(`🚀 [CLEANUP] Đã dọn dẹp file: ${filename}`);
    } catch (err) {
        // Nếu file đéo tồn tại thì thôi, khỏi báo lỗi cho nặng máy
        if (err.code !== 'ENOENT') {
            console.error(`❌ Lỗi xóa file ${filename}:`, err.message);
        }
    }
};

/**
 * 🟢 Hàm bốc tên file từ HTML (Bỏ qua base64 rác)
 */
const extractImagesFromContent = (content) => {
    if (!content) return [];
    // Regex chuẩn: Chỉ bắt những file nằm trong thư mục /uploads/
    const imgRegExp = /<img[^>]+src="[^">]*\/uploads\/([^">]+)"/g;
    const images = [];
    let match;
    while ((match = imgRegExp.exec(content)) !== null) {
        // match[1] là tên file (vd: tnl-123.jpg)
        images.push(match[1]);
    }
    return images;
};

// 🔴 PHẢI EXPORT CẢ 2 THẰNG NÀY RA ĐẠI CA ƠI
module.exports = { 
    deleteFile, 
    extractImagesFromContent 
};