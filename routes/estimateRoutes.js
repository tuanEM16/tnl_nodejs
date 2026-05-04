const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimateController');

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================
router.get('/options', estimateController.getOptions);
router.post('/calculate', estimateController.calculate);

// ==========================================
// 2. ADMIN CRUD ROUTES
// ==========================================
const setupRoutes = (path, controller) => {
  router.get(`/${path}`, controller.getAll);
  router.get(`/${path}/:id`, controller.getById);
  router.post(`/${path}`, controller.create);
  router.put(`/${path}/:id`, controller.update);
  router.delete(`/${path}/:id`, controller.delete);
};

setupRoutes('usage-types', estimateController.admin.usageTypes);
setupRoutes('material-types', estimateController.admin.materialTypes);
setupRoutes('complexity-levels', estimateController.admin.complexityLevels);
setupRoutes('height-factors', estimateController.admin.heightFactors);
setupRoutes('price-rules', estimateController.admin.priceRules);
setupRoutes('items', estimateController.admin.items);

module.exports = router;