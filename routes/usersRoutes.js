const express = require('express');
const router = express.Router();
const csrf = require('csurf'); //csurf will prevents a session to be stolen, it will send a token to the front-end, and then atoken will be received by this page; if the token is the same, everything is alright, if it's different, somebody has stolen the session
const passport = require('passport');

const csrfProtection = csrf();
router.use(csrfProtection); //It catches all requests, no matter what kind

//Require controller and passport modules
const usersController = require('../controllers/usersController');
const passportFunctions = require('../config/passport');

/// USERS ROUTES ///
router.get('/profile', passportFunctions.isLoggedIn, (req, res) => {
    res.render('profile.ejs', {user: req.user});
});

router.get('/create', usersController.usersCreateGet);
router.post('/create', usersController.usersCreatePost);

router.get('/login', usersController.usersLoginGet);
router.post('/login', passportFunctions.notLoggedIn, passportFunctions.validateLogin, passport.authenticate('local.login', {
    successRedirect: '/users/profile',
    failureRedirect: '/users/login',
    failureFlash: true
}));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

module.exports = router;
