const store = require('../storage/store');

module.exports = {
    usersCreateGet: (req, res) => {
        res.render('cadastro.ejs', {csrfToken: req.csrfToken()});
    },
    usersCreatePost: (req, res) => {
            store
            .createUser({
                name: req.body.name,    
                email: req.body.email,
                password: req.body.password
            })
            .then(() => res.redirect('/'));
    }
}