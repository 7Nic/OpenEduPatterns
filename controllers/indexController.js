const store = require('../storage/store');
const i18n = require('i18n');

module.exports = {
    async homePageGet (req, res) {
        res.cookie('contextLanguageId', "noContextLanguageId");
        res.render('index.ejs', {csrfToken: req.csrfToken(), user: req.user});

    },

    async aboutGet (req, res) {
        var breadCrumbContent = [{name: req.__('Sobre'), href: "#"}];
        res.cookie('contextLanguageId', "noContextLanguageId");

        res.render('sobre.ejs', {breadCrumbContent, csrfToken: req.csrfToken(), user: req.user});
    },

    async setLanguage (req, res) {
        res.cookie('lang', req.params.lang);
        res.redirect('back');
    },

    async generalSearchGet(req, res) {
        var breadCrumbContent = [{name: req.__('Pesquisa geral'), href: "#"}];

        res.render('searchresults.ejs', {breadCrumbContent, patterns: {}, languages: {}, csrfToken: req.csrfToken(), user: req.user, messages: {}})
    },

    async generalSearchPost (req, res) {
        if (req.body.keyword === "") {
            req.body.keyword = undefined;
        }

        var patterns = await store.searchInPatterns(req.body.keyword);
        var languages = await store.searchInLanguages(req.body.keyword);
        var authorsInPatterns = await store.searchByAuthorInPatterns(req.body.keyword);
        var authorsInLanguages = await store.searchByAuthorInLanguages(req.body.keyword);
        patterns = patterns.concat(authorsInPatterns);
        languages = languages.concat(authorsInLanguages);
        
        // Remove duplicates in languages
        languages = languages.filter((elem, index, self) => self.findIndex(
            (t) => {return (t.linguagens_id === elem.linguagens_id && t.nome === elem.nome)}) === index)
        
        // Remove duplicates in patterns
        patterns = patterns.filter((elem, index, self) => self.findIndex(
            (t) => {return (t.padroes_id === elem.padroes_id && t.titulo === elem.titulo)}) === index)

        
        if (languages.length === 0 && patterns.length === 0) {
            if (req.cookies.lang == 'en') {
                req.flash('feedback', "This search didn't return results");
            } else {
                req.flash('feedback', "Não foram encontrados resultados para esta pesquisa");
            }
        }

        var breadCrumbContent = [{name: req.__('Pesquisa geral'), href: "#"}];

        res.render('searchresults.ejs', {breadCrumbContent, patterns, languages, csrfToken: req.csrfToken(), user: req.user, messages: req.flash('feedback')})
    },

    async filteredSearchGet(req, res) {
        var breadCrumbContent = [{name: req.__('Pesquisa refinada'), href: "#"}];

        res.render('searchresults.ejs', {breadCrumbContent, patterns: {}, languages: {}, csrfToken: req.csrfToken(), user: req.user, messages: {}})
    },

    async filteredSearchPost (req, res) { 
        if (req.body.keyword2 === "") {
            req.body.keyword2 = undefined;
        }
        var patterns = [];
        var languages = [];

        if (req.body.pattern) {
            var patterns = await store.searchInPatterns(req.body.keyword2);
        } 
        if (req.body.language) {
            var languages = await store.searchInLanguages(req.body.keyword2);
        }
        if (req.body.author) {
            var authorsInPatterns = await store.searchByAuthorInPatterns(req.body.keyword2);
            var authorsInLanguages = await store.searchByAuthorInLanguages(req.body.keyword2);
            patterns = patterns.concat(authorsInPatterns);
            languages = languages.concat(authorsInLanguages);
        }

        // Remove duplicates in languages
        languages = languages.filter((elem, index, self) => self.findIndex(
            (t) => {return (t.linguagens_id === elem.linguagens_id && t.nome === elem.nome)}) === index)
        
        // Remove duplicates in patterns
        patterns = patterns.filter((elem, index, self) => self.findIndex(
            (t) => {return (t.padroes_id === elem.padroes_id && t.titulo === elem.titulo)}) === index)


        if (languages.length === 0 && patterns.length === 0) {
            if (req.cookies.lang == 'en') {
                req.flash('feedback', "This search didn't return results");
            } else {
                req.flash('feedback', "Não foram encontrados resultados para esta pesquisa");
            }
        }

        var breadCrumbContent = [{name: req.__('Pesquisa refinada'), href: "#"}];

        res.render('searchresults.ejs', {breadCrumbContent, patterns, languages, csrfToken: req.csrfToken(), user: req.user, messages: req.flash('feedback')})
    },

    async filteredPatternSearchGet (req, res) {
        var patterns = [];
        var languages = [];
        var messages = [];
        var breadCrumbContent = [{name: req.__('Pesquisa refinada'), href: "#"}];

        res.render('searchresults.ejs', {breadCrumbContent, patterns, languages, csrfToken: req.csrfToken(), user: req.user, messages});
    },

    async filteredPatternSearchPost (req, res) {
        var patterns = [];
        if (req.body.keyword2 === "") {
            req.body.keyword2 = undefined;
        }
        if (req.body.Nome) {
            var patternsConcat = await store.searchInElementContent('Nome', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }

        if (req.body.Contexto) {
            var patternsConcat = await store.searchInElementContent('Contexto', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }

        if (req.body.Figura) {
            var patternsConcat = await store.searchInElementContent('Figura', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }
        if (req.body.Problema) {
            var patternsConcat = await store.searchInElementContent('Problema', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }
        if (req.body.Solucao) {
            var patternsConcat = await store.searchInElementContent('Solução', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }
        if (req.body.DiagramaDaSolucao) {
            var patternsConcat = await store.searchInElementContent('Diagrama da Solução', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }
        if (req.body.Descricao) {
            var patternsConcat = await store.searchInElementContent('Descrição', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }
        if (req.body.Alias) {
            var patternsConcat = await store.searchInElementContent('Alias', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }
        if (req.body.Forças) {
            var patternsConcat = await store.searchInElementContent('Forças', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }
        if (req.body.Exemplo) {
            var patternsConcat = await store.searchInElementContent('Exemplo', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }
        if (req.body.UsosConhecidos) {
            var patternsConcat = await store.searchInElementContent('Usos conhecidos', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }
        if (req.body.PadroesRelacionados) {
            var patternsConcat = await store.searchInElementContent('Padrões relacionados', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }
        if (req.body.ContextoResultante) {
            var patternsConcat = await store.searchInElementContent('Contexto resultante', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }
        if (req.body.Rationale) {
            var patternsConcat = await store.searchInElementContent('Rationale', req.body.keyword2);
            patterns = patterns.concat(patternsConcat);
        }

        if (patterns.length === 0) {
            if (req.cookies.lang == 'en') {
                req.flash('feedback', "This search didn't return results");
            } else {
                req.flash('feedback', "Não foram encontrados resultados para esta pesquisa");
            }
        }

        var breadCrumbContent = [{name: req.__('Pesquisa refinada'), href: "#"}];
        
        res.render('searchresults.ejs', {breadCrumbContent, languages: [], patterns, csrfToken: req.csrfToken(), user: req.user, messages: req.flash('feedback')});
    },

    async table(req, res) {
        res.render('table.ejs');
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