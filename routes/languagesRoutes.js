const express = require('express');
const router = express.Router();
const csrf = require('csurf');

const csrfProtection = csrf();
router.use(csrfProtection);

//Require controller and passport modules
const languagesController = require('../controllers/languagesController');
const passportFunctions = require('../config/passport');

/// LANGUAGES ROUTES ///
router.get('/', languagesController.index); //Languages Home Page, list all languages

router.get('/create', passportFunctions.isLoggedIn, languagesController.languagesCreateGet); 
router.post('/create', passportFunctions.isLoggedIn, languagesController.languagesCreatePost); 

router.get('/:id/edit', passportFunctions.isLoggedIn, languagesController.languagesEditGet); 
router.post('/:id/edit', passportFunctions.isLoggedIn, languagesController.languagesEditPost);

//Todo
router.post('/:id/delete',  passportFunctions.isLoggedIn,languagesController.languagesDeletePost); //Actually, just the owner of the language can delete it

router.post('/:id/edit/relatepattern', passportFunctions.isLoggedIn, languagesController.relatePatternPost);

router.post('/:id/edit/unrelatepattern', passportFunctions.isLoggedIn, languagesController.unrelatePatternPost);

module.exports = router;