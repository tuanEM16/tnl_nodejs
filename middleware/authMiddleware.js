const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 🟢 THAY ĐỔI CHIẾN THUẬT: 
    // Thay vì dùng req.headers.authorization, đại ca bốc từ req.cookies.token
    // (Lưu ý: Phải có cookie-parser ở app.js thì mới bốc được dòng này)
    const token = req.cookies.token; 

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'TRẠM KIỂM SOÁT: KHÔNG TÌM THẤY MÃ TRUY CẬP (TOKEN_MISSING)' 
        });
    }

    try {
        // Giải mã chìa khóa bằng Secret Key trong file .env của đại ca
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Nhét thông tin đã giải mã (id, username, roles...) vào request
        // Để các hàm xử lý phía sau (Controller) bốc ra dùng luôn
        req.user = decoded; 
        
        next(); // 🟢 CHO PHÉP ĐI TIẾP VÀO HỆ THỐNG
    } catch (error) {
        // Nếu token hết hạn hoặc bị giả mạo (Catch được lỗi của jwt.verify)
        return res.status(403).json({ 
            success: false, 
            message: 'CẢNH BÁO: MÃ TRUY CẬP KHÔNG HỢP LỆ HOẶC ĐÃ HẾT HẠN!' 
        });
    }
};