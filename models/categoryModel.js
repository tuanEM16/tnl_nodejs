exports.getAll = async () => {
    const [rows] = await db.execute(`SELECT * FROM category WHERE status = 1 ORDER BY sort_order ASC`);
    return rows;
};