const express = require('express');
const router = express.Router();

//Require controller modules
const indexController = require('../controllers/indexController');

/// INDEX ROUTES ///
router.get('/', indexController.homePageGet);

router.get('/about', indexController.sobreGet);

//Se der ruim, tente tirar a barra (/) inicial de cada um dos caminhos

module.exports = router;