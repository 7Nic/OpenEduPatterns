const store = require('../storage/store');

module.exports = {
    //Pegar as linguagens e padroes do usuario e mostrar na tela
    getPerfilUsuario: (req, res) => {
        res.render('perfilUsuario.ejs');
    }

    // getEditarPadroes: (req, res) => {
    //     store.pegarPadraoPorId(req.params.id).then((resultado) => {
    //         res.render('editarPadroes.ejs', {padrao: resultado});
    //     })
	// }
}