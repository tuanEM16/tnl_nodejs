const pool = require('../config/db');

const Config = {
    get: async () => {
        const [rows] = await pool.query(`SELECT * FROM config LIMIT 1`);
        return rows[0] || null;
    },

    update: async (data) => {
        const config = await Config.get();
        if (!config) {
            const fields = Object.keys(data);
            const values = Object.values(data);
            const placeholders = fields.map(() => '?').join(', ');
            await pool.query(
                `INSERT INTO config (${fields.join(', ')}) VALUES (${placeholders})`,
                values
            );
            return;
        }
        const fields = [];
        const values = [];
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        });
        if (fields.length === 0) return;
        await pool.query(
            `UPDATE config SET ${fields.join(', ')} WHERE id = ?`,
            [...values, config.id]
        );
    }
};

module.exports = Config;