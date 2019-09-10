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
        var breadCrumbContent = [{name: req.__('Linguagens'), href: "#"}];
        res.render('linguagens.ejs', {breadCrumbContent, linguagens: languages, csrfToken: req.csrfToken(), user: req.user, messages: req.flash('feedback')});
    },

    async languagesCreateGet (req, res) {
        var languages = await store.listarLinguagensPublicas();
        var patterns = await store.listarPadroesPublicos();

        var breadCrumbContent = [{name: req.__('Linguagens'), href: "/languages"}];
        breadCrumbContent.push({name: req.__('Criação de Nova Linguagem'), href: "#"});
        res.render('criarLinguagem.ejs', {breadCrumbContent, patterns, languages ,csrfToken: req.csrfToken(), user: req.user, messages: req.flash('error')});
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
            res.redirect('/openedupatterns/languages/create');
        } else {
            
            // Execute queries in MySQL to create a language
            var newLanguageId = await store.criarLinguagem({nomeLinguagem, visibilidade, descricaoLinguagem});
            await store.relateUserLanguage(req.user.usuarios_id, newLanguageId);
            await store.relateLanguage2Language(newLanguageId, languagesToRelateArray);


            // ==================PROCESS TO RELATE (PATTERN_PATTERN) WITH A LANGUAGE=====================
            
            //Relate each pattern_pattern (p2p) relationship and get the ids of these p2p relationships
            var patternsToRelateArray = req.body.patterns2Relate;
            if ((!Array.isArray(patternsToRelateArray))) patternsToRelateArray = [patternsToRelateArray]; //If is an unique object, create an array of one object
            var p2pRelationsArray = parseArrayOfRelationships(patternsToRelateArray); //Cast "String ids" to "int ids"

            var relationIds1 = await store.relateP2PWhenCreatingLanguagePart1(p2pRelationsArray); //Relate A->B
            var relationIds2 = await store.relateP2PWhenCreatingLanguagePart2(p2pRelationsArray); //Relate B->A becasuse it is bidirectional
            var relationPatternIds = relationIds1.concat(relationIds2); //Concatenate all ids in one array
            relationPatternIdArray = [...new Set(relationPatternIds)]; //Remove duplicates

            //Use the p2p relationship ids to relate to a language
            await store.relateLanguage2relationPatternId(newLanguageId, relationPatternIdArray);

            // ===========================================================================================


            var tagsIdArray = await store.createLanguageTag(tagsArrayAfter);
            await store.relateLanguage2Tags(newLanguageId, tagsIdArray);

            if (req.cookies.lang == 'en') {
                req.flash('feedback', "Language created successfully");
            } else {
                req.flash('feedback', "Linguagem criada com sucesso");
            }

            res.redirect('/openedupatterns/languages');
        }
    },

    async languagesEditGet (req, res) {
        var resultadoLinguagem = await store.pegarLinguagemPorId(req.params.id);
        var relatedPatterns = await store.padroesDeUmaLinguagem(req.params.id);
        var relationshipsP2PPairs = await store.relationPairsP2POfALanguage(req.params.id);
		var allPatterns = await store.lisPublicPatternsMinimized(); //Minimized: Just name and id
        var relatedLanguages = await store.languagesRelatedToALanguage(req.params.id);
        var allLanguages = await store.listPublicLanguagesMinimized(); //Minimized: Just name and id
        var tagsArray = await store.tagsOfLanguage(req.params.id);
        var tagsString = tagsArray.toString();

        //Returns an array of not related patterns
        var notRelatedPatterns = _.filter(allPatterns, function(obj){ return !_.findWhere(relatedPatterns, obj); });

        //Returns an array of not related languages
        var notRelatedLanguages = _.filter(allLanguages, function(obj){ return !_.findWhere(relatedLanguages, obj); });

        var breadCrumbContent = [{name: req.__('Linguagens'), href: "/languages"}];
        breadCrumbContent.push({name: req.__('Edição de Linguagem'), href: "#"});
        res.render('editarLinguagens.ejs', {breadCrumbContent, relatPairs: relationshipsP2PPairs, patterns: allPatterns, tagsString, notRelatedLanguages: notRelatedLanguages, relatedLanguages: relatedLanguages,messages: req.flash('error') ,linguagem: resultadoLinguagem, relatedPatterns: relatedPatterns, notRelatedPatterns: notRelatedPatterns, csrfToken: req.csrfToken(), user: req.user});
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
            res.redirect(`/openedupatterns/languages/${req.params.id}/edit`);

        } else {
            await store.editarLinguagem({data, Id: req.params.id});
            await store.deleteLanguageInLanguagesLanguages(req.params.id);
            await store.relateLanguage2Language(req.params.id, languagesToRelateArray);
            await store.deleteOldRelathionshipsPattern2Language(req.params.id); //Feita

            // ==================PROCESS TO RELATE (PATTERN_PATTERN) WITH A LANGUAGE=====================
            // OLD!   await store.relatePattern2LanguageWithArray(req.params.id, patternsToRelateArray); //Vão ser duas funções (copiar a logica do createPost)

            //Relate each pattern_pattern (p2p) relationship and get the ids of these p2p relationships
            var patternsToRelateArray = req.body.patterns2Relate;
            if ((!Array.isArray(patternsToRelateArray))) patternsToRelateArray = [patternsToRelateArray]; //If is an unique object, create an array of one object
            var p2pRelationsArray = parseArrayOfRelationships(patternsToRelateArray); //Cast "String ids" to "int ids"

            var relationIds1 = await store.relateP2PWhenCreatingLanguagePart1(p2pRelationsArray); //Relate A->B
            var relationIds2 = await store.relateP2PWhenCreatingLanguagePart2(p2pRelationsArray); //Relate B->A becasuse it is bidirectional
            var relationPatternIds = relationIds1.concat(relationIds2); //Concatenate all ids in one array
            relationPatternIdArray = [...new Set(relationPatternIds)]; //Remove duplicates

            //Use the p2p relationship ids to relate to a language
            await store.relateLanguage2relationPatternId(req.params.id, relationPatternIdArray);

            // ===========================================================================================
            
            await store.deleteOldRelathionshipsLanguage2Tags(req.params.id);
            var tagsIdArray = await store.createLanguageTag(tagsArrayAfter);
            await store.relateLanguage2Tags(req.params.id, tagsIdArray);

            if (req.cookies.lang == 'en') {
                req.flash('feedback', "Properties saved successfully");
            } else {
                req.flash('feedback', "Propriedades salvas com sucesso");
            }

            res.redirect(`/openedupatterns/languages/${req.params.id}`);
        }
    },

    async languagesDeletePost (req, res) {
        await store.deletarLinguagem(req.params.id);
        await store.deleteLanguageInLanguagesLanguages(req.params.id);
        await store.deleteInRelation__pattern_idBasedOnLanguageId(req.params.id);
        if (req.cookies.lang == 'en') {
            req.flash('feedback', "Language deleted successfully");
        } else {
            req.flash('feedback', "Linguagem deletada com sucesso");
        }
        res.redirect('/openedupatterns/languages');
    },

    async languagePageGet (req, res) {
        res.cookie('contextLanguageId', req.params.id); //Change the language context

        var language = await store.pegarLinguagemPorId(req.params.id);
        var owner = await store.ownerOfLanguage(req.params.id);
        var comments = await store.commentsOfLanguageById(req.params.id);
        var padroesRelacionados = await store.patternsOfALanguage(req.params.id);
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
        
        var breadCrumbContent = [{name: req.__('Linguagens'), href: "/languages"}];
        breadCrumbContent.push({name: req.__('Exibição de Linguagem'), href: "#"});
        res.render('languagePage.ejs', {breadCrumbContent, tagsArray, relatedLanguages: relatedLanguages, padroesRelacionados: padroesRelacionados ,isLoggedIn: req.isAuthenticated(), comments: comments, language: language, owner: owner, csrfToken: req.csrfToken(), messages: req.flash('feedback')});
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

        res.redirect(`/openedupatterns/languages/${req.params.id}`);
    }
}

async function asyncForEach(array, callback) {
    //If is an array
    if (Array.isArray(array)) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    } else {
        await callback(array, 0, array);
    }
    
}

//The ids are in string format, it's necessary to change to int
function parseArrayOfRelationships(relationsP2PArray) {
    if (relationsP2PArray[0] === undefined) return [];
    console.log(relationsP2PArray);
    
    var splitStringsRelations = [];

    //Split
    for (let i=0; i<relationsP2PArray.length; i++) {
        splitStringsRelations.push(relationsP2PArray[i].split(','));
    }

    //Cast the strings to numbers
    splitStringsRelations.forEach((eachRelation) => {
        eachRelation[0] = Number(eachRelation[0]);
        eachRelation[1] = Number(eachRelation[1]);
    });

    return splitStringsRelations;
}