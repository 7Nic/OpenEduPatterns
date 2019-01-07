const store = require('../storage/store');

module.exports = {
    homePageGet: (req, res) => {
        res.render('index.ejs', {});
    },
    sobreGet: (req, res) => {
        res.render('sobre.ejs');
    }
}