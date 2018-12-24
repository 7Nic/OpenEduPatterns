const store = require('../storage/store');

module.exports = {
	getLinguagens: (req, res) => {
		store.listarLinguagens().then((resultado) => {
			res.render('linguagens.ejs', {linguagens: resultado});
		})
	}
}