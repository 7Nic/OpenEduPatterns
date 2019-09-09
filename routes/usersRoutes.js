const express = require('express');
const router = express.Router();
const csrf = require('csurf'); //csurf will prevents a session to be stolen, it will send a token to the front-end, and then atoken will be received by this page; if the token is the same, everything is alright, if it's different, somebody has stolen the session
const passport = require('passport');

// Photo upload settings
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/profilePhotos'); //Error is null
    },
    filename: function(req, file, cb) {
        cb(null, "userId:" + req.user.usuarios_id + "-" +new Date().toISOString() + "-" + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        //accept file
        cb(null, true);
    } else {
        //reject file
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 1024*1024*10} //10MB
});

//Csrf protection
const csrfProtection = csrf();
// TO DISABLE CRSF PROTECTOIN, COMMENT THE LINE BELOW
router.use(csrfProtection); //It catches all requests, no matter what kind

//Require controller and passport modules
const usersController = require('../controllers/usersController');
const passportFunctions = require('../config/passport');

/// USERS ROUTES ///
router.get('/profile', passportFunctions.isLoggedIn, usersController.profileGet);

router.get('/create', usersController.usersCreateGet);
router.post('/create', usersController.usersCreatePost);

router.get('/login', usersController.usersLoginGet);
router.post('/login', passportFunctions.notLoggedIn, passportFunctions.validateLogin, passport.authenticate('local.login', {
    successRedirect: '/openedupatterns/users/profile',
    failureRedirect: '/openedupatterns/users/login',
    failureFlash: true
}));
                                 //the name of the field in <form>
router.post('/uploadphoto', upload.single('profilePhoto'), usersController.uploadProfilePhoto);

router.post('/deleteprofilephoto', usersController.deleteProfilePhoto);


// Notes for the authenticate function above:
// - After the local strategy tell us we are authenticated or not, the callback is called. Here, this callback is {sucessredirect:...}
// - But, what really happens is callback, is that the function req.login() is called. When this happens the function serializeUser is also called
// - The serializeUser stores user info in these two places:
//   console.log(req.session.passport) --> req.session.passport: {"user":"2f24vvg"}
//   console.log(req.user)             --> req.user: {"id":"2f24vvg","email":"test@test.com","password":"password"}
// Note that before the serializeUser function was called, the req.session.passport and req.user were undefined objects
// with these two objects stored, the server knows what user we are, and that we're logged in

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

module.exports = router;
