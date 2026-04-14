exports.getByPosition = async (position) => {
    const sql = `SELECT * FROM banner WHERE position = ? AND status = 1 ORDER BY sort_order ASC`;
    const [rows] = await db.execute(sql, [position]);
    return rows;
};