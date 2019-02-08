const store = require('../storage/store');

module.exports = {
    index: (req, res) => {
        store.listLanguagesWithOwner().then((languages) => {
            // Date parsing
            languages.forEach((language) => {
                language.dayCreation = language.created_at.getDate();
                language.monthCreation = language.created_at.getMonth() + 1; //Starts counting from 0
                language.yearCreation = language.created_at.getFullYear();
            });
            res.render('linguagens.ejs', {linguagens: languages, csrfToken: req.csrfToken(), user: req.user});
		});
    },

    languagesCreateGet: (req, res) => {
        res.render('criarLinguagem.ejs', {csrfToken: req.csrfToken(), user: req.user, messages: req.flash('error')});
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

        var nomeLinguagem = req.body.nomeLinguagem;
        var visibilidade = visibilidadeNum;
        var descricaoLinguagem = req.body.descricaoLinguagem;

        req.checkBody('nomeLinguagem', 'Campo de nome vazio').notEmpty();
        req.checkBody('descricaoLinguagem', 'Campo de descrição vazio').notEmpty();

        var errors = req.validationErrors();

        if(errors) {
            var messages = [];
            errors.forEach((error) => {
                messages.push(error.msg);
            });
            req.flash('error', messages);
            res.redirect('/languages/create');
        } else {
            store.criarLinguagem({
                nomeLinguagem,
                visibilidade,
                descricaoLinguagem
            })
            .then((languageId) => {
                
                store.relateUserLanguage(req.user.usuarios_id, languageId)
                .then(() => {
                    res.redirect('/languages');
                });
    
            });
        }
    },

    languagesEditGet: (req, res) => {
        store.pegarLinguagemPorId(req.params.id).then((resultadoLinguagem) => {
			store.padroesDeUmaLinguagem(req.params.id).then((resultadoJoin) => {
				store.listarPadroes().then((resultadoListarPadroes) => {
                    store.languagesRelatedToALanguage(req.params.id).then((relatedLanguages) => {
                        res.render('editarLinguagens.ejs', {relatedLanguages: relatedLanguages,messages: req.flash('error') ,linguagem: resultadoLinguagem, padroesRelacionados: resultadoJoin, todosPadroes: resultadoListarPadroes, csrfToken: req.csrfToken(), user: req.user});
                    });
				});
			});
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

        var nomeLinguagem = req.body.nomeLinguagem;
        var descricaoLinguagem = req.body.descricaoLinguagem;

        req.checkBody('nomeLinguagem', 'Campo de nome vazio').notEmpty();
        req.checkBody('descricaoLinguagem', 'Campo de descrição vazio').notEmpty();

        var errors = req.validationErrors();

        if(errors) {
            var messages =[];
            errors.forEach((error) => {
                messages.push(error.msg);
            });
            req.flash('error', messages);
            res.redirect(`/languages/${req.params.id}/edit`);

        } else {
            store.editarLinguagem({data, Id: req.params.id})
                .then(() => {
                    res.redirect(`/languages/${req.params.id}`);
                });
        }
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
    },

    languagePageGet: (req, res) => {
        store.pegarLinguagemPorId(req.params.id).then((language) => {
            store.ownerOfLanguage(req.params.id).then((owner) => {
                store.commentsOfLanguageById(req.params.id).then((comments) => {
                    store.padroesDeUmaLinguagem(req.params.id).then((padroesRelacionados) => {
                        store.languagesRelatedToALanguage(req.params.id).then((relatedLanguages) => {
                            if (language) {
                                language.dayCreation = language.created_at.getDate();
                                language.monthCreation = language.created_at.getMonth() + 1; //Starts counting from 0
                                language.yearCreation = language.created_at.getFullYear();
                                if (language.visibilidade === 0) {
                                    language.visibilidade = 'Público';
                                } else {
                                    language.visibilidade = 'Privado';
                                }
                            }
                            res.render('languagePage.ejs', {relatedLanguages: relatedLanguages, padroesRelacionados: padroesRelacionados ,isLoggedIn: req.isAuthenticated(), comments: comments, language: language, owner: owner, csrfToken: req.csrfToken()});
                        });
                    });
                });
            });
        });
    },

    addCommentLanguage: (req, res) => {
        var text = req.body.languageComment;
        var userId = req.user.usuarios_id;
        var languageId = req.params.id;
        var userName = req.user.name;

        store.addCommentLanguage(text, userId, languageId, userName).then(() => {
            res.redirect(`/languages/${req.params.id}`);
        })
    }
}