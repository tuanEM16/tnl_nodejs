const db = require('../config/db');
exports.get = async () => {
    const [rows] = await db.execute(`SELECT * FROM \`config\` LIMIT 1`);
    return rows[0];
};