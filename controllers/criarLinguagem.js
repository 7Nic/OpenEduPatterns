const store = require('../storage/store');

module.exports = {
	getCriarLinguagem: (req, res) => {
		res.render('criarLinguagem.ejs', {});
	},
	getCriarLinguagem2: (req, res) => {
		res.render('criarLinguagem2.ejs', {});
	}
}