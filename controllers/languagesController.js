const store = require('../storage/store');

module.exports = {
    async index (req, res) {
        var languages = await store.listPublicLanguagesWithOwner();
        if (req.isAuthenticated()) {
            var privateLanguagesOfLoggedUser = await store.listPrivateLanguagesOfAnUserWithOwner(req.user.usuarios_id);
            languages = languages.concat(privateLanguagesOfLoggedUser);
        }
        // Date parsing
        languages.forEach((language) => {
            language.dayCreation = language.created_at.getDate();
            language.monthCreation = language.created_at.getMonth() + 1; //Starts counting from 0
            language.yearCreation = language.created_at.getFullYear();
        });
        res.render('linguagens.ejs', {linguagens: languages, csrfToken: req.csrfToken(), user: req.user});
    },

    async languagesCreateGet (req, res) {
        res.render('criarLinguagem.ejs', {csrfToken: req.csrfToken(), user: req.user, messages: req.flash('error')});
    },

    async languagesCreatePost (req, res) {
        var visibilidadeNum = null;
        if(req.body.visibilidade === 'Público'){
            visibilidadeNum = 0;                                                       
        } else if(req.body.visibilidade === 'Privado'){
            visibilidadeNum = 1;
        } else {
            visibilidadeNum = null;
        }

        var languagesToRelateArray = req.body.relatedLanguages;
        //If req.body.relatedLanguages is not an array, we'll create an array of one object in order to use .map function
        if (typeof languagesToRelateArray === 'string') { //If languagesToRelateArray is a string, it is just an element, and we'll create an array
            languagesToRelateArray = [];
            languagesToRelateArray.push(req.body.relatedLanguages);
        }

        var nomeLinguagem = req.body.nomeLinguagem;
        var visibilidade = visibilidadeNum;
        var descricaoLinguagem = req.body.descricaoLinguagem;

        req.checkBody('nomeLinguagem', 'Campo de nome vazio').notEmpty();
        req.checkBody('descricaoLinguagem', 'Campo de descrição vazio').notEmpty();

        var errors = req.validationErrors();

        if(errors) {
            //Show errors in the same page
            var messages = [];
            errors.forEach((error) => {
                messages.push(error.msg);
            });
            req.flash('error', messages);
            res.redirect('/languages/create');
        } else {
            //Execute queries in MySQL to create a language
            var newLanguageId = await store.criarLinguagem({nomeLinguagem, visibilidade, descricaoLinguagem});
            await store.relateUserLanguage(req.user.usuarios_id, newLanguageId);
            await store.relateLanguage2Language(newLanguageId, languagesToRelateArray);
            res.redirect('/languages');
        }
    },

    async languagesEditGet (req, res) {
        var resultadoLinguagem = await store.pegarLinguagemPorId(req.params.id);
		var resultadoJoin = await store.padroesDeUmaLinguagem(req.params.id);
		var resultadoListarPadroes = await store.listarPadroesPublicos();
        var relatedLanguages = await store.languagesRelatedToALanguage(req.params.id);
        var languages = await store.listarLinguagensPublicas();
        res.render('editarLinguagens.ejs', {languages: languages, relatedLanguages: relatedLanguages,messages: req.flash('error') ,linguagem: resultadoLinguagem, padroesRelacionados: resultadoJoin, todosPadroes: resultadoListarPadroes, csrfToken: req.csrfToken(), user: req.user});
    },

    async languagesEditPost (req, res) {
        var data = req.body;
        if(data.visibilidade === 'Público'){
            data.visibilidade = 0;
        } else if(data.visibilidade === 'Privado'){
            data.visibilidade = 1;
        } else {
            data.visibilidade = null;
        }

        var languagesToRelateArray = req.body.languages2Relate;
        //If req.body.languages2Relate is not an array, we'll create an array of one object in order to use .map function
        if (typeof languagesToRelateArray === 'string') { //If is a string, it is just an element, and we'll create an array
            languagesToRelateArray = [];
            languagesToRelateArray.push(req.body.languages2Relate);
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
            await store.editarLinguagem({data, Id: req.params.id});
            await store.deleteLanguageInLanguagesLanguages(req.params.id);
            await store.relateLanguage2Language(req.params.id, languagesToRelateArray);
            res.redirect(`/languages/${req.params.id}`);
        }
    },

    async languagesDeletePost (req, res) {
        await store.deletarLinguagem(req.params.id);
        await store.deleteLanguageInLanguagesLanguages(req.params.id);
        res.redirect('/languages');
    },

    async relatePatternPost (req, res) {
        var idLinguagem = req.params.id;
        var tituloPadrao = req.body.tituloPadraoRelacionado;
        var resultadoBusca = await store.pegarIdPadraoPorTitulo(tituloPadrao);
        var idPadrao = resultadoBusca.padroes_id;
        await store.relacionarPadraoLinguagem(idLinguagem, idPadrao);
        res.redirect(`/languages/${idLinguagem}/edit`);
    },

    async unrelatePatternPost (req, res) {
        var idLinguagem = req.params.id;
        var tituloPadrao = req.body.tituloPadraoDesrelacionado;
        var resultadoBusca = await store.pegarIdPadraoPorTitulo(tituloPadrao);
        var idPadrao = resultadoBusca.padroes_id;
        await store.desrelacionarPadraoLinguagem(idLinguagem, idPadrao);
        res.redirect(`/languages/${idLinguagem}/edit`);
    },

    async languagePageGet (req, res) {
        var language = await store.pegarLinguagemPorId(req.params.id);
        var owner = await store.ownerOfLanguage(req.params.id);
        var comments = await store.commentsOfLanguageById(req.params.id);
        var padroesRelacionados = await store.padroesDeUmaLinguagem(req.params.id);
        var relatedLanguages = await store.languagesRelatedToALanguage(req.params.id);
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
    },

    async addCommentLanguage (req, res) {
        var text = req.body.languageComment;
        var userId = req.user.usuarios_id;
        var languageId = req.params.id;
        var userName = req.user.name;

        await store.addCommentLanguage(text, userId, languageId, userName);
        res.redirect(`/languages/${req.params.id}`);
    }
}