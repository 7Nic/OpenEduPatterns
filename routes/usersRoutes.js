const express = require('express');
const router = express.Router();
const csrf = require('csurf'); //csurf will prevents a session to be stolen, it will send a token to the front-end, and then atoken will be received by this page; if the token is the same, everything is alright, if it's different, somebody has stolen the session
const passport = require('passport');

const csrfProtection = csrf();
router.use(csrfProtection); //It catches all requests, no matter what kind

//Require controller modules
const usersController = require('../controllers/usersController');

/// USERS ROUTES ///
router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile.ejs', {user: req.user});
});

router.get('/create', usersController.usersCreateGet);
router.post('/create', usersController.usersCreatePost);

router.post('/login', notLoggedIn, passport.authenticate('local.login', {
    successRedirect: '/users/profile',
    failureRedirect: '/',
    failureFlash: true
}));

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
})

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.render('mensagem.ejs', {mensagem: "You're not allowed to use this route. You're not logged in"});
    }
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.render('mensagem.ejs', {mensagem: "You're not allowed to use this route. You're not logged out"});
    }
}