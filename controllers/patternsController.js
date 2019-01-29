const store = require('../storage/store');

module.exports = {
    index: (req, res) => {
        store.listPatternsWithOwner().then((patterns) => {
            // Date parsing
            patterns.forEach((pattern) => {
                pattern.dayCreation = pattern.created_at.getDate();
                pattern.monthCreation = pattern.created_at.getMonth() + 1; //Starts counting from 0
                pattern.yearCreation = pattern.created_at.getFullYear();
            });
            res.render('padroes.ejs', {padroes: patterns, csrfToken: req.csrfToken(), user: req.user});
		});
    },

    patternsCreateGet: (req, res) => {
        var templateId = req.session.templateId;
        // req.session.templateId = null; //Reset the used variable
        store.elementsNameOfTemplate(templateId).then((templateElements) => {
            res.render('createPattern.ejs', {templateElements: templateElements, csrfToken: req.csrfToken(), user: req.user, messages: req.flash('error')});
        });
    },

    patternsCreatePost: (req, res) => {
        // console.log(req.session.templateId);
        // console.log(req.body.elementName); array
        // console.log(req.body.elementContent); array
        // console.log(req.body.newTemplateName);
        console.log(req.body.createNewTemplate);
        
        var visibilidadeNum = null;
        if(req.body.visibilidade === 'Público'){
            visibilidadeNum = 0;
        } else if(req.body.visibilidade === 'Privado'){
            visibilidadeNum = 1;
        } else {
            visibilidadeNum = null;
        }
        
        req.body.createNewTemplate = (req.body.createNewTemplate === 'true'); //Convert string to boolean
        if (req.body.createNewTemplate) {
            console.log('caminho 1');
            store.addTemplate({name: req.body.newTemplateName, ownerId: req.user.usuarios_id}).then((templateId) => {
                var elementsNamesArray = req.body.elementName;
                console.log('ghgh');
                console.log(req.body.elementName);
                store.addElementsInDB(elementsNamesArray).then((elementsIdArray) => {
                    store.relateContent2Element(templateId, elementsIdArray).then(() => {
                        store.criarPadrao({nomePadrao: req.body.elementContent[0], visibilidade: visibilidadeNum, templateId: templateId}).then((newPatternId) => {
                            store.relateUserPattern(req.user.usuarios_id, newPatternId).then(() => {
                                store.addContentOfElements({elementContentArray: req.body.elementContent, patternId: newPatternId, elementsIdArray: elementsIdArray}).then(() => {
                                    res.redirect('/patterns');
                                });
                            });
                        });
                    });
                });
            });
        } else {
            console.log('caminho 2');
            store.criarPadrao({nomePadrao: req.body.elementContent[0], visibilidade: visibilidadeNum, templateId: req.session.templateId}).then((newPatternId) => {
                store.relateUserPattern(req.user.usuarios_id, newPatternId).then(() => {
                    store.elementsIdOfTemplate(req.session.templateId).then((elementsIdArrayOfObjects) => {
                        //Convert array of objects to array
                        var elementsIdArray = elementsIdArrayOfObjects.map(obj => {
                            return obj.elements_id;
                        });
                        store.addContentOfElements({elementContentArray: req.body.elementContent, patternId: newPatternId, elementsIdArray: elementsIdArray}).then(() => {
                            res.redirect('/patterns');
                        });
                    });
                });
            });
        }


        // var nomePadrao = req.body.nomePadrao;
        // var visibilidade = visibilidadeNum;
        // var texto = req.body.texto        

        // req.checkBody('nomePadrao', 'Campo de nome vazio').notEmpty();
        // req.checkBody('texto', 'Campo de texto vazio').notEmpty();

        // var errors = req.validationErrors();
        
        // if(errors) {
        //     var messages = [];
        //     errors.forEach((error) => {
        //         messages.push(error.msg);
        //     });
        //     req.flash('error', messages);
        //     res.redirect('/languages/create');
        // } else {
        //     store.criarPadrao({
        //         nomePadrao,
        //         visibilidade,
        //         texto
        //     })
        //     .then((patternId) => {
                
        //         store.relateUserPattern(req.user.usuarios_id, patternId)
        //         .then(() => {
        //             res.redirect('/patterns');
        //         });
    
        //     });
        // }
    },

    patternsEditGet: (req, res) => {
        store.pegarPadraoPorId(req.params.id).then((resultado) => {
            res.render('editarPadroes.ejs', {padrao: resultado, csrfToken: req.csrfToken(), user: req.user, messages: req.flash('error')});
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
        
        var nomePadrao = req.body.nomePadrao;
        var texto = req.body.texto;

        req.checkBody('nomePadrao', 'Campo de nome vazio').notEmpty();
        req.checkBody('texto', 'Campo de texto vazio').notEmpty();

        var errors = req.validationErrors();

        if (errors) {
            var messages = [];
            errors.forEach((error) => {
                messages.push(error.msg);
            });
            req.flash('error', messages);
            res.redirect(`/patterns/${req.params.id}/edit`);
        } else {
            store.editarPadrao({data, Id: req.params.id})
                .then(() => {
                    res.redirect(`/patterns/${req.params.id}`);
                });
        }
    },

    patternsDeletePost: (req, res) => {
        store.deletePatternInPadroes(req.params.id).then(() => {
            store.deletePatternInUsuariosPadroes(req.params.id).then(() => {
                store.deletePatternInElementsContent(req.params.id).then(() => {
                    res.redirect('/patterns');
                });
            });
        });
    },

    //Fix this christmas tree, this callback hell!!
    patternPageGet: (req, res) => {
        store.pegarPadraoPorId(req.params.id).then((patternInfo) => {
            store.ownerOfPattern(req.params.id).then((owner) => {
                store.commentsOfPatternById(req.params.id).then((comments) => {
                    store.assemblyPatternById(req.params.id).then((assembledPattern) => {
                        if (patternInfo) {
                            patternInfo.dayCreation = patternInfo.created_at.getDate();
                            patternInfo.monthCreation = patternInfo.created_at.getMonth() + 1; //Starts counting from 0
                            patternInfo.yearCreation = patternInfo.created_at.getFullYear();
                            if (patternInfo.visibilidade === 0) {
                                patternInfo.visibilidade = 'Público';
                            } else {
                                patternInfo.visibilidade = 'Privado';
                            }
                        }
                        res.render('patternPage.ejs', {patternContent: assembledPattern , isLoggedIn: req.isAuthenticated(), comments: comments, pattern: patternInfo, owner: owner, csrfToken: req.csrfToken()});
                    });
                });
            });
            
        });
    },

    addCommentPattern: (req, res) => {
        var text = req.body.patternComment;
        var userId = req.user.usuarios_id;
        var patternId = req.params.id;
        var userName = req.user.name;

        store.addCommentPattern(text, userId, patternId, userName).then(() => {
            res.redirect(`/patterns/${req.params.id}`);
        })
    },

    testAssembly: (req, res) => {
        store.assemblyPatternByElements(req.params.id).then((result) => {

        });
    },

    choseTemplateGet: (req, res) => {
        res.render('choseTemplate.ejs', {csrfToken: req.csrfToken(), messages: req.flash('error')});
    },

    // Callback hell!!!
    choseTemplatePost: (req, res) => {
        // var elementsNamesArray = req.body.titleElement;
        // var elementsContentArray = req.body.contentElement;
        // console.log(elementsContentArray);
        // console.log(elementsNamesArray);
        // res.redirect('/patterns/chosetemplate');

        if (req.body.templateChosenId) {
            console.log('aqui');
            console.log(req.body.templateChosenId)
            req.session.templateId = req.body.templateChosenId; //Use this info the render the next page
            res.redirect('/patterns/create');
        } else {
            store.addTemplate({name: req.body.templateName, ownerId: req.user.usuarios_id}).then((templateId) => {
                req.session.templateId = templateId; //Use this info the render the next page
                var elementsNamesArray = req.body.titleElement;
                store.addElementsInDB(elementsNamesArray).then((elementsIdArray) => {
                    store.relateContent2Element(templateId, elementsIdArray).then(() => {
                        res.redirect('/patterns/create');
                    });
                });
            });
        }
    }
}