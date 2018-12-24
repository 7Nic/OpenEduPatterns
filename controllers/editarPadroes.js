const store = require('../storage/store');

module.exports = {
	getEditarPadroes: (req, res) => {
        store.pegarPadraoPorId(req.params.id).then((resultado) => {
            res.render('editarPadroes.ejs', {padrao: resultado});
        })
	}
}