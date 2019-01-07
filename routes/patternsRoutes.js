const express = require('express');
const router = express.Router();

//Require controller modules
var patternsController = require('../controllers/patternsController');

/// LANGUAGES ROUTES ///
router.get('/', patternsController.index); //Languages Home Page, list all languages

router.get('/create', patternsController.patternsCreateGet); 
router.post('/create', patternsController.patternsCreatePost); 

router.get('/:id/edit', patternsController.patternsEditGet); 
router.post('/:id/edit', patternsController.patternsEditPost);

router.get('/:id/delete', patternsController.patternsDeleteGet);
router.post('/:id/delete', patternsController.patternsDeletePost);

module.exports = router;