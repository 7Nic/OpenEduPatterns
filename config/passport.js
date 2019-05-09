const passport = require('passport');
const store = require('../storage/store');
const LocalStrategy = require('passport-local').Strategy;

// This serializeUser function will be executed right after authentication
// What this function does?
// 1) saves the user id to the session file store 
// 2) saves the user id in the request object as request.session.passport and 
// 3) adds the user object to the request object as request.user
passport.serializeUser((user, done) => {
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
            if (req.cookies.lang == 'en') {
                done(null, false, {message: 'E-mail or password invalid'}); 
            } else {
                done(null, false, {message: 'E-mail ou senha inválidos'}); 
            }
            
        }
    });
}));

//Functions used in other files
module.exports = {
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            if (req.cookies.lang == 'en') {
                res.render('mensagem.ejs', {mensagem: "You're not allowed to use this function. You're not logged in"});
            } else {
                res.render('mensagem.ejs', {mensagem: "Você não tem acesso a essa função, você não está logado."});
            }
        }
    },
    notLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            next();
        } else {
            if (req.cookies.lang == 'en') {
                res.render('mensagem.ejs', {mensagem: "You're not allowed to use this route. You're not logged out"});
            } else {
                res.render('mensagem.ejs', {mensagem: "Você não pode usar esta funcionalidade pois não está deslogado."});
            }
        }
    },
    validateLogin(req, res, next) {
        if (req.cookies.lang == 'en') {
            req.checkBody('email', 'Invalid Email').isEmail();
            req.checkBody('email', 'Email field empty').notEmpty();
            req.checkBody('password', 'Password field empty').notEmpty();
        } else {
            req.checkBody('email', 'Email inválido').isEmail();
            req.checkBody('email', 'Campo de email vazio').notEmpty();
            req.checkBody('password', 'Campo de senha vazio').notEmpty();
        }
        

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
    },
    isOwnerOfPattern(req, res, next) {
        if (req.isAuthenticated()) {
            var patternId = req.params.id;
            store.ownerOfPattern(patternId).then((ownerOfPattern) => {
                if (req.user.usuarios_id === ownerOfPattern.usuarios_id) {
                    next();
                } else {
                    if (req.cookies.lang == 'en') {
                        res.render('mensagem.ejs', {mensagem: "You're not the owner of this pattern. You can't edit it."});
                    } else {
                        res.render('mensagem.ejs', {mensagem: "Você não é o dono deste Padrão e não pode editá-lo."});
                    }
                }
            });
        } else {
            if (req.cookies.lang == 'en') {
                res.render('mensagem.ejs', {mensagem: "You're not allowed to use this function. You're not logged in"});
            } else {
                res.render('mensagem.ejs', {mensagem: "Você não tem acesso a essa função, você não está logado."});
            }
        }
        

    },
    isOwnerOfLanguage(req, res, next) {
        if (req.isAuthenticated()) {
            var languageId = req.params.id;
            store.ownerOfLanguage(languageId).then((ownerOfLanguage) => {
                if (req.user.usuarios_id === ownerOfLanguage.usuarios_id) {
                    next();
                } else {
                    if (req.cookies.lang == 'en') {
                        res.render('mensagem.ejs', {mensagem: "You're not the owner of this language. You can't edit it."});
                    } else {
                        res.render('mensagem.ejs', {mensagem: "Você não é o dono desta Linguagem e não pode editá-la."});
                    }         
                }
            });
        } else {
            if (req.cookies.lang == 'en') {
                res.render('mensagem.ejs', {mensagem: "You're not allowed to use this function. You're not logged in"});
            } else {
                res.render('mensagem.ejs', {mensagem: "Você não tem acesso a essa função, você não está logado."});
            }
        }
    }
}