const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const validator = require('express-validator');

const app = express();

//Configure Routes
const indexRouter = require('./routes/indexRoutes');
const usersRouter = require('./routes/usersRoutes');
const languagesRouter = require('./routes/languagesRoutes');
const patternsRouter = require('./routes/patternsRoutes');

//Configure render folder
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine

//Configure middleware (This order cannot be changed!!!)
app.use(bodyParser.json()); // Middleware: We just use this function to be able to handle json files
app.use(bodyParser.urlencoded({ extended: false }))
app.use(validator()); //Needs to be here because it uses the body already parsed to validate
app.use(cookieParser());
app.use(session({secret: 'EYSYAOWPB8DsuF04Ucsv', resave: false, saveUninitialized: false}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); //Use session to store the user
require('./config/passport.js');
app.use(express.static(path.join(__dirname, 'public'))); //This line means we can use any METHOD and any PATH to use static files is that directory

//LOGGED IN MIDDLEWARE
//I want this middleware to be executed in all requests. I wanna know if I'm logged in or not
app.use((req, res, next) => {
    res.locals.loggedIn = req.isAuthenticated(); //Return true of false
    next();
});

//Add these routes to the middleware stack
app.use('/users', usersRouter);
app.use('/languages', languagesRouter);
app.use('/patterns', patternsRouter);
app.use('/', indexRouter);

/////===============Apague-me após conclusão do projeto!!================/////
app.get('/building', (req, res) => {
    res.send('Página a ser criada. Pode ser a exibição de uma linguagem ou padrão');
});
/////===============Apague-me================/////

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port} ou na porta setada pelo Heroku`);
});