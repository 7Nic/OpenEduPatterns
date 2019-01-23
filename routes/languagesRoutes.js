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

router.get('/:id', languagesController.languagePageGet);

router.post('/:id/addcomment', passportFunctions.isLoggedIn, languagesController.addCommentLanguage);

router.get('/:id/edit', passportFunctions.isOwnerOfLanguage, languagesController.languagesEditGet); 
router.post('/:id/edit', passportFunctions.isOwnerOfLanguage, languagesController.languagesEditPost);

router.post('/:id/delete',  passportFunctions.isOwnerOfLanguage,languagesController.languagesDeletePost);

router.post('/:id/edit/relatepattern', passportFunctions.isOwnerOfLanguage, languagesController.relatePatternPost);

router.post('/:id/edit/unrelatepattern', passportFunctions.isOwnerOfLanguage, languagesController.unrelatePatternPost);

module.exports = router;