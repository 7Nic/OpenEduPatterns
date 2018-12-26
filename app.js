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



//Post requests
app.post('/cadastrarUsuario', (req, res) => { //app.js(collectDataXXX in this case) will hit this path
    store
        .createUser({
            name: req.body.name,    
            email: req.body.email,
            password: req.body.password
        })
        .then(() => res.redirect('/'));
});
app.post('/fazerLogin', (req, res) => {
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
    store.criarPadrao({
        nomePadrao: req.body.nomePadrao,
        visibilidade: visibilidadeNum,
        texto: req.body.texto
    })
    .then(() => {
        console.log('aqui chega');
        res.redirect('/padroes');
    });
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
    store.criarLinguagem({
        nomeLinguagem: req.body.nomeLinguagem,
        visibilidade: visibilidadeNum,
        descricaoLinguagem: req.body.descricaoLinguagem
    })
    .then(() => {
        res.redirect('/linguagens');
    });
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
    store.editarPadrao({data, userId: req.params.id})
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
    store.editarLinguagem({data, userId: req.params.id})
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port} ou na porta setada pelo Heroku`);
});