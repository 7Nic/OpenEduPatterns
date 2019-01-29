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

router.get('/chosetemplate', passportFunctions.isLoggedIn, patternsController.choseTemplateGet);
router.post('/chosetemplate', passportFunctions.isLoggedIn, patternsController.choseTemplatePost);

router.get('/create', passportFunctions.isLoggedIn, patternsController.patternsCreateGet); 
router.post('/create', passportFunctions.isLoggedIn, patternsController.patternsCreatePost); 

router.get('/:id', patternsController.patternPageGet);

router.post('/:id/addcomment', passportFunctions.isLoggedIn, patternsController.addCommentPattern);

router.get('/:id/edit', passportFunctions.isOwnerOfPattern, patternsController.patternsEditGet);
router.post('/:id/edit', passportFunctions.isOwnerOfPattern, patternsController.patternsEditPost);

router.post('/:id/delete', passportFunctions.isOwnerOfPattern, patternsController.patternsDeletePost);

module.exports = router;