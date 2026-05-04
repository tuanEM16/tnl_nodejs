const pool = require('../config/db');

// --- HÀM TẠO CRUD CHUNG CHO ADMIN ---
const createCrud = (tableName, orderBy = 'sort_order ASC') => ({
  getAll: async () => {
    const [rows] = await pool.query(`SELECT * FROM ?? ORDER BY ${orderBy}`, [tableName]);
    return rows;
  },
  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM ?? WHERE id = ?', [tableName, id]);
    return rows[0];
  },
  create: async (data) => {
    const [result] = await pool.query('INSERT INTO ?? SET ?', [tableName, data]);
    return result.insertId;
  },
  update: async (id, data) => {
    const [result] = await pool.query('UPDATE ?? SET ? WHERE id = ?', [tableName, data, id]);
    return result.affectedRows;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM ?? WHERE id = ?', [tableName, id]);
    return result.affectedRows;
  }
});

const estimateModel = {
  // ==========================================
  // 1. CÁC HÀM DÀNH CHO PUBLIC (TÍNH TOÁN)
  // ==========================================
  getUsageTypes: async () => {
    const [rows] = await pool.query('SELECT id, name, slug FROM usage_types WHERE status = 1 ORDER BY sort_order ASC');
    return rows;
  },

  getMaterialTypes: async () => {
    const [rows] = await pool.query('SELECT id, name, slug FROM material_types WHERE status = 1 ORDER BY sort_order ASC');
    return rows;
  },

  getComplexityLevels: async () => {
    const [rows] = await pool.query('SELECT id, name, k_factor FROM complexity_levels WHERE status = 1 ORDER BY sort_order ASC');
    return rows;
  },

  getAllPriceRules: async () => {
    const [rows] = await pool.query(`
      SELECT pr.unit_price, pr.unit, u.name as usage_name, m.name as material_name, i.name as item_name
      FROM price_rules pr
      JOIN usage_types u ON pr.usage_type_id = u.id
      JOIN material_types m ON pr.material_type_id = m.id
      JOIN estimate_items i ON pr.item_id = i.id
      WHERE pr.status = 1
      ORDER BY u.sort_order ASC, m.sort_order ASC, pr.sort_order ASC
    `);
    return rows;
  },

  getHeightFactor: async (height) => {
    const [rows] = await pool.query(
      `SELECT factor_structure, factor_cover FROM height_factors 
       WHERE ? >= min_height AND ? <= max_height AND status = 1 LIMIT 1`,
      [height, height]
    );
    return rows;
  },

  getComplexityFactorById: async (id) => {
    const [rows] = await pool.query(
      `SELECT k_factor FROM complexity_levels WHERE id = ? AND status = 1 LIMIT 1`,
      [id]
    );
    return rows;
  },

  // Cập nhật lại hàm getPriceRulesByConfig trong file models/estimateModel.js
  getPriceRulesByConfig: async (usage_type_id, material_type_id) => {
    const [rows] = await pool.query(
      `SELECT pr.item_id, i.name as item_name, i.formula_type, pr.unit_price, pr.unit, pr.factor_default 
       FROM price_rules pr
       JOIN estimate_items i ON pr.item_id = i.id
       WHERE pr.usage_type_id = ? AND pr.material_type_id = ? AND pr.status = 1 
       ORDER BY pr.sort_order ASC`,
      [usage_type_id, material_type_id]
    );
    return rows;
  },

  // ==========================================
  // 2. CÁC HÀM DÀNH CHO ADMIN (QUẢN TRỊ)
  // ==========================================
  admin: {
    usageTypes: createCrud('usage_types'),
    materialTypes: createCrud('material_types'),
    complexityLevels: createCrud('complexity_levels'),
    heightFactors: createCrud('height_factors', 'min_height ASC'),
    items: createCrud('estimate_items'),
    priceRules: {
      ...createCrud('price_rules'),
      getAllJoined: async () => {
        const [rows] = await pool.query(`
          SELECT pr.*, u.name as usage_name, m.name as material_name, i.name as item_name
          FROM price_rules pr
          LEFT JOIN usage_types u ON pr.usage_type_id = u.id
          LEFT JOIN material_types m ON pr.material_type_id = m.id
          LEFT JOIN estimate_items i ON pr.item_id = i.id
          ORDER BY u.sort_order ASC, m.sort_order ASC, pr.sort_order ASC
        `);
        return rows;
      }
    }
  }
};

module.exports = estimateModel;