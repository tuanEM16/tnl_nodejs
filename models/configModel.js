const pool = require('../config/db');

const Config = {
    getFixed: async () => {
        const [rows] = await pool.query(`SELECT * FROM config WHERE id = 1`);
        return rows[0] || null;
    },

    getAllMeta: async () => {
        const [rows] = await pool.query(`SELECT meta_key, meta_value FROM config_meta WHERE config_id = 1`);
        return rows;
    },

    getFullConfig: async () => {
        const fixed = await Config.getFixed();
        const metaRows = await Config.getAllMeta();
        const meta = {};
        metaRows.forEach(row => {
            meta[row.meta_key] = row.meta_value;
        });
        return { ...fixed, ...meta };
    },

    updateFixed: async (data) => {
        const fields = [];
        const values = [];
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(data[key]);
            }
        });
        if (fields.length === 0) return;
        values.push(1);
        await pool.query(`UPDATE config SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
    },

    upsertMeta: async (key, value) => {
        await pool.query(
            `INSERT INTO config_meta (config_id, meta_key, meta_value, created_at)
             VALUES (1, ?, ?, NOW())
             ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value), updated_at = NOW()`,
            [key, value]
        );
    },

    deleteMeta: async (key) => {
        await pool.query(`DELETE FROM config_meta WHERE config_id = 1 AND meta_key = ?`, [key]);
    }
};

module.exports = Config;