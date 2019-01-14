const express = require('express');
const router = express.Router();
const csrf = require('csurf');

const csrfProtection = csrf();
router.use(csrfProtection);

//Require controller and passport modules
var patternsController = require('../controllers/patternsController');
const passportFunctions = require('../config/passport');

/// LANGUAGES ROUTES ///
router.get('/', patternsController.index); //Languages Home Page, list all languages

router.get('/create', passportFunctions.isLoggedIn, patternsController.patternsCreateGet); 
router.post('/create', passportFunctions.isLoggedIn, patternsController.patternsCreatePost); 

router.get('/:id/edit', passportFunctions.isLoggedIn, patternsController.patternsEditGet); 
router.post('/:id/edit', passportFunctions.isLoggedIn, patternsController.patternsEditPost);

router.get('/:id/delete', passportFunctions.isLoggedIn, patternsController.patternsDeleteGet);
router.post('/:id/delete', passportFunctions.isLoggedIn, patternsController.patternsDeletePost);

module.exports = router;