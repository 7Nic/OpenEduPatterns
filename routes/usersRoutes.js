const express = require('express');
const router = express.Router();

//Require controller modules
const usersController = require('../controllers/usersController');

router.get('/create', usersController.usersCreateGet);
router.post('/create', usersController.usersCreatePost);

router.post('/login', usersController.login);

module.exports = router;