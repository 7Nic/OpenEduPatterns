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

passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
     console.log(`Amigo, estou aqui. email: ${email}`);
     store.authenticate({email, password}).then(({success}) => {
        if (success) {
            store.findUserByEmail(email).then((user) => {
                console.log(`peguei isso ${user.usuarios_id}`);
                //This result is the user
                return done(null, user);
            })
         } else {
             done(null, false, {message: 'E-mail ou senha inválidos'}); 
         }
     })
}));