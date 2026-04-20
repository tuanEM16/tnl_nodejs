// Backend: utils/emailTemplates.js

const resetPasswordTemplate = (userName, loginName, resetLink, siteName, logoUrl) => {
    const year = new Date().getFullYear(); 

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 4px solid #000; background-color: #ffffff; color: #000;">
            
            <div style="text-align: center; padding: 40px 20px 20px 20px;">
                <img src="${logoUrl}" alt="${siteName}" style="max-height: 70px; max-width: 200px; object-fit: contain;">
            </div>

            <div style="padding: 0 40px 40px 40px;">
                <div style="border-top: 2px solid #eee; padding-top: 20px;">
                    <p style="text-transform: uppercase; font-size: 10px; font-weight: bold; color: #999; letter-spacing: 2px; margin-bottom: 5px;">Security Protocol</p>
                    <h2 style="text-transform: uppercase; margin: 0 0 20px 0; font-size: 22px; font-weight: 900;">Phục hồi mật mã</h2>
                    
                    <p>Chào <b>${userName}</b>,</p>
                    <p>Hệ thống quản trị nội bộ của <b>${siteName}</b> đã nhận được yêu cầu khôi phục mật mã cho tài khoản: <span style="background: #f3f4f6; padding: 2px 6px; font-family: monospace; font-weight: bold;">${loginName}</span>.</p>
                    
                    <div style="border-left: 4px solid #ea580c; background-color: #fff7ed; padding: 15px; margin: 25px 0;">
                        <p style="margin: 0; color: #ea580c; font-size: 13px; font-weight: bold;">
                            ⚠️ LƯU Ý: Yêu cầu này sẽ hết hạn sau 5 phút. Vui lòng thực hiện thay đổi ngay lập tức để bảo mật thông tin.
                        </p>
                    </div>
                    
                    <div style="margin: 35px 0; text-align: center;">
                        <a href="${resetLink}" 
                           style="background: #000; color: #fff; padding: 18px 40px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; display: inline-block; box-shadow: 6px 6px 0px 0px #ea580c;">
                            XÁC NHẬN ĐẶT LẠI →
                        </a>
                    </div>
                </div>
            </div>

            <div style="background-color: #000; color: #666; padding: 30px 40px; text-align: center; font-size: 11px;">
                <p style="margin-bottom: 10px; color: #fff; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                    © ${year} ${siteName}
                </p>
                <p style="margin: 0; line-height: 1.6;">
                    Đây là email tự động từ hệ thống quản trị nội bộ.<br/>
                    Vui lòng không phản hồi email này. Mọi thắc mắc vui lòng liên hệ bộ phận IT.
                </p>
            </div>
        </div>
    `;
};

module.exports = { resetPasswordTemplate };