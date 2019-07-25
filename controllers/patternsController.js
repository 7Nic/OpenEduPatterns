const fs = require('fs');
const pdf = require('html-pdf');
const delay = require('delay');
const options = { format: 'Letter' };
const _ = require('underscore');

const store = require('../storage/store');

module.exports = {
    async index (req, res) {
        var patterns = await store.listPublicPatternsWithOwner();
        if (res.locals.loggedIn) {
            var privatePatternsOfLoggedUser = await store.listPrivatePatternsOfAnUserWithOwner(req.user.usuarios_id);
            patterns = patterns.concat(privatePatternsOfLoggedUser);
        }
        // Date parsing
        patterns.forEach((pattern) => {
            pattern.dayCreation = pattern.created_at.getDate();
            pattern.monthCreation = pattern.created_at.getMonth() + 1; //Starts counting from 0
            pattern.yearCreation = pattern.created_at.getFullYear();
        });
        res.render('padroes.ejs', {padroes: patterns, csrfToken: req.csrfToken(), user: req.user, messages: req.flash('feedback')});
    },

    async patternsCreateGet (req, res) {
        var templateId = req.session.templateId;
        // req.session.templateId = null; //Reset the used variable
        var templateElements = await store.elementsNameOfTemplate(templateId);
        var patterns = await store.listarTodosPadroes();
        res.render('createPattern.ejs', {patterns: patterns, templateElements: templateElements, csrfToken: req.csrfToken(), user: req.user, messages: req.flash('error')});
    },

    async patternsCreatePost (req, res) {
        var visibilidadeNum = null;
        if(req.body.visibilidade === 'Público' || req.body.visibilidade === 'Public'){
            visibilidadeNum = 0;
        } else if(req.body.visibilidade === 'Privado' || req.body.visibilidade === 'Private'){
            visibilidadeNum = 1;
        } else {
            visibilidadeNum = null;
        }

        var tagsStringBefore = req.body.tags;
        var tagsArray = tagsStringBefore.split(",");
        
        var patternsToRelateArray = req.body.patterns2Relate;
        //If req.body.patterns2Relate is not an array, we'll create an array of one object in order to use .map function
        if (typeof patternsToRelateArray === 'string') { //If patternsToRelateArray is a string, it is just an element, and we'll create an array
            patternsToRelateArray = [];
            patternsToRelateArray.push(req.body.patterns2Relate);patternsToRelateArray
        } 

        // Handle CkEditor issues with empty fields
        if (req.body.elementContent[0] === '<p>&nbsp;</p>') {
            req.body.elementContent[0] = undefined;
        }

        if (req.cookies.lang == 'en') {
            req.checkBody('elementContent[0]', 'The field Name cannot be empty').notEmpty();
        } else {
            req.checkBody('elementContent[0]', 'O campo de nome não pode ficar vazio').notEmpty();
        }
        
        var errors = req.validationErrors();

        if(errors) {
                var messages = [];
                errors.forEach((error) => {
                    messages.push(error.msg);
                });
                req.flash('error', messages);
                res.redirect('/patterns/create');
        } else {
            req.body.createNewTemplate = (req.body.createNewTemplate === 'true'); //Convert string to boolean

            if (req.body.createNewTemplate) {
                var templateName = req.body.newTemplateName;
                console.log(req.body.newTemplateName);
                if (templateName === "") {
                    templateName = "Template";
                }
                var templateId = await store.addTemplate({name: templateName, ownerId: req.user.usuarios_id});
                var elementsNamesArray = req.body.elementName;
                var elementsIdArray = await store.addElementsInDB(elementsNamesArray);
                await store.relateContent2Element(templateId, elementsIdArray);
                var newPatternId = await store.criarPadrao({nomePadrao: req.body.elementContent[0], visibilidade: visibilidadeNum, templateId: templateId});
                await store.relateUserPattern(req.user.usuarios_id, newPatternId);
                await store.addContentOfElements({elementContentArray: req.body.elementContent, patternId: newPatternId, elementsIdArray: elementsIdArray});
                await store.relatePattern2Pattern(newPatternId, patternsToRelateArray);
            } else {
                var newPatternId = await store.criarPadrao({nomePadrao: req.body.elementContent[0], visibilidade: visibilidadeNum, templateId: req.session.templateId});
                await store.relateUserPattern(req.user.usuarios_id, newPatternId);
                await store.relatePattern2Pattern(newPatternId, patternsToRelateArray);
                var elementsIdArrayOfObjects = await store.elementsIdOfTemplate(req.session.templateId);
                //Convert array of objects to array
                var elementsIdArray = elementsIdArrayOfObjects.map(obj => {
                    return obj.elements_id;
                });
                await store.addContentOfElements({elementContentArray: req.body.elementContent, patternId: newPatternId, elementsIdArray: elementsIdArray});
            }
            var tagsIdArray = await store.createPatternTag(tagsArray);
            await store.relatePattern2Tags(newPatternId, tagsIdArray);

            if (req.cookies.lang == 'en') {
                req.flash('feedback', "Pattern created successfully");
            } else {
                req.flash('feedback', "Padrão criado com sucesso");
            }

            res.redirect('/patterns');
        }

    },

    async patternsEditGet (req, res) {
        var assembledPattern = await store.assemblyPatternById(req.params.id);
        var relatedPatterns = await store.patternsRelatedToAPattern(req.params.id);
        var allPatterns = await store.lisPublicPatternsMinimized();
        var patternsOfTheSameLanguage = await store.patternsOfTheSameLanguage(req.params.id);
        //I want an undefined object, not an empty array
        if (patternsOfTheSameLanguage.length === 0) {
            patternsOfTheSameLanguage = undefined;
        }

        //Returns an array of not related patterns
        var notRelatedPatterns = _.filter(allPatterns, function(obj){ return !_.findWhere(relatedPatterns, obj); });

        var tagsArray = await store.tagsOfPattern(req.params.id);
        var tagsString = tagsArray.toString();

        res.render('editarPadroes.ejs', {tagsString, patternsOfTheSameLanguage, notRelatedPatterns, relatedPatterns: relatedPatterns, patternContent: assembledPattern, patternId: req.params.id, csrfToken: req.csrfToken(), user: req.user, messages: req.flash('error')});
    },

    async patternsEditPost (req, res) {
        var data = req.body;
        if(data.visibilidade === 'Público' || req.body.visibilidade === 'Public'){
            data.visibilidade = 0;
        } else if(data.visibilidade === 'Privado' || req.body.visibilidade === 'Private'){
            data.visibilidade = 1;
        } else {
            data.visibilidade = null;
        }

        var tagsStringBefore = req.body.tags;
        var tagsArrayAfter = tagsStringBefore.split(",");
        
        var patternsToRelateArray = req.body.patterns2Relate;
        //If req.body.patterns2Relate is not an array, we'll create an array of one object in order to use .map function
        if (typeof patternsToRelateArray === 'string') { //If patternsToRelateArray is a string, it is just an element, and we'll create an array
            patternsToRelateArray = [];
            patternsToRelateArray.push(req.body.patterns2Relate);
        }
        
        // Handle CkEditor issues with empty fields
        if (req.body.elementContent[0] === '<p>&nbsp;</p>') {
            req.body.elementContent[0] = undefined;
        }

        if (req.cookies.lang == 'en') {
            req.checkBody('elementContent[0]', 'The field Name cannot be empty').notEmpty();
        } else {
            req.checkBody('elementContent[0]', 'O campo de nome não pode ficar vazio').notEmpty();
        }

        var errors = req.validationErrors();

        if (errors) {
            var messages = [];
            errors.forEach((error) => {
                messages.push(error.msg);
            });
            req.flash('error', messages);
            res.redirect(`/patterns/${req.params.id}/edit`);
        } else {
            await store.editPatternInPadroes({data, Id: req.params.id});
            await store.editPatternInElementsContent({patternId: req.params.id, elementsContentArray: req.body.elementContent});
            await store.deletePatternsInPatternsPatterns(req.params.id);
            await store.relatePattern2Pattern(req.params.id, patternsToRelateArray); //esse
            await store.deleteOldRelathionshipsPattern2Tags(req.params.id);
            var tagsIdArray = await store.createPatternTag(tagsArrayAfter);
            await store.relatePattern2Tags(req.params.id, tagsIdArray);

            if (req.cookies.lang == 'en') {
                req.flash('feedback', "Properties saved successfully");
            } else {
                req.flash('feedback', "Propriedades salvas com sucesso");
            }

            res.redirect(`/patterns/${req.params.id}`);
        }
    },

    async patternsDeletePost (req, res) {
        await store.deletePatternInPadroes(req.params.id);
        await store.deletePatternInUsuariosPadroes(req.params.id);
        await store.deletePatternInElementsContent(req.params.id);
        await store.deletePatternsInPatternsPatterns(req.params.id);
        if (req.cookies.lang == 'en') {
            req.flash('feedback', "Pattern deleted successfully");
        } else {
            req.flash('feedback', "Padrão deletado com sucesso");
        }
        res.redirect('/patterns');
    },

    async patternPageGet (req, res) {
        var patternInfo = await store.pegarPadraoPorId(req.params.id);
        var owner = await store.ownerOfPattern(req.params.id);
        var comments = await store.commentsOfPatternById(req.params.id);
        var assembledPattern = await store.assemblyPatternById(req.params.id);
        var relatedPatterns = await store.patternsRelatedToAPattern(req.params.id);
        var templateId = await store.templateOfPattern(req.params.id);

        var isAlexander = undefined;
        if (templateId === 1) {
            isAlexander = true;
        } else {
            isAlexander = false;
        }

        if (patternInfo) {
            patternInfo.dayCreation = patternInfo.created_at.getDate();
            patternInfo.monthCreation = patternInfo.created_at.getMonth() + 1; //Starts counting from 0
            patternInfo.yearCreation = patternInfo.created_at.getFullYear();
            
            
            if (patternInfo.visibilidade === 0) {
                if (req.cookies.lang == 'en') {
                    patternInfo.visibilidade = 'Public';
                } else {
                    patternInfo.visibilidade = 'Público';
                }
                
            } else {
                if (req.cookies.lang == 'en') {
                    patternInfo.visibilidade = 'Private';
                } else {
                    patternInfo.visibilidade = 'Privado';
                }
            }
            
        }

        var tagsArray = await store.tagsOfPattern(req.params.id);

        res.render('patternPage.ejs', {tagsArray, isAlexander, relatedPatterns: relatedPatterns, patternContent: assembledPattern , isLoggedIn: req.isAuthenticated(), comments: comments, pattern: patternInfo, owner: owner, csrfToken: req.csrfToken(), messages: req.flash('feedback')});
    },

    async addCommentPattern (req, res) {
        var text = req.body.patternComment;
        var userId = req.user.usuarios_id;
        var patternId = req.params.id;
        var userName = req.user.name;

        if (req.cookies.lang == 'en') {
            req.flash('feedback', "Comment added successfully");
        } else {
            req.flash('feedback', "Comentário adicionado com sucesso");
        }        

        await store.addCommentPattern(text, userId, patternId, userName);
        res.redirect(`/patterns/${req.params.id}`);
    },

    async choseTemplateGet (req, res) {
        var templatesId = await store.templatesIdOfUser(req.user.usuarios_id);
        var templatesElements = await store.multipleTemplateElements(templatesId);
        var templatesName = await store.templatesNameOfUser(req.user.usuarios_id);
        res.render('choseTemplate.ejs', {templatesId: templatesId ,templatesElements: templatesElements, templatesName: templatesName, csrfToken: req.csrfToken(), messages: req.flash('error')});
    },

    async choseTemplatePost (req, res) {
        if (req.body.templateChosenId) {
            req.session.templateId = req.body.templateChosenId; //Use this info the render the next page
            res.redirect('/patterns/create');
        } else {
            var templateName = req.body.templateName;
            if (templateName === "") {
                templateName = "Template";
            }
            var templateId = await store.addTemplate({name: templateName, ownerId: req.user.usuarios_id});
            req.session.templateId = templateId; //Use this info the render the next page
            var elementsNamesArray = req.body.titleElement;

            var elementsIdArray = await store.addElementsInDB(elementsNamesArray);
            await store.relateContent2Element(templateId, elementsIdArray);
            
            res.redirect('/patterns/create');
        }
    },

    async exportPdfGet (req, res) {
        var assembledPattern = await store.assemblyPatternById(req.params.id);
        var relatedPatterns = await store.patternsRelatedToAPattern(req.params.id);
        var patternVisibility = await store.patternVisibility(req.params.id);
        var patternIsPublic = undefined;
        if (patternVisibility.visibilidade === 1) {
            patternIsPublic = false;
        } else {
            patternIsPublic = true;
        }

        var owner = await store.ownerOfPattern(req.params.id);

        if (patternIsPublic || (res.locals.loggedIn && owner.usuarios_id === req.user.usuarios_id)) {
            var templateId = await store.templateOfPattern(req.params.id);

            //Create the new file
            var stream = fs.createWriteStream("./public/Pdfs/temporary.html", {flags:'a'});
            stream.write(`<!DOCTYPE html>\n<html>\n<head>\n<title>Pdf</title>\n</head>\n<body>\n`);


            assembledPattern.forEach( function (item,index) {
                if (templateId === 1) { //If it's Alexander
                    if (index === 0) {
                        stream.write("<div style='text-align: center;'><h2><strong>" + item.content + "</strong></h2></div>" + "\n");
                    } else if (index === 3 || index === 4) {
                        stream.write("<p style='font-style: italic; text-align: center;'>***</p>");
                        stream.write("<div style='text-align: center;'><strong>" + item.content + "</strong></div>" + "\n");
                    } else {
                        stream.write("<p style='font-style: italic; text-align: center;'>***</p>");
                        stream.write("<div style='text-align: center;'>" + item.content + "</div>" + "\n");
                    }
                } else {
                    stream.write("<h2 style='text-align: center;'>" + item.name + "</h2>" + "\n");

                    if (item.name === "Padrões relacionados" || item.name === "Padrões Relacionados" || item.name === "Padroes relacionados" || item.name === "Padroes Relacionados" || item.name === "padrões relacionados" || item.name === "padrões Relacionados" || item.name === "padroes relacionados" || item.name === "padroes Relacionados") {
                        stream.write("<div style='text-align: center;'><p>|");
                        relatedPatterns.forEach((relatedPattern) => { 
                            stream.write(`<a href='/patterns/${relatedPattern.padroes_id}'>${relatedPattern.titulo}</a> |`);
                        });
                        stream.write("</p></div>");
                    } else {
                        stream.write("<div style='text-align: center;'>" + item.content + "</div>" + "\n");
                    }
                }

            });
            
            

            stream.write("</body>\n</html>");
            stream.end(); 
            

            //Wait to save the file in disk
            await delay(10);

            fs.readFile('./public/Pdfs/temporary.html', 'utf8', function(err, data) {
                pdf.create(data, options).toFile(`./public/Pdfs/pattern${req.params.id}.pdf`, function(err, result) {
                    if (err) return console.log(err);

                    // Delete the html file
                    fs.unlink('./public/Pdfs/temporary.html');

                    fs.readFile(`./public/Pdfs/pattern${req.params.id}.pdf`, function(err, pdfFile) {
                        if (err) return console.log(err);

                        res.contentType("application/pdf");
                        res.send(pdfFile);

                        //Delete the pdf file after sending to the browser
                        fs.unlink(`./public/Pdfs/pattern${req.params.id}.pdf`);
                    });
                });
            });

        } else {
            
            res.render('mensagem.ejs', {mensagem: "Você não tem acesso a esse Padrão."});
        }
    }
}