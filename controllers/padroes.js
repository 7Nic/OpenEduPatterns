const store = require('../storage/store');

module.exports = {
	getPadroes: (req, res) => {
		store.listarPadroes().then((resultado) => {
			res.render('padroes.ejs', {padroes: resultado});
		});
	}
}