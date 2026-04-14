const db = require('../config/db');
exports.getByPosition = async (position) => {
    const sql = `SELECT * FROM menu WHERE position = ? AND status = 1 ORDER BY sort_order ASC`;
    const [rows] = await db.execute(sql, [position]);
    return rows;
};