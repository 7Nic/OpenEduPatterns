const store = require('../storage/store');

module.exports = {
    index: (req, res) => {
        store.listPatternsByUser().then((patterns) => {
            // Date parsing
            patterns.forEach((pattern) => {
                pattern.dayCreation = pattern.created_at.getDate();
                pattern.monthCreation = pattern.created_at.getMonth() + 1; //Starts counting from 0
                pattern.yearCreation = pattern.created_at.getFullYear();
            });
            res.render('padroes.ejs', {padroes: patterns, csrfToken: req.csrfToken(), user: req.user});
		});
    },

    patternsCreateGet: (req, res) => {
        res.render('criarPadrao.ejs', {csrfToken: req.csrfToken(), user: req.user, messages: req.flash('error')});
    },

    patternsCreatePost: (req, res) => {
        var visibilidadeNum = null;
        if(req.body.visibilidade === 'Público'){
            visibilidadeNum = 0;
        } else if(req.body.visibilidade === 'Privado'){
            visibilidadeNum = 1;
        } else {
            visibilidadeNum = null;
        }

        var nomePadrao = req.body.nomePadrao;
        var visibilidade = visibilidadeNum;
        var texto = req.body.texto        

        req.checkBody('nomePadrao', 'Campo de nome vazio').notEmpty();
        req.checkBody('texto', 'Campo de texto vazio').notEmpty();

        var errors = req.validationErrors();
        
        if(errors) {
            var messages = [];
            errors.forEach((error) => {
                messages.push(error.msg);
            });
            req.flash('error', messages);
            res.redirect('/languages/create');
        } else {
            store.criarPadrao({
                nomePadrao,
                visibilidade,
                texto
            })
            .then((patternId) => {
                
                store.relateUserPattern(req.user.usuarios_id, patternId)
                .then(() => {
                    res.redirect('/patterns');
                });
    
            });
        }
    },

    patternsEditGet: (req, res) => {
        store.pegarPadraoPorId(req.params.id).then((resultado) => {
            res.render('editarPadroes.ejs', {padrao: resultado, csrfToken: req.csrfToken(), user: req.user});
        });
    },

    patternsEditPost: (req, res) => {
        var data = req.body;
        if(data.visibilidade === 'Público'){
            data.visibilidade = 0;
        } else if(data.visibilidade === 'Privado'){
            data.visibilidade = 1;
        } else {
            data.visibilidade = null;
        }
        console.log(req.params.id);
        store.editarPadrao({data, Id: req.params.id})
        .then(() => {
            res.redirect('/patterns');
        });
    },

    patternsDeleteGet: (req, res) => {
        //Não tem pois o get, que é a pagina, já a própria página de edição
    },

    patternsDeletePost: (req, res) => {
        store.deletarPadrao(req.params.id)
        .then(() => {
            res.redirect('/patterns');
        });
    }
}