const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // 🟢 MỞ RỘNG CỬA: Cho phép cả ảnh và video
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|quicktime/; 
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        // 🔴 Thông báo rõ ràng để đại ca dễ bắt bệnh
        cb(new Error('Hệ thống chỉ nhận file ảnh (jpg, png...) hoặc video (mp4, webm)!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { 
        // 🟢 NỚI LỎNG HẦM: Nâng lên 100MB để đại ca bốc video cho sướng
        fileSize: 100 * 1024 * 1024 
    },
    fileFilter: fileFilter
});

module.exports = upload;