const store = require('../storage/store');

module.exports = {
    index: (req, res) => {
        store.listarLinguagens().then((resultado) => {
			res.render('linguagens.ejs', {linguagens: resultado, csrfToken: req.csrfToken(), user: req.user});
		});
    },

    languagesCreateGet: (req, res) => {
        res.render('criarLinguagem.ejs', {csrfToken: req.csrfToken(), user: req.user});
    },

    languagesCreatePost: (req, res) => {
        var visibilidadeNum = null;
        if(req.body.visibilidade === 'Público'){
            visibilidadeNum = 0;
        } else if(req.body.visibilidade === 'Privado'){
            visibilidadeNum = 1;
        } else {
            visibilidadeNum = null;
        }
        // Se os campos estiverem vazios nada será inserido no banco de dados
        console.log(req.body.nomeLinguagem);
        if (req.body.nomeLinguagem === '' || req.body.descricaoLinguagem === ''){
            res.redirect('/languages');
        } else {
            store.criarLinguagem({
                nomeLinguagem: req.body.nomeLinguagem,
                visibilidade: visibilidadeNum,
                descricaoLinguagem: req.body.descricaoLinguagem
            })
            .then(() => {
                res.redirect('/languages');
            });
        }
    },

    languagesEditGet: (req, res) => {
        store.pegarLinguagemPorId(req.params.id).then((resultadoLinguagem) => {
			store.padroesDeUmaLinguagem(req.params.id).then((resultadoJoin) => {
				store.listarPadroes().then((resultadoListarPadroes) => {
					res.render('editarLinguagens.ejs', {linguagem: resultadoLinguagem, padroesRelacionados: resultadoJoin, todosPadroes: resultadoListarPadroes, csrfToken: req.csrfToken(), user: req.user});
				})
			})
		});
    },

    languagesEditPost: (req, res) => {
        var data = req.body;
        if(data.visibilidade === 'Público'){
            data.visibilidade = 0;
        } else if(data.visibilidade === 'Privado'){
            data.visibilidade = 1;
        } else {
            data.visibilidade = null;
        }
        store.editarLinguagem({data, Id: req.params.id})
        .then(() => {
            res.redirect('/languages');
        });
    },

    languagesDeletePost: (req, res) => {
        store.deletarLinguagem(req.params.id)
        .then(() => {
            res.redirect('/languages');
        });
    },

    relatePatternPost: (req, res) => {
        var idLinguagem = req.params.id;
        var tituloPadrao = req.body.tituloPadraoRelacionado;
        store.pegarIdPadraoPorTitulo(tituloPadrao)
        .then((restultadoBusca) => {
            var idPadrao = restultadoBusca.padroes_id;
            store.relacionarPadraoLinguagem(idLinguagem, idPadrao)
            .then(() => {
                res.redirect(`/languages/${idLinguagem}/edit`);
            })
        });
    },
    unrelatePatternPost: (req, res) => {
        var idLinguagem = req.params.id;
        var tituloPadrao = req.body.tituloPadraoDesrelacionado;
        store.pegarIdPadraoPorTitulo(tituloPadrao)
        .then((restultadoBusca) => {
            var idPadrao = restultadoBusca.padroes_id;
            store.desrelacionarPadraoLinguagem(idLinguagem, idPadrao)
            .then(() => {
                res.redirect(`/languages/${idLinguagem}/edit`);
            })
        });
    }
}