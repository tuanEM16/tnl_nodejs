require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser'); // 🟢 1. Triệu hồi cảm biến Cookie
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// 🟢 2. Cấu hình CORS "Chốt chặn" (Phải làm chuẩn mới chạy được Cookie)
app.use(cors({
    // 🚩 Đặt đúng địa chỉ Next.js của đại ca, KHÔNG được dùng '*'
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
    credentials: true, // 🚩 CHO PHÉP Cookie đi qua cổng này
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🟢 3. Lắp cảm biến Cookie (Phải đặt TRƯỚC router)
app.use(cookieParser()); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ file tĩnh
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🟢 4. Tuyến đường API
app.use('/api', routes);

// Xử lý lỗi tập trung
app.use((err, req, res, next) => {
    console.error('%c ❌ SERVER ERROR:', 'color: red; font-weight: bold;', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Hệ thống trục trặc, vui lòng thử lại sau!' 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 [TNL_STEEL_BACKEND] Server running on port ${PORT}`);
});