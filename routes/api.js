var express = require('express');
var router = express.Router();
var assign = require('object-assign');
var ObjectID = require('mongodb').ObjectID;

function apiFactory(db) {
    var personasColl = db.collection('personas');
    var usuariosColl = db.collection('usuarios');
    var tockensColl = db.collection('tockens');

    //registrarusuario
    router.post('/usuario/nuevo', function(req, res, next) {
        var newPersona = { "correo": "", "nombre": "", "password": "" };
        newPersona = assign({}, newPersona, req.body);
        usuariosColl.insert(newPersona, function(err, rsl) {
            if (err) {
                console.log(err);
                return res.status(400).json({ "error": "No se pudo insertar usuario" });
            }
            res.status(200).json({ "status": "ok" });
        });
    }); // /usuario/nuevo

    router.post('/usuario/login', function(req, res, next) {
        var credenciales = { "correo": "", "password": "" };
        credenciales = assign({}, credenciales, req.body);
        var query = { "correo": credenciales.correo };
        usuariosColl.findOne(query, function(err, usuario) {
            if (err) {
                console.log(err);
                return res.status(400).json({ "error": "No se pudo encontrar usuario" });
            }
            if (!usuario) {
                return res.status(400).json({ "error": "No se pudo encontrar usuario" });
            }
            console.log(usuario);
            console.log(credenciales);
            if (usuario.password != credenciales.password) {
                return res.status(400).json({ "error": "Credenciales no son válidas" });
            }
            var newTocken = { "correo": credenciales.correo, "fecha": (Date.now() + (1000 * 60 * 60 * 24 * 30)) };

            tockensColl.insert(newTocken, function(err, rslt) {
                if (err) {
                    return res.status(400).json({ "error": "No se pudo generar tocken" });
                }
                res.status(200).json(newTocken);
            });

        });
    }); //login


    //validaruntocken
    router.get('/tocken/:tk', function(req, res, next) {
        if (!req.params.tk) {
            return res.status(400).json({ "error": "tocken no es válido" });
        }
        var query = { "_id": ObjectID(req.params.tk), "fecha": { "$gte": Date.now() } };
        tockensColl.findOne(query, function(err, tockenDoc) {
            if (err) {
                return res.status(400).json({ "error": "tocken no es válido" });
            }
            if (!tockenDoc) {
                return res.status(400).json({ "error": "tocken no es válido" });
            }
            res.status(200).json({ "status": "ok" });
        });
    }); //tocken

    function validateTockenInternal(req, res, next) {
        var tocken = req.query.tocken;
        if (!tocken) {
            return res.status(400).json({ "error": "Acceso denegado" });
        }
        var tockenFilter = { "_id": ObjectID(tocken) };
        tockensColl.findOne(tockenFilter, function(err, tockenDoc) {
            if (err) {
                return res.status(400).json({ "error": "Acceso Denegado" });
            }
            if (!tockenDoc) {
                return res.status(400).json({ "error": "Acceso Denegado" });
            }
            next();
        });
    }


    router.post('/nueva_persona', validateTockenInternal, function(req, res, next) {
        var newPersona = assign({}, { "nombre": "", "apellido": "" }, req.body);
        personasColl.insert(newPersona, function(err, rslt) {
            if (err) {
                return res.status(400).json(err);
                //res.status(400).json({"error":"No se puede insertar!"});
            }
            res.status(200).json(newPersona);
        });
    });
    router.get('/personas', validateTockenInternal, function(req, res, next) {
        personasColl.find({}).toArray(function(err, personas) {
            if (err) {
                return res.status(400).json([]);
            }
            res.status(200).json(personas);
        });
    });

    router.get('/persona/:id', validateTockenInternal, function(req, res, next) {
        var id = ObjectID(req.params.id);
        personasColl.findOne({ "_id": id }, function(err, persona) {
            if (err) {
                console.log(err);
                return res.status(400).json({ "error": "Error al cargar la persona" });
            }
            res.status(200).json(persona);
        });
    });

    router.put('/persona/:id', validateTockenInternal, function(req, res, next) {
        var id = ObjectID(req.params.id);
        var updateAddress = assign({}, {
                "direccion": "",
                "telefono": "",
                "correo": ""
            },
            req.body
        );
        var updateExpression = {
            "$push": { "direcciones": updateAddress },
            "$inc": { "numDirecciones": 1 }
        };
        personasColl.update({ "_id": id }, updateExpression, function(err, rlt) {
            if (err) {
                console.log(err);
                return res.status(400).json({ "error": "No se pudo actualizar persona" });
            }
            //console.log(rlt.result);
            if (rlt.result.nModified) {
                res.status(200).json({ "status": "ok" });
            } else {
                res.status(400).json({ "error": "No se modificó la persona seleccionada" });
            }

        });
    });

    router.get('/personas/:pagina/:documentos', validateTockenInternal, function(req, res, next) {
        var paginaReal = parseInt(req.params.pagina) - 1;
        if (paginaReal < 0) paginaReal = 0;
        var documentos = parseInt(req.params.documentos);
        if (documentos < 5) documentos = 5;
        personasColl.find()
            .project({ "nombre": 1, "apellido": 1 })
            .sort({ "nombre": 1 })
            .skip((paginaReal * documentos))
            .limit(documentos)
            .toArray(function(err, personas) {
                if (err) {
                    return res.status(400).json({ "error": "Error al obtener personas" });
                }
                res.status(200).json(personas);
            });
    });

    return router;
} //apiFactory

module.exports = apiFactory;