const chatService = require('../services/chatService');

// Rate limiting đơn giản bằng memory (production nên dùng Redis)
const rateLimitMap = new Map();
const LIMIT       = 15;  // tối đa 15 tin nhắn
const WINDOW_MS   = 1 * 60 * 1000; // trong 15 phút

const checkRateLimit = (ip) => {
    // Tùy chọn: Bỏ qua rate limit nếu đang chạy trên localhost để test cho sướng
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
        return true; 
    }
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now - entry.startTime > WINDOW_MS) {
        // Reset nếu lần đầu hoặc đã hết window
        rateLimitMap.set(ip, { count: 1, startTime: now });
        return true;
    }

    if (entry.count >= LIMIT) return false;

    entry.count++;
    return true;
};

const chatController = {
    chat: async (req, res) => {
        try {
            // ── 1. Rate limiting ──────────────────────────────────────────────
            const ip = req.ip || req.connection.remoteAddress;
            if (!checkRateLimit(ip)) {
                return res.status(429).json({
                    success: false,
                    message: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau 15 phút.'
                });
            }

            // ── 2. Lấy dữ liệu từ request ─────────────────────────────────────
            const { message, history } = req.body;

            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập câu hỏi'
                });
            }

            // Validate history: chỉ cho phép mảng tối đa 20 tin nhắn gần nhất
            const safeHistory = Array.isArray(history)
                ? history.slice(-20).filter(
                    m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string'
                  )
                : [];

            // ── 3. Gọi service ────────────────────────────────────────────────
            const { reply } = await chatService.chat(message, safeHistory);

            res.status(200).json({ success: true, data: { reply } });

        } catch (error) {
            // Phân biệt lỗi do input vs lỗi hệ thống
            const isInputError = [
                'Tin nhắn không hợp lệ',
                'Tin nhắn không được để trống',
                'Tin nhắn quá dài',
                'Nội dung không hợp lệ'
            ].includes(error.message);

            res.status(isInputError ? 400 : 500).json({
                success: false,
                message: isInputError
                    ? error.message
                    : 'Trợ lý đang bận, vui lòng thử lại sau!'
            });
        }
    }
};

module.exports = chatController;