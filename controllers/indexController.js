const store = require('../storage/store');

module.exports = {
    async homePageGet (req, res) {
        res.render('index.ejs', {csrfToken: req.csrfToken(), user: req.user});
    },

    async aboutGet (req, res) {
        res.render('sobre.ejs', {csrfToken: req.csrfToken(), user: req.user});
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

        res.render('searchresults.ejs', {patterns, languages, csrfToken: req.csrfToken(), user: req.user})
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

        res.render('searchresults.ejs', {patterns, languages, csrfToken: req.csrfToken(), user: req.user})
    },

    async filteredPatternSearchGet (req, res) {
        var patterns = [];
        res.render('filteredSearchPatternsResults.ejs', {patterns, csrfToken: req.csrfToken(), user: req.user});
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
        
        res.render('filteredSearchPatternsResults.ejs', {patterns, csrfToken: req.csrfToken(), user: req.user});
    }
}