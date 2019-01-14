const store = require('../storage/store');

module.exports = {
    usersCreateGet: (req, res) => {
        res.render('cadastro.ejs', {csrfToken: req.csrfToken(), messages: req.flash('error'), user: req.user});
    },
    usersCreatePost: (req, res) => {
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
            store.findUserByEmail(email).then((user) => {
                console.log(user);
                if(user) {
                    req.flash('error', 'Email já registrado');
                    res.redirect('/users/create');
                } else {
                    store.createUser({name, email, password}).then(() => res.redirect('/'));
                }
            });
        }
    },
    usersLoginGet: (req, res) => {
        if (req.isAuthenticated()) {
            res.redirect('/users/profile');
        } else {
            res.render('login.ejs', {csrfToken: req.csrfToken(), messages: req.flash('error'), user: req.user});
        }
    }
}