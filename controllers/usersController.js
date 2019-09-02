const store = require('../storage/store');
const multer = require('multer');

module.exports = {
    async usersCreateGet (req, res) {
        var breadCrumbContent = [{name: req.__('Criação de conta'), href: "#"}];
        res.render('cadastro.ejs', {breadCrumbContent, csrfToken: req.csrfToken(), messages: req.flash('error'), user: req.user});
    },

    async usersCreatePost (req, res) {
        var name = req.body.name;    
        var email = req.body.email;
        var password = req.body.password;
        var passwordConfirmation = req.body.confirm;        
        
        //Validate fields
        if (req.cookies.lang == 'en') {
            req.checkBody('name', 'Field Name is empty').notEmpty();
            req.checkBody('email', 'Invalid Email').isEmail();
            req.checkBody('email', 'Field Email is empty').notEmpty();
            req.checkBody('password', 'Field Password is empty').notEmpty();
            req.checkBody('password', 'Password has less than 4 characters').isLength({min: 4});
            if (password != passwordConfirmation) {
                //This function tells if the fileds are equal, not different (what I need), this if solves the problem
                req.checkBody('passwordConfirmation', 'Erro na confirmação de senha').equals(passwordConfirmation);
            }
        } else {
            req.checkBody('name', 'Campo de nome vazio').notEmpty();
            req.checkBody('email', 'Email inválido').isEmail();
            req.checkBody('email', 'Campo de email vazio').notEmpty();
            req.checkBody('password', 'Campo de senha vazio').notEmpty();
            req.checkBody('password', 'Senha com menos de 4 caracteres').isLength({min: 4});
            if (password != passwordConfirmation) {
                //This function tells if the fileds are equal, not different (what I need), this if solves the problem
                req.checkBody('passwordConfirmation', 'Erro na confirmação de senha').equals(passwordConfirmation);
            }
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
        var breadCrumbContent = [{name: req.__('Entrar'), href: "#"}];
        if (req.isAuthenticated()) {
            res.redirect('/users/profile');
        } else {
            res.render('login.ejs', {breadCrumbContent, csrfToken: req.csrfToken(), messages: req.flash('error'), user: req.user});
        }
    },

    async profileGet (req, res) {
        console.log("Setting (context pattern language) cookie to undefined");
        res.cookie('contextLanguageId', "noContextLanguageId");

        var languages = await store.userLanguages(req.user.usuarios_id);
        var patterns = await store.userPatterns(req.user.usuarios_id);
        var profilePhoto = await store.getProfilePhoto(req.user.usuarios_id);

        var breadCrumbContent = [{name: req.__('Perfil'), href: "#"}];
        res.render('profile.ejs', {breadCrumbContent, profilePhoto, user: req.user, languages, patterns, csrfToken: req.csrfToken(), messages: req.flash('feedback')});
    },

    async uploadProfilePhoto (req, res) {
        await store.storeProfilePhoto(req.user.usuarios_id, req.file.filename);
        if (req.cookies.lang == 'en') {
            req.flash('feedback', "Photo uploaded successfully");
        } else {
            req.flash('feedback', "Upload feito com sucesso");
        }
        res.redirect('/users/profile');
    },

    async deleteProfilePhoto (req, res) {
        await store.deleteProfilePhoto(req.user.usuarios_id);
        if (req.cookies.lang == 'en') {
            req.flash('feedback', "Photo deleted successfully");
        } else {
            req.flash('feedback', "Foto deletada com sucesso");
        }
        res.redirect('/users/profile');
    }
}