// Arquivo responsavel pelo armazenamento, ele que roda os comandos SQl
const knex = require('knex')(require('./knexfile'));
const crypto = require('crypto');
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

        //Comando que manda inserir essas informações na tabela, eu passo aqui o nome da tabela
        return knex('usuarios').insert({
            name,
            email,
            password,
            salt, 
            encryptedPassword: hash, //Porque hash é a senha criptografada, dai colocamos ela na tabela
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
        console.log(`Adicionando padrão: Nome: ${nomePadrao}, visibilidade: ${visibilidade}, texto: ${texto}`);
        return knex('padroes').insert({
            titulo: nomePadrao,
            visibilidade,
            texto,
            id_usuario: 171
        });
    },
    criarLinguagem({nomeLinguagem, visibilidade, descricaoLinguagem}) {
        console.log(`Adicionando linguagem: Nome: ${nomeLinguagem}, visibilidade: ${visibilidade}, texto: ${descricaoLinguagem}`);
        return knex('linguagens').insert({
            nome: nomeLinguagem,
            visibilidade,
            descricao: descricaoLinguagem,
            id_usuario: 171
        });
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
    pegarLinguagemPorId(userId) {
        return knex.select('*').from('linguagens').where('id', userId).then((resultado) => {
            return resultado[0];
        });
    },
    pegarPadraoPorId(userId) {
        return knex.select('*').from('padroes').where('id', userId).then((resultado) => {
            return resultado[0];
        })
    },
    editarPadrao({data, userId}) {
        console.log(`id: ${userId}`);
        return knex('padroes').where('id', userId).update({
            titulo: data.nomePadrao,
            visibilidade: data.visibilidade,
            texto: data.texto
        })
    },
    editarLinguagem({data, userId}) {
        return knex('linguagens').where('id', userId).update({
            nome: data.nomeLinguagem,
            visibilidade: data.visibilidade,
            descricao: data.descricaoLinguagem 
        })
    },
    deletarPadrao(userId) {
        return knex('padroes').where('id', userId).del();
    },
    deletarLinguagem(userId) {
        return knex('linguagens').where('id', userId).del();
    }
}

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