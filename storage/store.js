// ALTER TABLE thetable ADD UNIQUE INDEX(col1, col2);
// Coloque esse comando ao criar as tabelas de relacionamento, para evitar valores repetidos
// Pois usaremos o comando INSERT IGNORE... para ignorar valores repetidos, os quais não serão inseridos
// ==================================================ANTES DE TUDO========================================

//This file handles the SQL commands
const knex   = require('knex')(require('./knexfile'));
const crypto = require('crypto');
//Essa é a maneira de importar o knex, faça o paiol e depois passe o objeto com os detalhes do banco de dados, nesse caso colocamos 
//esse objeto no arquivo knexfile e exportamos ele lá para importar aqui

module.exports = {
    saltHashPassword,

    createUser ({name, email, password}) {
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
    listarTodosPadroes() {
        return knex
        .select('*')
        .from('padroes')
        .then((resultado) => {
            return resultado;
        });
    },
    listarPadroesPublicos() {
        return knex
        .select('*')
        .from('padroes')
        .where('visibilidade', 0)
        .then((resultado) => {
            return resultado;
        });
    },
    lisPublicPatternsMinimized() { //Minimized: Just name and id
        return knex
        .select('padroes_id',  'titulo')
        .from('padroes')
        .where('visibilidade', 0)
        .then((result) => {
            return result;
        });
    },
    listarTodasLinguagens() {
        return knex.select('*').from('linguagens').then((resultado) => {
            return resultado;
        });
    },
    listarLinguagensPublicas() {
        return knex
        .select('*')
        .from('linguagens')
        .where('visibilidade', 0)
        .then((resultado) => {
            return resultado;
        });
    },
    listPublicLanguagesMinimized() { //Minimized: Just name and id
        return knex
        .select('linguagens_id', 'nome')
        .from('linguagens')
        .where('visibilidade', 0)
        .then((result) => {
            return result;
        });
    },
    listPublicLanguagesWithOwner() {
        // select l.nome, l.linguagens_id, u.name, u.usuarios_id from usuarios u inner join usuarios_linguagens ul on u.usuarios_id = ul.usuarios_id inner join linguagens l on ul.linguagens_id = l.linguagens_id;
        return knex.select('linguagens.linguagens_id', 'linguagens.nome', 'usuarios.usuarios_id', 'usuarios.name', 'linguagens.created_at', 'linguagens.descricao')
            .from('usuarios')
            .innerJoin('usuarios_linguagens', 'usuarios.usuarios_id', 'usuarios_linguagens.usuarios_id')
            .innerJoin('linguagens', 'usuarios_linguagens.linguagens_id', 'linguagens.linguagens_id')
            .where('linguagens.visibilidade', 0);
    },
    listAllLangugagesWithOwner() {
        return knex.select('linguagens.linguagens_id', 'linguagens.nome', 'usuarios.usuarios_id', 'usuarios.name', 'linguagens.created_at', 'linguagens.descricao')
            .from('usuarios')
            .innerJoin('usuarios_linguagens', 'usuarios.usuarios_id', 'usuarios_linguagens.usuarios_id')
            .innerJoin('linguagens', 'usuarios_linguagens.linguagens_id', 'linguagens.linguagens_id');
    },
    listPrivateLanguagesOfAnUserWithOwner(userId) {
        return knex.select('linguagens.linguagens_id', 'linguagens.nome', 'usuarios.usuarios_id', 'usuarios.name', 'linguagens.created_at', 'linguagens.descricao')
            .from('usuarios')
            .innerJoin('usuarios_linguagens', 'usuarios.usuarios_id', 'usuarios_linguagens.usuarios_id')
            .innerJoin('linguagens', 'usuarios_linguagens.linguagens_id', 'linguagens.linguagens_id')
            .where('linguagens.visibilidade', 1)
            .andWhere('usuarios.usuarios_id', userId);
    },
    listPublicPatternsWithOwner() {
        return knex.select('usuarios.usuarios_id', 'usuarios.name', 'padroes.padroes_id', 'padroes.titulo', 'padroes.created_at', 'padroes.texto')
            .from('usuarios')
            .innerJoin('usuarios_padroes', 'usuarios.usuarios_id', 'usuarios_padroes.usuarios_id')
            .innerJoin('padroes', 'usuarios_padroes.padroes_id', 'padroes.padroes_id')
            .where('padroes.visibilidade', 0);
    },
    listAllPatternsWithOwner() {
        return knex.select('usuarios.usuarios_id', 'usuarios.name', 'padroes.padroes_id', 'padroes.titulo', 'padroes.created_at', 'padroes.texto')
            .from('usuarios')
            .innerJoin('usuarios_padroes', 'usuarios.usuarios_id', 'usuarios_padroes.usuarios_id')
            .innerJoin('padroes', 'usuarios_padroes.padroes_id', 'padroes.padroes_id');
    },
    listPrivatePatternsOfAnUserWithOwner(userId) {
        // SELECT u.usuarios_id, u.name, p.padroes_id, p.titulo, p.created_at, p.texto 
        // FROM usuarios AS u 
        // INNER JOIN usuarios_padroes AS up ON u.usuarios_id=up.usuarios_id 
        // INNER JOIN padroes AS p ON up.padroes_id=p.padroes_id 
        // WHERE p.visibilidade=1  AND u.usuarios_id=271;
        return knex.select('usuarios.usuarios_id', 'usuarios.name', 'padroes.padroes_id', 'padroes.titulo', 'padroes.created_at', 'padroes.texto')
            .from('usuarios')
            .innerJoin('usuarios_padroes', 'usuarios.usuarios_id', 'usuarios_padroes.usuarios_id')
            .innerJoin('padroes', 'usuarios_padroes.padroes_id', 'padroes.padroes_id')
            .where('padroes.visibilidade', 1)
            .andWhere('usuarios.usuarios_id', userId);
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
    //Já foi refeito
    padroesDeUmaLinguagem(Id) {
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
    relatePattern2LanguageWithArray(languageId, patternsToRelateArray) {
        return Promise.all(patternsToRelateArray.map(eachPatternId => {
            //This raw function substitutes INSERT for INSERT IGNORE
            return knex.raw(knex('linguagens_padroes').insert({
                linguagens_id: languageId,
                padroes_id: eachPatternId
                })
                .toString()
                .replace('insert', 'INSERT IGNORE'));
        }));
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
        // WHERE padroes_id=593
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
                    }); //To return an array of strings, not an array of objects
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
    },
    patternsRelatedToAPattern(patternId) {
        // SELECT b.padroes_id, b.titulo 
        // FROM padroes AS a 
        // INNER JOIN patterns_patterns AS pp ON a.padroes_id = pp.patterns_id1 
        // INNER JOIN padroes AS b ON pp.patterns_id2 = b.padroes_id 
        // WHERE a.padroes_id=391;
        return knex
            .select('b.padroes_id', 'b.titulo')
            .from('padroes AS a')
            .innerJoin('patterns_patterns AS pp', 'a.padroes_id', 'pp.patterns_id1')
            .innerJoin('padroes AS b', 'pp.patterns_id2', 'b.padroes_id')
            .where('a.padroes_id', patternId);
    },

    relatePattern2Pattern(relatedPattern, patternsToRelateArray) {
        // Duplicate queries are handled using unique keys(ALTER TABLE patterns_patterns ADD UNIQUE (patterns_id1, patterns_id2);)
        // so, duplicate relationships (A, B) won't occur

        //If is an unique object, create an array of one object
        if (!(Array.isArray(patternsToRelateArray))) patternsToRelateArray = [patternsToRelateArray];

        if (patternsToRelateArray != undefined) {
            return Promise.all(patternsToRelateArray.map(patternToRelate => {
                return  knex('patterns_patterns').insert({
                        patterns_id1: relatedPattern,
                        patterns_id2: patternToRelate
                        })
                        .then((result) => {
                            return result[0];
                        })
                        .catch((err) => {
                            //If the relation already exists, return the id of the relation
                            return knex.select('relation_pattern_id').from('patterns_patterns').where('patterns_id1', relatedPattern).andWhere('patterns_id2', patternToRelate).then(result => result[0].relation_pattern_id);
                        });
            }));
        } else {
            //Do nothing
            //But we need to return a Promise, even though it is empty
            return new Promise((resolve, reject) => {
                resolve();
            });
        }
    },
    deletePatternsInPatternsPatterns(patternId) { //Delete the relationship between the 2 patterns
        console.log('aqui msm');
        return knex('patterns_patterns').where('patterns_id1', patternId).orWhere('patterns_id2', patternId).returning('relation_pattern_id').del();
    },
    languagesRelatedToALanguage(languageId) {
        // SELECT b.linguagens_id, b.nome 
        // FROM linguagens AS a 
        // INNER JOIN languages_languages AS ll ON a.linguagens_id = ll.languages_id1
        // INNER JOIN linguagens AS b ON ll.languages_id2 = b.linguagens_id 
        // WHERE a.linguagens_id=391;
        return knex
            .select('b.linguagens_id', 'b.nome')
            .from('linguagens AS a')
            .innerJoin('languages_languages AS ll', 'a.linguagens_id', 'll.languages_id1')
            .innerJoin('linguagens AS b', 'll.languages_id2', 'b.linguagens_id')
            .where('a.linguagens_id', languageId);
    },
    relateLanguage2Language(relatedLanguage, languagesToRelateArray) {
        if (languagesToRelateArray != undefined) {
            return Promise.all(languagesToRelateArray.map(languageToRelate => {
                //This raw function substitutes INSERT for INSERT IGNORE
                return knex.raw(knex('languages_languages').insert({
                    languages_id1: relatedLanguage,
                    languages_id2: languageToRelate
                    })
                    .toString()
                    .replace('insert', 'INSERT IGNORE'));
            }));
        } else {
            //Do nothing
            //But we need to return a Promise, even though it is empty
            return new Promise((resolve, reject) => {
                resolve();
            });
        }
    },
    deleteLanguageInLanguagesLanguages(languageId) { //Delete the relationship between the 2 languages
        return knex('languages_languages').where('languages_id1', languageId).orWhere('languages_id2', languageId).del();
    },
    storeProfilePhoto(userId, filenameProfilePhoto) {
        return knex('usuarios').where('usuarios_id', userId).update({
            profile_photo: filenameProfilePhoto
        })
    },
    getProfilePhoto(userId) {
        return knex.select('profile_photo').from('usuarios').where('usuarios_id', userId).then((result) => {
            return result[0].profile_photo;
        });
    },
    deleteProfilePhoto(userId) {
        return knex('usuarios').where('usuarios_id', userId).update({
            profile_photo: null
        });
    },
    patternsOfTheSameLanguage(patternId) {
        // select distinct p.padroes_id, p.titulo from linguagens_padroes as lp1 
        // inner join linguagens as l on lp1.linguagens_id=l.linguagens_id  
        // inner join linguagens_padroes as lp2 on l.linguagens_id=lp2.linguagens_id 
        // inner join padroes as p on lp2.padroes_id=p.padroes_id 
        // where lp1.padroes_id=151 and p.padroes_id<>151;
        return knex('linguagens_padroes as lp1')
                .distinct('p.padroes_id')
                .select('p.padroes_id', 'p.titulo')
                .innerJoin('linguagens as l', 'lp1.linguagens_id', 'l.linguagens_id')
                .innerJoin('linguagens_padroes as lp2', 'l.linguagens_id', 'lp2.linguagens_id')
                .innerJoin('padroes as p', 'lp2.padroes_id', 'p.padroes_id')
                .where('lp1.padroes_id', patternId)
                .andWhere('p.padroes_id', '!=', patternId);
    },
    templateOfPattern(patternId) {
        return knex.select('templates_id').from('padroes').where('padroes_id', patternId).then((result) => {
            return result[0].templates_id;
        });
    },
    searchInPatterns(word) {
        // select distinct ec.patterns_id, p.titulo 
        // from elements_content as ec 
        // inner join padroes as p on ec.patterns_id = p.padroes_id 
        // left join patterns_tags_relation as ptr on p.padroes_id = ptr.patterns_id
        // left join patterntags as pt on ptr.tags_id = pt.tags_id 
        // where (ec.content LIKE '%word%' or p.titulo LIKE '%word%' or pt.tag_name LIKE '%word%') and p.visibilidade=0;
        return knex('elements_content AS ec')
            .distinct('p.padroes_id')
            .select('p.padroes_id', 'p.titulo')
            .innerJoin('padroes AS p', 'ec.patterns_id', 'p.padroes_id')
            .leftJoin('patterns_tags_relation AS ptr', 'p.padroes_id', 'ptr.patterns_id')
            .leftJoin('patterntags AS pt', 'ptr.tags_id', 'pt.tags_id')
            .where('visibilidade', 0)
            .andWhere((query) => {
                return query
                    .where('ec.content', 'LIKE', '%'+word+'%')
                    .orWhere('p.titulo', 'LIKE', '%'+word+'%')
                    .orWhere('pt.tag_name', 'LIKE', '%'+word+'%');
            });
            
    },
    searchInLanguages(word) {
        // SELECT DISTINCT l.linguagens_id, l.nome
        // FROM linguagens AS l
        // LEFT JOIN languages_tags_relation AS ltr ON l.linguagens_id = ltr.languages_id
        // LEFT JOIN languagetags AS lt ON ltr.tags_id = lt.tags_id
        // WHERE (l.nome LIKE '%test%' OR l.descricao LIKE '%desc%' OR lt.tag_name LIKE '%tag%') AND l.visibilidade=0; 
        return knex('linguagens AS l')
            .distinct('l.linguagens_id')
            .select('l.linguagens_id', 'l.nome')
            .leftJoin('languages_tags_relation AS ltr', 'l.linguagens_id', 'ltr.languages_id')
            .leftJoin('languagetags AS lt', 'ltr.tags_id', 'lt.tags_id')
            .where('l.visibilidade', 0)
            .andWhere((query) => {
                return query
                    .where('l.nome', 'LIKE', '%'+word+'%')
                    .orWhere('l.descricao', 'LIKE', '%'+word+'%')
                    .orWhere('lt.tag_name', 'LIKE', '%'+word+'%');
            });
    },
    searchByAuthorInPatterns(word) {
        // SELECT p.padroes_id, p.titulo 
        // FROM usuarios AS u 
        // INNER JOIN usuarios_padroes AS up ON u.usuarios_id=up.usuarios_id 
        // INNER JOIN padroes AS p ON up.padroes_id=p.padroes_id
        // WHERE u.name LIKE '%word%';
        return knex('usuarios AS u')
            .select('p.padroes_id', 'p.titulo')
            .innerJoin('usuarios_padroes AS up', 'u.usuarios_id', 'up.usuarios_id')
            .innerJoin('padroes AS p', 'up.padroes_id', 'p.padroes_id')
            .where('u.name', 'LIKE', '%'+word+'%')
            .andWhere('visibilidade', 0);
    },
    searchByAuthorInLanguages(word) {
        // SELECT l.linguagens_id, l.nome 
        // FROM usuarios AS u 
        // INNER JOIN usuarios_linguagens AS ul ON u.usuarios_id=ul.usuarios_id 
        // INNER JOIN linguagens AS l ON ul.linguagens_id=l.linguagens_id
        // WHERE u.name LIKE '%word%';
        return knex('usuarios AS u')
            .select('l.linguagens_id', 'l.nome')
            .innerJoin('usuarios_linguagens AS ul', 'u.usuarios_id', 'ul.usuarios_id')
            .innerJoin('linguagens AS l', 'ul.linguagens_id', 'l.linguagens_id')
            .where('u.name', 'LIKE', '%'+word+'%')
            .andWhere('visibilidade', 0);;
    },
    searchInElementContent(element, word) {
        // SELECT p.padroes_id, p.titulo, e.name, ec.content 
        // FROM elements AS e 
        // INNER JOIN elements_content AS ec ON e.elements_id=ec.elements_id 
        // INNER JOIN padroes AS p ON ec.patterns_id=p.padroes_id 
        // WHERE e.name='Nome' AND ec.content LIKE '%p%';
        return knex('elements AS e')
            .select('p.padroes_id', 'p.titulo')
            .innerJoin('elements_content AS ec', 'e.elements_id', 'ec.elements_id')
            .innerJoin('padroes AS p', 'ec.patterns_id', 'p.padroes_id')
            .where('e.name', element)
            .andWhere('ec.content', 'LIKE', '%'+word+'%')
            .andWhere('visibilidade', 0);
    },
    patternVisibility(patternId) {
        return knex('padroes')
            .select('visibilidade')
            .where('padroes_id', patternId)
            .then((result) => {
                return result[0];
            });
    },
    // Ps.: The tags tables has the column tag_name as unique index, so when we try to add a duplicate tag, it just doesn't add
    createLanguageTag(tagsNameArray) {
        return Promise.all(tagsNameArray.map((eachTagName, index) => {
            return knex('languagetags')
                .insert({
                    tag_name: eachTagName
                })
                .returning('tags_id');
        }));
    },
    deleteOldRelathionshipsLanguage2Tags(languageId) {
        return knex('languages_tags_relation').where('languages_id', languageId).del();
    },
    relateLanguage2Tags(languageId, tagsIdArray) {
        return Promise.all(tagsIdArray.map((eachTagId, index) => {
            return knex.raw(knex('languages_tags_relation').insert({
                languages_id: languageId,
                tags_id: eachTagId
                })
                .toString()
                .replace('insert', 'INSERT IGNORE'));
        }));
    },
    createPatternTag(tagsNameArray) {
        return Promise.all(tagsNameArray.map((eachTagName, index) => {
            return knex('patterntags')
                .insert({
                    tag_name: eachTagName
                })
                .returning('tags_id');
        }));
    },
    deleteOldRelathionshipsPattern2Tags(patternId) {
        return knex('patterns_tags_relation').where('patterns_id', patternId).del();
    },
    relatePattern2Tags(patternId, tagsIdArray) {
        return Promise.all(tagsIdArray.map((content, index) => {
            return knex.raw(knex('patterns_tags_relation').insert({
                patterns_id: patternId,
                tags_id: content
                })
                .toString()
                .replace('insert', 'INSERT IGNORE'));
        }));
    },
    tagsOfPattern(patternId) {
        // SELECT pt.tag_name
        // FROM patterns_tags_relation AS ptr
        // INNER JOIN patterntags AS pt ON ptr.tags_id = pt.tags_id
        // WHERE ptr.patterns_id=201;
        return knex('patterns_tags_relation AS ptr')
            .select('pt.tag_name')
            .innerJoin('patterntags AS pt', 'ptr.tags_id', 'pt.tags_id')
            .where('ptr.patterns_id', patternId)
            .then((result) => {
                var tagNamesArray = result.map((eachTagName) => { //To return a clean array, not an array of objects
                    return eachTagName.tag_name;
                });
                return tagNamesArray;
            });

    },
    tagsOfLanguage(languageId) {
        return knex('languages_tags_relation AS ltr')
            .select('lt.tag_name')
            .innerJoin('languagetags AS lt', 'ltr.tags_id', 'lt.tags_id')
            .where('ltr.languages_id', languageId)
            .then((result) => {
                var tagNamesArray = result.map((eachTagName) => { //To return a clean array, not an array of objects
                    return eachTagName.tag_name;
                });
                return tagNamesArray;
            });
    },
    // ===============================================================================
    //Each language has (pattern_pattern) relationships. This function inserts the relationship between a language and a (pattern_pattern_id) in a many to many table relationship 
    relateLanguage2relationPatternId(languageId, relationPatternIdArray) {
        return Promise.all(relationPatternIdArray.map(eachRelationId => {
            //This raw function substitutes INSERT for INSERT IGNORE
            return knex.raw(knex('language__relation_pattern_id').insert({
                language_id: languageId,
                relation_pattern_id: eachRelationId
                })
                .toString()
                .replace('insert', 'INSERT IGNORE'));
        }));
    },
    //Relates a language with a lot of patterns, there is another similar function, but this one uses an array
    relatePattern2LanguageWithArray(languageId, patternsToRelateArray) {
        return Promise.all(patternsToRelateArray.map(eachPatternId => {
            //This raw function substitutes INSERT for INSERT IGNORE
            return knex.raw(knex('linguagens_padroes').insert({
                linguagens_id: languageId,
                padroes_id: eachPatternId
                })
                .toString()
                .replace('insert', 'INSERT IGNORE'));
        }));
    },

    patternsRelatedToAPatternInsideLanguageContext(languageId, patternsId){
        //languageId is the id of the language that is being used as context

        // SELECT pp.patterns_id2 
        // FROM patterns_patterns AS pp 
        // INNER JOIN language__relation_pattern_id AS lrpi ON lrpi.relation_pattern_id = pp.relation_pattern_id 
        // INNER JOIN padroes AS p ON p.padroes_id=pp.patterns_id2 
        // WHERE (lrpi.language_id=571 AND pp.patterns_id1=1561);
        return knex
            .select('p.padroes_id', 'p.titulo')
            .from('patterns_patterns AS pp')
            .innerJoin('language__relation_pattern_id AS lrpi', 'lrpi.relation_pattern_id', 'pp.relation_pattern_id')
            .innerJoin('padroes AS p', 'p.padroes_id', 'pp.patterns_id2')
            .where('lrpi.language_id', languageId)
            .andWhere('pp.patterns_id1', patternsId);
    },

    patternsOfALanguage(languageId) {
        // SELECT DISTINCT p.padroes_id, p.titulo FROM padroes AS p 
        // INNER JOIN patterns_patterns AS pp ON p.padroes_id=pp.patterns_id1 
        // INNER JOIN language__relation_pattern_id AS lrpi ON lrpi.relation_pattern_id=pp.relation_pattern_id 
        // WHERE lrpi.language_id=languageId;
        return knex('padroes AS p')
            .distinct('p.padroes_id', 'p.titulo')
            .innerJoin('patterns_patterns AS pp', 'p.padroes_id', 'pp.patterns_id1')
            .innerJoin('language__relation_pattern_id AS lrpi', 'lrpi.relation_pattern_id', 'pp.relation_pattern_id')
            .where('lrpi.language_id', languageId)
            .andWhere('lrpi.language_id', languageId);
    },

    //Relating A->B
    relateP2PWhenCreatingLanguagePart1(relationsArray) {
        // Duplicate queries are handled using unique keys(ALTER TABLE patterns_patterns ADD UNIQUE (patterns_id1, patterns_id2);)
        // so, duplicate relationships (A, B) won't occur

        //If is an unique object, create an array of one object
        if (!(Array.isArray(relationsArray))) relationsArray = [relationsArray];

        if (relationsArray != undefined) {
            return Promise.all(relationsArray.map(ids2Relate => {
                return relationsId1 = knex('patterns_patterns').insert({
                        patterns_id1: ids2Relate[0],
                        patterns_id2: ids2Relate[1]
                        })
                        .then((result) => {
                            return result[0];
                        })
                        .catch((err) => {
                            //If the relation already exists, return the id of the relation
                            return knex.select('relation_pattern_id').from('patterns_patterns').where('patterns_id1', ids2Relate[0]).andWhere('patterns_id2', ids2Relate[1]).then(result => result[0].relation_pattern_id);
                        });
            }));
        } else {
            //Do nothing
            //But we need to return a Promise, even though it is empty
            return new Promise((resolve, reject) => {
                resolve();
            });
        }
    },

    //Relating B->A
    relateP2PWhenCreatingLanguagePart2(relationsArray) {
        // Duplicate queries are handled using unique keys(ALTER TABLE patterns_patterns ADD UNIQUE (patterns_id1, patterns_id2);)
        // so, duplicate relationships (A, B) won't occur

        //If is an unique object, create an array of one object
        if (!(Array.isArray(relationsArray))) relationsArray = [relationsArray];

        if (relationsArray != undefined) {
            return Promise.all(relationsArray.map(ids2Relate => {
                return relationsId1 = knex('patterns_patterns').insert({
                        patterns_id1: ids2Relate[1],
                        patterns_id2: ids2Relate[0]
                        })
                        .then((result) => {
                            return result[0];
                        })
                        .catch((err) => {
                            //If the relation already exists, return the id of the relation
                            return knex.select('relation_pattern_id').from('patterns_patterns').where('patterns_id1', ids2Relate[1]).andWhere('patterns_id2', ids2Relate[0]).then(result => result[0].relation_pattern_id);
                        });
            }));
        } else {
            //Do nothing
            //But we need to return a Promise, even though it is empty
            return new Promise((resolve, reject) => {
                resolve();
            });
        }
    },

    deleteOldRelathionshipsPattern2Language(languageId) {
        return knex('language__relation_pattern_id').where('language_id', languageId).del();
    },

    relationPairsP2POfALanguage(languageId) {
        // SELECT p1.titulo, pp.patterns_id1, p2.titulo, pp.patterns_id2 FROM linguagens AS l 
        // INNER JOIN language__relation_pattern_id AS lrpi ON l.linguagens_id=lrpi.language_id 
        // INNER JOIN patterns_patterns AS pp ON lrpi.relation_pattern_id=pp.relation_pattern_id 
        // INNER JOIN padroes AS p1 ON p1.padroes_id=pp.patterns_id1 
        // INNER JOIN padroes AS p2 ON p2.padroes_id=pp.patterns_id2
        // WHERE l.linguagens_id=languageId AND pp.patterns_id1 < pp.patterns_id2;
        return knex
            .select('p1.titulo AS titulo1', 'pp.patterns_id1', 'p2.titulo AS titulo2', 'pp.patterns_id2')
            .from('linguagens AS l')
            .innerJoin('language__relation_pattern_id AS lrpi', 'l.linguagens_id', 'lrpi.language_id')
            .innerJoin('patterns_patterns AS pp', 'lrpi.relation_pattern_id', 'pp.relation_pattern_id')
            .innerJoin('padroes AS p1', 'p1.padroes_id', 'pp.patterns_id1')
            .innerJoin('padroes AS p2', 'p2.padroes_id', 'pp.patterns_id2')
            .whereRaw('?? < ??', ['pp.patterns_id1', 'pp.patterns_id2'])
            .andWhere('l.linguagens_id', languageId);
    },

    relationP2PIdsContainingAPattern(patternId) {
        return knex
            .select('relation_pattern_id')
            .from("patterns_patterns")
            .where('patterns_id1', patternId)
            .orWhere('patterns_id2', patternId);
    },

    deleteInRelation__pattern_idBasedOnRelationId(idsArray) {
        return Promise.all(idsArray.map(eachId => {
            return knex('language__relation_pattern_id').where('relation_pattern_id', eachId).del();
        }));
    },

    deleteInRelation__pattern_idBasedOnLanguageId(languageId) {
        return knex('language__relation_pattern_id').where('language_id', languageId).del();
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