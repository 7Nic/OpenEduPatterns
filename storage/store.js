// ALTER TABLE thetable ADD UNIQUE INDEX(col1, col2);
// Coloque esse comando ao criar as tabelas de relacionamento, para evitar valores repetidos
// Pois usaremos o comando INSERT IGNORE... para ignorar valores repetidos, os quais não serão inseridos
// ==================================================ANTES DE TUDO========================================

// Arquivo responsavel pelo armazenamento, ele que roda os comandos SQl
const knex   = require('knex')(require('./knexfile'));
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

    criarPadrao({nomePadrao, visibilidade, texto, templateId}) {
        return knex('padroes').insert({
            titulo: nomePadrao,
            visibilidade,
            texto,
            templates_id: templateId,
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
    listLanguagesWithOwner() {
        // select l.nome, l.linguagens_id, u.name, u.usuarios_id from usuarios u inner join usuarios_linguagens ul on u.usuarios_id = ul.usuarios_id inner join linguagens l on ul.linguagens_id = l.linguagens_id;
        return knex.select('linguagens.linguagens_id', 'linguagens.nome', 'usuarios.usuarios_id', 'usuarios.name', 'linguagens.created_at', 'linguagens.descricao')
            .from('usuarios')
            .innerJoin('usuarios_linguagens', 'usuarios.usuarios_id', 'usuarios_linguagens.usuarios_id')
            .innerJoin('linguagens', 'usuarios_linguagens.linguagens_id', 'linguagens.linguagens_id');
    },
    listPatternsWithOwner() {
        return knex.select('usuarios.usuarios_id', 'usuarios.name', 'padroes.padroes_id', 'padroes.titulo', 'padroes.created_at', 'padroes.texto')
            .from('usuarios')
            .innerJoin('usuarios_padroes', 'usuarios.usuarios_id', 'usuarios_padroes.usuarios_id')
            .innerJoin('padroes', 'usuarios_padroes.padroes_id', 'padroes.padroes_id');
    },
    pegarLinguagemPorId(Id) {
        return knex.select('*').from('linguagens').where('linguagens_id', Id).then((result) => {
            return result[0]; //[0] to return just the unique row 
        });
    },
    pegarPadraoPorId(Id) {
        return knex.select('*').from('padroes').where('padroes_id', Id).then((result) => {
            return result[0];
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
    editPatternInPadroes({data, Id}) {
        return knex('padroes').where('padroes_id', Id).update({
            titulo: data.elementContent[0],
            visibilidade: data.visibilidade
        });
    },
    editPatternInElementsContent({patternId, elementsContentArray}) {
        return Promise.all(elementsContentArray.map((content, index) => {
            // UPDATE elements_content ec inner join elements e on ec.elements_id = e.elements_id SET ec.content="Soluçãoo" where ec.patterns_id=391 and e.order=4;
            return knex('elements_content').innerJoin('elements', 'elements_content.elements_id', 'elements.elements_id').where('elements_content.patterns_id', patternId).andWhere('elements.order', index+1).update({
                content: content
            });
        }));
    },
    editarLinguagem({data, Id}) {
        return knex('linguagens').where('linguagens_id', Id).update({
            nome: data.nomeLinguagem,
            visibilidade: data.visibilidade,
            descricao: data.descricaoLinguagem 
        })
    },
    deletePatternInPadroes(Id) {
        return knex('padroes').where('padroes_id', Id).del();
    },
    deletePatternInUsuariosPadroes(Id) {
        return knex('usuarios_padroes').where('padroes_id', Id).del();
    },
    deletePatternInElementsContent(Id) {
        return knex('elements_content').where('patterns_id', Id).del();
    },
    deletarLinguagem(Id) {
        return knex('linguagens').where('linguagens_id', Id).del();
    },
    padroesDeUmaLinguagem(Id) { //Retorna os padroes da linguagem que tem o Id que passamos
        //Não usamos SELECT * pois evitamos busca e download de dados desnecessários 
        return knex
            .select('titulo', 'padroes.padroes_id')
            .from('padroes')
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
    userPatterns(Id) { //Padrões de um usuário
        return knex.select('*')
        .from('padroes')
        .innerJoin('usuarios_padroes', 'padroes.padroes_id', 'usuarios_padroes.padroes_id')
        .innerJoin('usuarios', 'usuarios_padroes.usuarios_id', 'usuarios.usuarios_id')
        .where('usuarios.usuarios_id', Id)
        .then((resultado) => {
            return resultado;
        });
    },
    userLanguages(Id) { //Linguagens de um usuário
        return knex.select('*')
            .from('linguagens')
            .innerJoin('usuarios_linguagens', 'linguagens.linguagens_id', 'usuarios_linguagens.linguagens_id')
            .innerJoin('usuarios', 'usuarios_linguagens.usuarios_id', 'usuarios.usuarios_id')
            .where('usuarios.usuarios_id', Id)
            .then((resultado) => {
                return resultado;
            });
    },
    ownerOfPattern(patternId) {
        // select u.usuarios_id from usuarios u inner join usuarios_padroes up on u.usuarios_id = up.usuarios_id inner join padroes p on up.padroes_id = p.padroes_id where p.padroes_id=191;
        return knex
            .select('usuarios.usuarios_id', 'usuarios.name')
            .from('usuarios')
            .innerJoin('usuarios_padroes', 'usuarios.usuarios_id', 'usuarios_padroes.usuarios_id')
            .innerJoin('padroes', 'usuarios_padroes.padroes_id', 'padroes.padroes_id')
            .where('padroes.padroes_id', patternId)
            .then((result) => {
                return result[0];
            });
    },
    ownerOfLanguage(languageId) {
        return knex
            .select('usuarios.usuarios_id', 'usuarios.name')
            .from('usuarios')
            .innerJoin('usuarios_linguagens', 'usuarios.usuarios_id', 'usuarios_linguagens.usuarios_id')
            .innerJoin('linguagens', 'usuarios_linguagens.linguagens_id', 'linguagens.linguagens_id')
            .where('linguagens.linguagens_id', languageId)
            .then((result) => {
                return result[0];
            });
    },
    addCommentLanguage(text, user_id, language_id, user_name) {
        return knex('languages_comments').insert({
            text,
            user_id,
            language_id,
            user_name,
            created_at: new Date()
        });
    },
    addCommentPattern(text, user_id, pattern_id, user_name) {
        return knex('patterns_comments').insert({
            text,
            user_id,
            pattern_id,
            user_name,
            created_at: new Date()
        });
    },
    commentsOfLanguageById(languageId) {
        // select lc.text, lc.user_name, lc.created_at from languages_comments lc join linguagens l on lc.language_id = l.linguagens_id where l.linguagens_id=251;
        return knex
            .select('languages_comments.text', 'languages_comments.user_name', 'languages_comments.created_at')
            .from('languages_comments')
            .join('linguagens', 'languages_comments.language_id', 'linguagens.linguagens_id')
            .where('linguagens.linguagens_id', languageId);
    },
    commentsOfPatternById(patternId) {
        return knex
            .select('patterns_comments.text', 'patterns_comments.user_name', 'patterns_comments.created_at')
            .from('patterns_comments')
            .join('padroes', 'patterns_comments.pattern_id', 'padroes.padroes_id')
            .where('padroes.padroes_id', patternId);
    },
    assemblyPatternById(patternId) {
        // SELECT e.name, ec.content FROM templates t 
        // INNER JOIN templates_elements te ON t.templates_id = te.templates_id 
        // INNER JOIN elements e ON te.elements_id = e.elements_id 
        // INNER JOIN elements_content ec ON e.elements_id = ec.elements_id 
        // INNER JOIN padroes p ON ec.patterns_id = p.padroes_id 
        // WHERE padroes_id=151
        // ORDER BY e.order ASC; 
        return knex
        .select('elements.name', 'elements_content.content')
        .from('templates')
        .innerJoin('templates_elements', 'templates.templates_id', 'templates_elements.templates_id')
        .innerJoin('elements', 'templates_elements.elements_id', 'elements.elements_id')
        .innerJoin('elements_content', 'elements.elements_id', 'elements_content.elements_id')
        .innerJoin('padroes', 'elements_content.patterns_id', 'padroes.padroes_id')
        .where('padroes.padroes_id', patternId)
        .orderBy('elements.order', 'ASC');
    },
    addTemplate({name, ownerId}) {
        return knex('templates').insert({
                    name: name,
                    owner_id: ownerId
                }).returning('templates_id');
    },
    addElementsInDB(elementsNamesArray) {
        //The promisse.all already returns the array, so we just return the promise itself
        return Promise.all(elementsNamesArray.map((elementName, index) => {
            return knex('elements')
                .insert({
                    name: elementName,
                    order: index+1 //index starts counting from 0
                })
                .returning('elements_id'); //Delete me: it is right, because returns only one variable, and the .map needs to return only, so it is right
        }));
    },
    relateContent2Element(templateId, elementsIdArray) {
        return Promise.all(elementsIdArray.map(elementId => {
            //This raw function substitutes INSERT for INSERT IGNORE
            return knex.raw(knex('templates_elements').insert({
                templates_id: templateId,
                elements_id: elementId
                })
                .toString()
                .replace('insert', 'INSERT IGNORE'));
        }));
    },
    elementsNameOfTemplate(templateId) {
        // select e.name from templates_elements te inner join elements e on te.elements_id = e.elements_id where te.templates_id=81 order by e.order asc;
        return knex
            .select('elements.name')
            .from('templates_elements')
            .innerJoin('elements', 'templates_elements.elements_id', 'elements.elements_id')
            .where('templates_elements.templates_id', templateId)
            .orderBy('elements.order', 'ASC');
    },
    elementsIdOfTemplate(templateId) {
        // select e.elements_id from templates_elements te inner join elements e on te.elements_id = e.elements_id where te.templates_id=81 order by e.order asc;
        return knex
            .select('elements.elements_id')
            .from('templates_elements')
            .innerJoin('elements', 'templates_elements.elements_id', 'elements.elements_id')
            .where('templates_elements.templates_id', templateId)
            .orderBy('elements.order', 'ASC');
    },
    addContentOfElements({elementContentArray, patternId, elementsIdArray}) {
        return Promise.all(elementContentArray.map((elementContent, index) => {
            return knex('elements_content')
                .insert({
                    content: elementContent,
                    patterns_id: patternId,
                    elements_id: elementsIdArray[index] // [index] because elementContentArray and elementsIdArray has the same amount of elements and [index].elements_id because is an array of objects (returned by knex)
                });
        })); 
    },
    templatesIdOfUser(userId) {
        return knex.select('templates_id').from('templates').where('owner_id', userId).then((result) =>{
            var Ids = result.map((template) => { //To return a clean array of Ids, not an array of objects
                return template.templates_id;
            });
            return Ids;
        });
    },
    multipleTemplateElements(templatesIdArray) {
        return Promise.all(templatesIdArray.map((templateId) => {
            // select e.name from templates t inner join  templates_elements te on t.templates_id = te.templates_id inner join elements e on te.elements_id = e.elements_id where t.templates_id=191 order by t.templates_id asc, e.order asc;
            return knex
                .select('elements.name')
                .from('templates')
                .innerJoin('templates_elements', 'templates.templates_id', 'templates_elements.templates_id')
                .innerJoin('elements', 'templates_elements.elements_id', 'elements.elements_id')
                .where('templates.templates_id', templateId)
                .orderBy('elements.order', 'asc')
                .then(result => {
                    return result.map(oneName => {
                        return oneName.name;
                    }); //To return an array strings, not an array of objects
                });
        }));
    },
    templatesNameOfUser(userId) {
        // select name from templates where owner_id=271;
        return knex.select('name').from('templates').where('owner_id', userId).then((namesArray) =>{
            return namesArray.map((oneName) => { //To return a clean array of names, not an array of objects
                return oneName.name;
            });
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