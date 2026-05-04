const estimateService = require('../services/estimateService');
const estimateModel = require('../models/estimateModel');

// --- HÀM TẠO CONTROLLER CHUNG CHO ADMIN ---
const createAdminController = (model, isPriceRule = false) => ({
  getAll: async (req, res) => {
    try {
      const data = isPriceRule ? await model.getAllJoined() : await model.getAll();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getById: async (req, res) => {
    try {
      const data = await model.getById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  create: async (req, res) => {
    try {
      const id = await model.create(req.body);
      res.json({ success: true, message: 'Thêm mới thành công', data: { id } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      await model.update(req.params.id, req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      await model.delete(req.params.id);
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

const estimateController = {
  // ==========================================
  // 1. PUBLIC CONTROLLERS
  // ==========================================
  getOptions: async (req, res) => {
    try {
      const data = await estimateService.getOptions();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  calculate: async (req, res) => {
    try {
      const { length, width, height, usage_type_id, material_type_id } = req.body;
      
      if (!length || !width || !height || !usage_type_id || !material_type_id) {
        return res.status(400).json({ success: false, message: 'Thiếu thông số bắt buộc' });
      }

      const result = await estimateService.calculateQuickEstimate(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // ==========================================
  // 2. ADMIN CONTROLLERS
  // ==========================================
  admin: {
    usageTypes: createAdminController(estimateModel.admin.usageTypes),
    materialTypes: createAdminController(estimateModel.admin.materialTypes),
    complexityLevels: createAdminController(estimateModel.admin.complexityLevels),
    heightFactors: createAdminController(estimateModel.admin.heightFactors),
    priceRules: createAdminController(estimateModel.admin.priceRules, true),
    
    // 🟢 Chèn thẳng bảng Items vào đây luôn cho lẹ, không cần rườm rà ở trên
    items: createAdminController(estimateModel.admin.items) 
  }
};

module.exports = estimateController;