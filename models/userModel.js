const db = require('../config/db');
const userModel = {
    findByUsername: async (username) => {
        const [rows] = await db.execute(`SELECT * FROM \`user\` WHERE username = ?`, [username]);
        return rows[0];
    },
    insert: async (data) => {
        const sql = `INSERT INTO \`user\` (name, email, phone, username, password, roles, created_at, status) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)`;
        const [res] = await db.execute(sql, [data.name, data.email, data.phone, data.username, data.password, data.roles]);
        return res.insertId;
    }
};
module.exports = userModel;