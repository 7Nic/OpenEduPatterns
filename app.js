const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

//Configure Routes
const indexRouter = require('./routes/indexRoutes');
const usersRouter = require('./routes/usersRoutes');
const languagesRouter = require('./routes/languagesRoutes');
const patternsRouter = require('./routes/patternsRoutes');

//Configure middleware
app.use(express.static(path.join(__dirname, 'public'))); //This line means we can use any METHOD and any PATH to use static files is that directory
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json()); // Middleware: We just use this function to be able to handle json files
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine

//Add these routes to the middleware stack
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/languages', languagesRouter);
app.use('/patterns', patternsRouter);



/////===============Apague-me================/////
app.get('/building', (req, res) => {
    res.send('Página a ser criada. Pode ser a exibição de uma linguagem ou padrão');
})
/////===============Apague-me================/////



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port} ou na porta setada pelo Heroku`);
});