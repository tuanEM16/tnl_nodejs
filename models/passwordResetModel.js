const pool = require('../config/db');
const crypto = require('crypto');

const PasswordReset = {
    create: async (email) => {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await pool.query(
            `INSERT INTO password_reset (email, token, expires_at, created_at) VALUES (?, ?, ?, NOW())`,
            [email, token, expiresAt]
        );
        return token;
    },

    verify: async (token) => {
        const [rows] = await pool.query(
            `SELECT * FROM password_reset WHERE token = ? AND expires_at > NOW()`,
            [token]
        );
        return rows[0];
    },

    deleteByEmail: async (email) => {
        await pool.query(`DELETE FROM password_reset WHERE email = ?`, [email]);
    },

    deleteByToken: async (token) => {
        await pool.query(`DELETE FROM password_reset WHERE token = ?`, [token]);
    }
};

module.exports = PasswordReset;