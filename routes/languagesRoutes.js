const express = require('express');
const router = express.Router();

//Require controller modules
const languagesController = require('../controllers/languagesController');

/// LANGUAGES ROUTES ///
router.get('/', languagesController.index); //Languages Home Page, list all languages

router.get('/create', languagesController.languagesCreateGet); 
router.post('/create', languagesController.languagesCreatePost); 

router.get('/:id/edit', languagesController.languagesEditGet); 
router.post('/:id/edit', languagesController.languagesEditPost);

router.post('/:id/delete', languagesController.languagesDeletePost);

router.post('/:id/edit/relatepattern', languagesController.relatePatternPost);

router.post('/:id/edit/unrelatepattern', languagesController.unrelatePatternPost);

module.exports = router;