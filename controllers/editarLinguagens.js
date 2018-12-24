const store = require('../storage/store');

module.exports = {
	getEditarLinguagens: (req, res) => {
		store.pegarLinguagemPorId(req.params.id).then((resultado) => {
			console.log(resultado);
			res.render('editarLinguagens.ejs', {linguagem: resultado});
		})
	}
}