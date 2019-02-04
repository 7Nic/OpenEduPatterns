const store = require('../storage/store');

module.exports = {
    homePageGet: (req, res) => {
            res.render('index.ejs', {csrfToken: req.csrfToken(), user: req.user});
    },
    aboutGet: (req, res) => {
        res.render('sobre.ejs', {user: req.user, csrfToken: req.csrfToken(), user: req.user});
    }
}