exports.insert = async (data, connection) => {
    const sql = `INSERT INTO contact (user_id, name, email, phone, content, created_at, status) VALUES (?, ?, ?, ?, ?, NOW(), 1)`;
    const executor = connection || db;
    await executor.execute(sql, [data.user_id || null, data.name, data.email, data.phone, data.content]);
};