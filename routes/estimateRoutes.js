const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimateController');

// ==========================================
// 1. PUBLIC ROUTES (Gốc: /estimates)
// ==========================================
router.get('/options', estimateController.getOptions);
router.post('/calculate', estimateController.calculate);

// ==========================================
// 2. ADMIN ROUTES (Gốc: /estimates/admin/...)
// ==========================================
const setupAdminRoutes = (path, controller) => {
  router.get(`/admin/${path}`, controller.getAll);
  router.get(`/admin/${path}/:id`, controller.getById);
  router.post(`/admin/${path}`, controller.create);
  router.put(`/admin/${path}/:id`, controller.update);
  router.delete(`/admin/${path}/:id`, controller.delete);
};

setupAdminRoutes('usage-types', estimateController.admin.usageTypes);
setupAdminRoutes('material-types', estimateController.admin.materialTypes);
setupAdminRoutes('complexity-levels', estimateController.admin.complexityLevels);
setupAdminRoutes('height-factors', estimateController.admin.heightFactors);
setupAdminRoutes('price-rules', estimateController.admin.priceRules);

module.exports = router;