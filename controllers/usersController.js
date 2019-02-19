const store = require('../storage/store');
const multer = require('multer');

module.exports = {
    async usersCreateGet (req, res) {
        res.render('cadastro.ejs', {csrfToken: req.csrfToken(), messages: req.flash('error'), user: req.user});
    },

    async usersCreatePost (req, res) {
        var name = req.body.name;    
        var email = req.body.email;
        var password = req.body.password;
        var passwordConfirmation = req.body.confirm;        
        
        //Validate fields
        req.checkBody('name', 'Campo de nome vazio').notEmpty();
        req.checkBody('email', 'Email inválido').isEmail();
        req.checkBody('email', 'Campo de email vazio').notEmpty();
        req.checkBody('password', 'Campo de senha vazio').notEmpty();
        req.checkBody('password', 'Senha com menos de 4 caracteres').isLength({min: 4});
        if (password != passwordConfirmation) {
            //This function tells if the fileds are equal, not different (what I need), this if solves the problem
            req.checkBody('passwordConfirmation', 'Erro na confirmação de senha').equals(passwordConfirmation);
        }

        var errors = req.validationErrors();
        if(errors) {
            var messages = [];
            errors.forEach((error) => {
                messages.push(error.msg);
            });
            req.flash('error', messages);
            res.redirect('/users/create');
        } else {
            var user = await store.findUserByEmail(email);
            if(user) {
                req.flash('error', 'Email já registrado');
                res.redirect('/users/create');
            } else {
                await store.createUser({name, email, password});
                res.redirect('/');
            }
        }
    },

    async usersLoginGet (req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/users/profile');
        } else {
            res.render('login.ejs', {csrfToken: req.csrfToken(), messages: req.flash('error'), user: req.user});
        }
    },

    async profileGet (req, res) {
        var languages = await store.userLanguages(req.user.usuarios_id);
        var patterns = await store.userPatterns(req.user.usuarios_id);
        var profilePhoto = await store.getProfilePhoto(req.user.usuarios_id);
        res.render('profile.ejs', {profilePhoto, user: req.user, languages, patterns, csrfToken: req.csrfToken()});
    },

    async uploadProfilePhoto (req, res) {
        await store.storeProfilePhoto(req.user.usuarios_id, req.file.filename);
        res.redirect('/users/profile');
    },

    async deleteProfilePhoto (req, res) {
        await store.deleteProfilePhoto(req.user.usuarios_id);
        res.redirect('/users/profile');
    }
}