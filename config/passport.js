const passport = require('passport');
const store = require('../storage/store');
const LocalStrategy = require('passport-local').Strategy;

//Here we configure which information of the user will be stored in the session. To access use => req.session.passport.user
passport.serializeUser((user, done) => {
    console.log(`Amiguinho, o user.id é ${user.usuarios_id}`);
    done(null, user.usuarios_id);
});

//Here we use the info stored in the session (in this case, usuarios_id) to access the user in the database
passport.deserializeUser((id, done) => {
    store.findUserById(id).then((user) => {
        done(null, user);
    });
});

//passport.autheticate
passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    store.authenticate({email, password}).then(({success}) => {
        if (success) {
            store.findUserByEmail(email).then((user) => {
                return done(null, user);
        })
        } else {
            console.log('hey');
            done(null, false, {message: 'E-mail ou senha inválidos'}); 
        }
    });
}));

//Functions used in other files
module.exports = {
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.render('mensagem.ejs', {mensagem: "You're not allowed to use this route. You're not logged in"});
        }
    },
    notLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            next();
        } else {
            res.render('mensagem.ejs', {mensagem: "You're not allowed to use this route. You're not logged out"});
        }
    },
    validateLogin(req, res, next) {
        req.checkBody('email', 'Email inválido').isEmail();
        req.checkBody('email', 'Campo de email vazio').notEmpty();
        req.checkBody('password', 'Campo de senha vazio').notEmpty();

        var errors = req.validationErrors();

        if (errors) {
            var messages = [];
            errors.forEach((error) => {
                messages.push(error.msg);
            });
            req.flash('error', messages);
            res.redirect('/users/login');
        } else {
            next();
        }
    }
}