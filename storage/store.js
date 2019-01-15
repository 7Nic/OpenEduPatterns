// ALTER TABLE thetable ADD UNIQUE INDEX(pageid, name);
// Coloque esse comando ao criar as 3 tabelas de relacionamento, para evitar valores repetidos
// Pois usaremos o comando INSERT IGNORE... para ignorar valores repetidos, os quais não serão inseridos
// ==================================================ANTES DE TUDO========================================

// Arquivo responsavel pelo armazenamento, ele que roda os comandos SQl
const knex   = require('knex')(require('./knexfile'));
const crypto = require('crypto');
const mySQL  = require('./mysqlFunctions');
//Essa é a maneira de importar o knex, faça o paiol e depois passe o objeto com os detalhes do banco de dados, nesse caso colocamos 
//esse objeto no arquivo knexfile e exportamos ele lá para importar aqui

module.exports = {
    saltHashPassword,

    createUser ({name, email, password}) {
        console.log(`Adding user with email ${email} and name ${name}`);
        //After adding the encryption on the migration, we need to encrypt the passwords
        //when the user creates them
        //Recebe o objeto retornado pela salthashpassword
        const {salt, hash} = this.saltHashPassword({password});
        return knex('usuarios').insert({
            name,
            email,
            salt, 
            encryptedPassword: hash, //Porque hash é a senha criptografada, dai colocamos ela na tabela
            created_at: new Date()
        });
    },

    authenticate ({email, password}) {
        console.log(`Authenticating user with email: ${email}`);
        return knex('usuarios')
            .where({email})
            .then(([usuarios]) => {
                if (!usuarios) return {sucess: false};
                const {hash} = saltHashPassword({
                    password,
                    salt: usuarios.salt
                });
                if (hash === usuarios.encryptedPassword){
                    return {success: true};
                } else {
                    return {success: false};
                }
            });
    },

    criarPadrao({nomePadrao, visibilidade, texto}) {
        return knex('padroes').insert({
            titulo: nomePadrao,
            visibilidade,
            texto,
            created_at: new Date()
        })
        .returning('padroes_id');
    },
    
    criarLinguagem({nomeLinguagem, visibilidade, descricaoLinguagem, userName}) {
        return knex('linguagens')
        .insert({
            nome: nomeLinguagem,
            visibilidade,
            descricao: descricaoLinguagem,
            created_at: new Date()
        })
        .returning('linguagens_id');
    },
    listarPadroes() {
        return knex.select('*').from('padroes').then((resultado) => {
            return resultado;
        });
    },
    listarLinguagens() {
        return knex.select('*').from('linguagens').then((resultado) => {
            return resultado;
        });
    },
    listLanguagesByUser() {
        // select l.nome, l.linguagens_id, u.name, u.usuarios_id from usuarios u inner join usuarios_linguagens ul on u.usuarios_id = ul.usuarios_id inner join linguagens l on ul.linguagens_id = l.linguagens_id;
        return knex.select('linguagens.linguagens_id', 'linguagens.nome', 'usuarios.usuarios_id', 'usuarios.name', 'linguagens.created_at', 'linguagens.descricao')
            .from('usuarios')
            .innerJoin('usuarios_linguagens', 'usuarios.usuarios_id', 'usuarios_linguagens.usuarios_id')
            .innerJoin('linguagens', 'usuarios_linguagens.linguagens_id', 'linguagens.linguagens_id');
    },
    listPatternsByUser() {
        return knex.select('usuarios.usuarios_id', 'usuarios.name', 'padroes.padroes_id', 'padroes.titulo', 'padroes.created_at', 'padroes.texto')
            .from('usuarios')
            .innerJoin('usuarios_padroes', 'usuarios.usuarios_id', 'usuarios_padroes.usuarios_id')
            .innerJoin('padroes', 'usuarios_padroes.padroes_id', 'padroes.padroes_id');
    },
    pegarLinguagemPorId(Id) {
        return knex.select('*').from('linguagens').where('linguagens_id', Id).then((resultado) => {
            return resultado[0];
        });
    },
    pegarPadraoPorId(Id) {
        return knex.select('*').from('padroes').where('padroes_id', Id).then((resultado) => {
            return resultado[0];
        })
    },
    findUserById(userId) {
        return knex.select('*').from('usuarios').where('usuarios_id', userId).then((user) => {
            return user[0];
        });
    },
    findUserByEmail(email) {
        return knex.select('*').from('usuarios').where('email', email).then((user) => {
            return user[0];
        });
    },
    editarPadrao({data, Id}) {
        return knex('padroes').where('padroes_id', Id).update({
            titulo: data.nomePadrao,
            visibilidade: data.visibilidade,
            texto: data.texto
        })
    },
    editarLinguagem({data, Id}) {
        return knex('linguagens').where('linguagens_id', Id).update({
            nome: data.nomeLinguagem,
            visibilidade: data.visibilidade,
            descricao: data.descricaoLinguagem 
        })
    },
    deletarPadrao(Id) {
        return knex('padroes').where('padroes_id', Id).del();
    },
    deletarLinguagem(Id) {
        return knex('linguagens').where('linguagens_id', Id).del();
    },
    padroesDeUmaLinguagem(Id) { //Retorna os padroes da linguagem que tem o Id que passamos
        //Não usamos SELECT * pois evitamos busca e download de dados desnecessários 
        return knex.select('titulo').from('padroes')
            .innerJoin('linguagens_padroes', 'padroes.padroes_id', 'linguagens_padroes.padroes_id')
            .innerJoin('linguagens', 'linguagens_padroes.linguagens_id', 'linguagens.linguagens_id')
            .where('linguagens.linguagens_id', Id)
            .then((resultado) => {
                return resultado;
            });
            // SELECT * FROM padroes p INNER JOIN linguagens_padroes lp ON p.padroes_id = lp.padroes_id INNER JOIN linguagens l ON lp.linguagens_id = l.linguagens_id WHERE l.linguagens_id=21;
    },
    pegarIdPadraoPorTitulo(titulo) {
        return knex.select('padroes_id').from('padroes').where('titulo', `${titulo}`)
            .then((resultado) => {
                return resultado[0];
            });
    },
    relacionarPadraoLinguagem(idLinguagem, idPadrao) {
        //This raw function substitutes INSERT for INSERT IGNORE
        return knex.raw(knex('linguagens_padroes').insert({
            linguagens_id: idLinguagem,
            padroes_id: idPadrao
            })
            .toString()
            .replace('insert', 'INSERT IGNORE'));
    },
    relateUserLanguage(userId, languageId) {
        return knex.raw(knex('usuarios_linguagens').insert({
            usuarios_id: userId,
            linguagens_id: languageId
            })
            .toString()
            .replace('insert', 'INSERT IGNORE'));
    },
    relateUserPattern(userId, patternId) {
        return knex.raw(knex('usuarios_padroes').insert({
            usuarios_id: userId,
            padroes_id: patternId
            })
            .toString()
            .replace('insert', 'INSERT IGNORE'));
    },
    desrelacionarPadraoLinguagem(idLinguagem, idPadrao) {     
        return knex('linguagens_padroes').where('linguagens_id', '=', idLinguagem).andWhere('padroes_id', '=', idPadrao).del();

    },
    userPatterns() { //Padrões de um usuário
        return knex.select('*').from('padroes')
        .innerJoin('usuarios_padroes', 'padroes.padroes_id', 'usuarios_padroes.padroes_id')
        .innerJoin('usuarios', 'usuarios_padroes.usuarios_id', 'usuarios.usuarios_id')
        .where('usuarios.usuarios_id', Id)
        .then((resultado) => {
            return resultado;
        });
    },
    userLanguages() { //Linguagens de um usuário
        return knex.select('*').from('linguagens')
        .innerJoin('usuarios_linguagens', 'linguagens.linguagens_id', 'usuarios_linguagens.linguagens_id')
        .innerJoin('usuarios', 'usuarios_linguagens.usuarios_id', 'usuarios.usuarios_id')
        .where('usuarios.usuarios_id', Id)
        .then((resultado) => {
            return resultado;
        });
    }
}


//Encryption functions

function saltHashPassword ({password, salt = randomString()}) {
    const hash = crypto.createHmac('sha512', salt).update(password); //Aqui ocorre a encriptação, passamos o salt e o password, o hash e a senha criptografada
    //Retorna o objeto
    return {
        salt: salt,
        hash: hash.digest('hex') //A senha criptograda é binaria, passamos ela como hexadecimal
    }
}   

function randomString() {
    return crypto.randomBytes(4).toString('hex'); //Strings aleatorias para um hexadecimal
}