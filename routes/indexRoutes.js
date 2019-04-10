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

router.get('/setlang/:lang', indexController.setLanguage);

router.get('/generalsearch', indexController.generalSearchGet);

router.post('/generalsearch', indexController.generalSearchPost);

router.get('/filteredsearch', indexController.filteredSearchGet);

router.post('/filteredsearch', indexController.filteredSearchPost);

router.get('/filteredpatternsearch', indexController.filteredPatternSearchGet);

router.post('/filteredpatternsearch', indexController.filteredPatternSearchPost);

router.get('/table', indexController.table);

module.exports = router;