const _ = require('underscore');

const store = require('../storage/store');

module.exports = {
    async index (req, res) {
        console.log("Setting (context pattern language) cookie to undefined");
        res.cookie('contextLanguageId', "noContextLanguageId");


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
        res.render('linguagens.ejs', {linguagens: languages, csrfToken: req.csrfToken(), user: req.user, messages: req.flash('feedback')});
    },

    async languagesCreateGet (req, res) {
        var languages = await store.listarLinguagensPublicas();
        var patterns = await store.listarPadroesPublicos();
        res.render('criarLinguagem.ejs', {patterns, languages ,csrfToken: req.csrfToken(), user: req.user, messages: req.flash('error')});
    },

    async languagesCreatePost (req, res) {
        var visibilidadeNum = null;
        if(req.body.visibilidade === 'Público' || req.body.visibilidade === 'Public'){
            visibilidadeNum = 0;                                                       
        } else if(req.body.visibilidade === 'Privado' || req.body.visibilidade === 'Private'){
            visibilidadeNum = 1;
        } else {
            visibilidadeNum = null;
        }

        //Getting languages to relate and handling errors
        var languagesToRelateArray = req.body.languages2Relate;
        //If req.body.languages2Relate is not an array, we'll create an array of one object in order to use .map function
        if (typeof languagesToRelateArray === 'string') { //If languagesToRelateArray is a string, it is just an element, and we'll create an array
            languagesToRelateArray = [];
            languagesToRelateArray.push(req.body.languages2Relate);
        }
        //With undefined the .map (in store.js) cannot execute
        if (languagesToRelateArray === undefined) {
            languagesToRelateArray = [];
        }

        //Getting patterns to relate and handling errors
        var patternsToRelateArray = req.body.patterns2Relate;
        //If req.body.patterns2Relate is not an array, we'll create an array of one object in order to use .map function
        if (typeof patternsToRelateArray === 'string') { //If patternsToRelateArray is a string, it is just an element, and we'll create an array
            patternsToRelateArray = [];
            patternsToRelateArray.push(req.body.patterns2Relate);
        }
        //With undefined the .map (in store.js) cannot execute
        if (patternsToRelateArray === undefined) {
            patternsToRelateArray = [];
        }

        var nomeLinguagem = req.body.nomeLinguagem;
        var visibilidade = visibilidadeNum;
        var descricaoLinguagem = req.body.descricaoLinguagem;
        
        var tagsStringBefore = req.body.tags;
        var tagsArrayAfter = tagsStringBefore.split(",");


        if (req.cookies.lang == 'en') {
            req.checkBody('nomeLinguagem', 'The field Name cannot be empty').notEmpty();
            req.checkBody('descricaoLinguagem', 'The field Description cannot be empty').notEmpty();
        } else {
            req.checkBody('nomeLinguagem', 'Campo de nome vazio').notEmpty();
            req.checkBody('descricaoLinguagem', 'Campo de descrição vazio').notEmpty();
        }

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
            await store.relatePattern2LanguageWithArray(newLanguageId, patternsToRelateArray);
            var tagsIdArray = await store.createLanguageTag(tagsArrayAfter);
            await store.relateLanguage2Tags(newLanguageId, tagsIdArray);

            if (req.cookies.lang == 'en') {
                req.flash('feedback', "Language created successfully");
            } else {
                req.flash('feedback', "Linguagem criada com sucesso");
            }

            res.redirect('/languages');
        }
    },

    async languagesEditGet (req, res) {
        var resultadoLinguagem = await store.pegarLinguagemPorId(req.params.id);
		var relatedPatterns = await store.padroesDeUmaLinguagem(req.params.id);
		var allPatterns = await store.lisPublicPatternsMinimized(); //Minimized: Just name and id
        var relatedLanguages = await store.languagesRelatedToALanguage(req.params.id);
        var allLanguages = await store.listPublicLanguagesMinimized(); //Minimized: Just name and id
        var tagsArray = await store.tagsOfLanguage(req.params.id);
        var tagsString = tagsArray.toString();

        //Returns an array of not related patterns
        var notRelatedPatterns = _.filter(allPatterns, function(obj){ return !_.findWhere(relatedPatterns, obj); });

        //Returns an array of not related languages
        var notRelatedLanguages = _.filter(allLanguages, function(obj){ return !_.findWhere(relatedLanguages, obj); });

        res.render('editarLinguagens.ejs', {tagsString, notRelatedLanguages: notRelatedLanguages, relatedLanguages: relatedLanguages,messages: req.flash('error') ,linguagem: resultadoLinguagem, relatedPatterns: relatedPatterns, notRelatedPatterns: notRelatedPatterns, csrfToken: req.csrfToken(), user: req.user});
    },

    async languagesEditPost (req, res) {
        var data = req.body;
        if(data.visibilidade === 'Público' || req.body.visibilidade === 'Public'){
            data.visibilidade = 0;
        } else if(data.visibilidade === 'Privado' || req.body.visibilidade === 'Private'){
            data.visibilidade = 1;
        } else {
            data.visibilidade = null;
        }

        var languagesToRelateArray = req.body.languages2Relate;
        //If req.body.languages2Relate is not an array, we'll create an array of one object to use .map function
        if (typeof languagesToRelateArray === 'string') { //If is a string, it is just an element, and we'll create an array
            languagesToRelateArray = [];
            languagesToRelateArray.push(req.body.languages2Relate);
        } 
        //With undefined the .map (in store.js) cannot be executed
        if (languagesToRelateArray === undefined) {
            languagesToRelateArray = [];
        }

        //Getting patterns to relate and handling errors
        var patternsToRelateArray = req.body.patterns2Relate;
        //If req.body.patterns2Relate is not an array, we'll create an array of one object in order to use .map function
        if (typeof patternsToRelateArray === 'string') { //If patternsToRelateArray is a string, it is just an element, and we'll create an array
            patternsToRelateArray = [];
            patternsToRelateArray.push(req.body.patterns2Relate);
        }
        //With undefined the .map (in store.js) cannot execute
        if (patternsToRelateArray === undefined) {
            patternsToRelateArray = [];
        }

        //The tags are stored in a string separated by commas, we'll split this string to create an array
        var tagsStringBefore = req.body.tags;
        var tagsArrayAfter = tagsStringBefore.split(",");
        
        // var nomeLinguagem = req.body.nomeLinguagem; ==============================!!!!================
        // var descricaoLinguagem = req.body.descricaoLinguagem;

        if (req.cookies.lang == 'en') {
            req.checkBody('nomeLinguagem', 'The field Name cannot be empty').notEmpty();
            req.checkBody('descricaoLinguagem', 'The field Description cannot be empty').notEmpty();
        } else {
            req.checkBody('nomeLinguagem', 'Campo de nome vazio').notEmpty();
            req.checkBody('descricaoLinguagem', 'Campo de descrição vazio').notEmpty();
        }

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
            await store.deleteOldRelathionshipsPattern2Language(req.params.id);
            await store.relatePattern2LanguageWithArray(req.params.id, patternsToRelateArray);
            await store.deleteOldRelathionshipsLanguage2Tags(req.params.id);
            var tagsIdArray = await store.createLanguageTag(tagsArrayAfter);
            await store.relateLanguage2Tags(req.params.id, tagsIdArray);

            if (req.cookies.lang == 'en') {
                req.flash('feedback', "Properties saved successfully");
            } else {
                req.flash('feedback', "Propriedades salvas com sucesso");
            }

            res.redirect(`/languages/${req.params.id}`);
        }
    },

    async languagesDeletePost (req, res) {
        await store.deletarLinguagem(req.params.id);
        await store.deleteLanguageInLanguagesLanguages(req.params.id);
        if (req.cookies.lang == 'en') {
            req.flash('feedback', "Language deleted successfully");
        } else {
            req.flash('feedback', "Linguagem deletada com sucesso");
        }
        res.redirect('/languages');
    },

    async languagePageGet (req, res) {
        res.cookie('contextLanguageId', req.params.id); //Change the language context

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
                if (req.cookies.lang == 'en') {
                    language.visibilidade = 'Public';
                } else {
                    language.visibilidade = 'Público';
                }
                
            } else {
                if (req.cookies.lang == 'en') {
                    language.visibilidade = 'Private';
                } else {
                    language.visibilidade = 'Privado';
                }
            }
        }

        //Reverse array of comments (newest to oldest)
        comments.reverse();

        var tagsArray = await store.tagsOfLanguage(req.params.id);

        res.render('languagePage.ejs', {tagsArray, relatedLanguages: relatedLanguages, padroesRelacionados: padroesRelacionados ,isLoggedIn: req.isAuthenticated(), comments: comments, language: language, owner: owner, csrfToken: req.csrfToken(), messages: req.flash('feedback')});
    },

    async addCommentLanguage (req, res) {
        var text = req.body.languageComment;
        var userId = req.user.usuarios_id;
        var languageId = req.params.id;
        var userName = req.user.name;
        await store.addCommentLanguage(text, userId, languageId, userName);

        if (req.cookies.lang == 'en') {
            req.flash('feedback', "Comment added successfully");
        } else {
            req.flash('feedback', "Comentário adicionado com sucesso");
        }

        res.redirect(`/languages/${req.params.id}`);
    }
}