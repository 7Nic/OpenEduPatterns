const store = require('../storage/store');

module.exports = {
	getEditarLinguagens: (req, res) => {
		store.pegarLinguagemPorId(req.params.id).then((resultadoLinguagem) => {
			store.padroesDeUmaLinguagem(req.params.id).then((resultadoJoin) => {
				store.listarPadroes().then((resultadoListarPadroes) => {
					res.render('editarLinguagens.ejs', {linguagem: resultadoLinguagem, padroesRelacionados: resultadoJoin, todosPadroes: resultadoListarPadroes});
				})
			})
		});
		
	}
}

// poe esse comando ai que ja retorna tudo o que voce pode querer
// SELECT * FROM padroes p INNER JOIN linguagens_padroes lp ON p.padroes_id = lp.padroes_id INNER JOIN linguagens l ON lp.linguagens_id = l.linguagens_id WHERE l.linguagens_id=21;

// select * from linguagens l inner join linguagens_padroes lp on l.linguagens_id = lp.linguagens_id inner join padroes p on lp.padroes_id = p.padroes_id where l.linguagens_id=11;