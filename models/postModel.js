const db = require('../config/db');
exports.getByType = async (type) => {
    const sql = `SELECT * FROM post WHERE post_type = ? AND status = 1 ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql, [type]);
    return rows;
};