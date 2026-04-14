const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');


router.post('/send', contactController.sendContact);


router.get('/list', contactController.getContacts);

module.exports = router;