// be_nodejs/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// 🟢 1. Cấu hình kho chứa và đặt tên thép
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Trỏ về thư mục uploads ngang hàng với be_nodejs
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null,  Date.now() + path.extname(file.originalname));
  }
});

// 🟢 2. Bộ lọc: Chỉ cho thép tốt (Ảnh & Video) đi qua
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|quicktime/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hệ thống chỉ nhận file ảnh (jpg, png...) hoặc video (mp4, webm)!'));
  }
};

// 🟢 3. Khởi tạo máy upload (Nới lỏng 100MB cho sướng)
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB cho đại ca bốc video thoải mái
    fieldSize: 10 * 1024 * 1024  // Tránh lỗi 'S' khi content quá dài
  },
  fileFilter: fileFilter
});

module.exports = upload;