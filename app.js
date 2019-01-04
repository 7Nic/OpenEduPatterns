const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

//Configure Routes
const store = require('./storage/store');
const index = require('./controllers/index');
// const getEdicaoPadroes = require('controllers/edicaoPadroes');
// const getGerenciamentoPadroes = require('controllers/gerenciamentoPadroes');
const linguagens = require('./controllers/linguagens');
const padroes = require('./controllers/padroes');
const cadastro = require('./controllers/cadastro');
const sobre = require('./controllers/sobre');
const criarPadrao = require('./controllers/criarPadrao');
const criarLinguagem = require('./controllers/criarLinguagem');
const editarLinguagens = require('./controllers/editarLinguagens');
const editarPadroes = require('./controllers/editarPadroes');
const perfilUsuario = require('./controllers/perfilUsuario.js');


//Configure middleware
//This line below means we can use any METHOD and any PATH to use static files is that directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json()); // Middleware: We just use this function to be able to handle json files
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine

//Controllers - Get requests
app.get('/', index.getHomePage);
app.get('/linguagens', linguagens.getLinguagens);
app.get('/padroes', padroes.getPadroes);
app.get('/cadastro', cadastro.getCadastro);
app.get('/sobre', sobre.getSobre);
app.get('/criarPadrao', criarPadrao.getCriarPadrao);
app.get('/criarLinguagem', criarLinguagem.getCriarLinguagem);
app.get('/editarLinguagens/:id', editarLinguagens.getEditarLinguagens);
app.get('/editarPadroes/:id', editarPadroes.getEditarPadroes);
app.get('/perfilUsuario/:id', perfilUsuario.getPerfilUsuario);
app.get('/incompleto', (req, res) => {
    res.send('Página a ser criada. Pode ser a exibição de uma linguagem ou padrão');
})


//Post requests
app.post('/cadastrarUsuario', (req, res) => {
    // Se os campos estiverem vazios nada será inserido no banco de dados
    if (req.body.name === '' || req.body.email === '' || req.body.password === '') {
        console.log('Campos vazios');
        res.redirect('/');
    } else {
        store
        .createUser({
            name: req.body.name,    
            email: req.body.email,
            password: req.body.password
        })
        .then(() => res.redirect('/'));
    }
});
// Autentificação do usuário
app.post('/fazerLogin', (req, res) => {
    // Se for sucesso na autentificação, use seu banco de dados para pegar o id do usuario
    store.authenticate({
        email: req.body.email,
        password: req.body.password
    })
    .then(({success}) => {
        if(success)
            res.sendStatus(200);
        else    
            res.send(401);
    })
});
app.post('/adicionarPadrao', (req, res) => {
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
        res.redirect('/padroes');
    } else {
        store.criarPadrao({
            nomePadrao: req.body.nomePadrao,
            visibilidade: visibilidadeNum,
            texto: req.body.texto
        })
        .then(() => {
            res.redirect('/padroes');
        });
    }
});
app.post('/adicionarLinguagem', (req, res) => {
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
        res.redirect('/linguagens');
    } else {
        store.criarLinguagem({
            nomeLinguagem: req.body.nomeLinguagem,
            visibilidade: visibilidadeNum,
            descricaoLinguagem: req.body.descricaoLinguagem
        })
        .then(() => {
            res.redirect('/linguagens');
        });
    }
});
app.post('/editarPadroes/salvarEdicaoPadrao/:id', (req, res) => {
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
        res.redirect('/padroes');
    });
});
app.post('/editarLinguagens/salvarEdicaoLinguagens/:id', (req, res) => {
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
        res.redirect('/linguagens');
    });
});
app.post('/editarPadroes/deletarPadrao/:id', (req, res) => {
    store.deletarPadrao(req.params.id)
    .then(() => {
        res.redirect('/padroes');
    });
});
app.post('/editarLinguagens/deletarLinguagem/:id', (req, res) => {
    store.deletarLinguagem(req.params.id)
    .then(() => {
        res.redirect('/linguagens');
    });
});
app.post('/editarLinguagens/relacionarPadrao/:idLinguagem', (req, res) => {
    var idLinguagem = req.params.idLinguagem;
    var tituloPadrao = req.body.tituloPadraoRelacionado;
    store.pegarIdPadraoPorTitulo(tituloPadrao)
    .then((restultadoBusca) => {
        var idPadrao = restultadoBusca.padroes_id;
        store.relacionarPadraoLinguagem(idLinguagem, idPadrao)
        .then(() => {
            res.redirect(`/editarLinguagens/${idLinguagem}`);
        })
    });
});
app.post('/editarLinguagens/desrelacionarPadrao/:idLinguagem', (req, res) => {
    var idLinguagem = req.params.idLinguagem;
    var tituloPadrao = req.body.tituloPadraoDesrelacionado;
    store.pegarIdPadraoPorTitulo(tituloPadrao)
    .then((restultadoBusca) => {
        var idPadrao = restultadoBusca.padroes_id;
        store.desrelacionarPadraoLinguagem(idLinguagem, idPadrao)
        .then(() => {
            res.redirect(`/editarLinguagens/${idLinguagem}`);
        })
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port} ou na porta setada pelo Heroku`);
});