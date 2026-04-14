const express = require('express');
const router = express.Router();


const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const bannerRoutes = require('./bannerRoutes');
const postRoutes = require('./postRoutes');
const menuRoutes = require('./menuRoutes');
const contactRoutes = require('./contactRoutes');
const configRoutes = require('./configRoutes');


router.use('/products', productRoutes); 
router.use('/orders', orderRoutes);     
router.use('/users', userRoutes);      
router.use('/categories', categoryRoutes); 
router.use('/banners', bannerRoutes);   
router.use('/posts', postRoutes);       
router.use('/menus', menuRoutes);      
router.use('/contacts', contactRoutes); 
router.use('/configs', configRoutes);   

module.exports = router;