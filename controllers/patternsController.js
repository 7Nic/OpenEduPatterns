const store = require('../storage/store');

module.exports = {
    index: (req, res) => {
        store.listarPadroes().then((resultado) => {
			res.render('padroes.ejs', {padroes: resultado, csrfToken: req.csrfToken(), user: req.user});
		});
    },

    patternsCreateGet: (req, res) => {
        res.render('criarPadrao.ejs', {csrfToken: req.csrfToken(), user: req.user});
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

        // Se os campos estiverem vazios nada será inserido no banco de dados
        if (req.body.nomePadrao === '' || req.body.texto === '') {
            res.redirect('/patterns');
        } else {
            store.criarPadrao({
                nomePadrao: req.body.nomePadrao,
                visibilidade: visibilidadeNum,
                texto: req.body.texto
            })
            .then(() => {
                res.redirect('/patterns');
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