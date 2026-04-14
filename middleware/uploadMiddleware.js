const multer = require('multer');
const path = require('path');

// 1. Cấu hình nơi lưu trữ và tên file 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ảnh sẽ được lưu vào thư mục uploads/
    },
    filename: function (req, file, cb) {
        // Đặt tên file theo: timestamp-ten-goc.jpg
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});

// 2. Khởi tạo Multer 
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB mỗi ảnh
});

// 3. QUAN TRỌNG: Export trực tiếp biến upload
module.exports = upload;