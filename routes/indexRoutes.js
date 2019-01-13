const express = require('express');
const router = express.Router();
const csrf = require('csurf');

const csrfProtection = csrf();
router.use(csrfProtection);

//Require controller modules
const indexController = require('../controllers/indexController');

/// INDEX ROUTES ///
router.get('/', indexController.homePageGet);

router.get('/about', indexController.aboutGet);

//Se der ruim, tente tirar a barra (/) inicial de cada um dos caminhos

module.exports = router;