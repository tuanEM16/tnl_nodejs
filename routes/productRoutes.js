const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/products', productController.index);
router.get('/products/slug/:slug', productController.showBySlug);
router.get('/products/:id', productController.show);
router.get('/attributes', productController.getAttributes);


router.post('/attributes', authMiddleware, productController.storeAttribute);
router.put('/attributes/:id', authMiddleware, productController.updateAttribute);
router.delete('/attributes/:id', authMiddleware, productController.destroyAttribute);

router.post('/products', authMiddleware, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), productController.store);

router.put('/products/:id', authMiddleware, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), productController.update);

router.delete('/products/:id', authMiddleware, productController.destroy);

module.exports = router;