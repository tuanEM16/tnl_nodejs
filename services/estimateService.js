const estimateModel = require('../models/estimateModel');

const estimateService = {
  getOptions: async () => {
    const usageTypes = await estimateModel.getUsageTypes();
    const materialTypes = await estimateModel.getMaterialTypes();
    const complexityLevels = await estimateModel.getComplexityLevels();
    const priceRules = await estimateModel.getAllPriceRules();
    const items = await estimateModel.admin.items.getAll();
    return { usageTypes, materialTypes, complexityLevels, priceRules, items };
  },

  calculateQuickEstimate: async (data) => {
    const { length, width, height, usage_type_id, material_type_id, complexity_id } = data;

    const heightFactors = await estimateModel.getHeightFactor(height);

    if (heightFactors.length === 0) {
      throw new Error('Chiều cao vượt quá giới hạn thiết kế tiêu chuẩn (tối đa 25m). Vui lòng liên hệ trực tiếp để nhận báo giá chi tiết.');
    }

    const complexityLevels = await estimateModel.getComplexityFactorById(complexity_id);

    const hFactor = heightFactors[0];
    const kFactor = complexityLevels[0]?.k_factor || 1.0;

    const floor_area = length * width;
    const wall_area = 2 * (length + width) * height;
    const roof_area = floor_area * 1.05; 
    const total_cover_area = wall_area + roof_area;

    const priceRules = await estimateModel.getPriceRulesByConfig(usage_type_id, material_type_id);

    let total_estimated = 0;
    const estimate_items = [];

    priceRules.forEach(rule => {
      let quantity = 0;
      let applied_factor = 1;

      const formulaType = rule.formula_type;

      if (formulaType === 'structure') {
        quantity = floor_area; 
        applied_factor = hFactor.factor_structure * kFactor; 
      } else if (formulaType === 'roof') {
        quantity = roof_area;
        applied_factor = hFactor.factor_cover;
      } else if (formulaType === 'wall') {
        quantity = wall_area;
        applied_factor = hFactor.factor_cover;
      }

      const total_price = rule.unit_price * quantity * applied_factor * (rule.factor_default ?? 1);  
      total_estimated += total_price;

      estimate_items.push({
        item_name: rule.item_name,
        unit_price: rule.unit_price,
        factor: applied_factor,
        quantity: quantity,
        unit: rule.unit,
        total_price: total_price
      });
    });

    return {
      summary: { 
        floor_area, 
        roof_area, 
        wall_area, 
        total_cover_area, 
        total_estimated 
      },
      items: estimate_items
    };
  }
};

module.exports = estimateService;