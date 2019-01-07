const store = require('../storage/store');

module.exports = {
    usersCreateGet: (req, res) => {
        res.render('cadastro.ejs', {});
    },
    usersCreatePost: (req, res) => {
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
    },
    login: (req, res) => {
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
        });
    }
}