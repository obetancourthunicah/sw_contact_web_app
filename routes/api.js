var express = require('express');
var router = express.Router();
var assign = require('object-assign');
var ObjectID = require('mongodb').ObjectID;
function apiFactory(db){
  var personasColl = db.collection('personas');

  router.post('/nueva_persona', function(req,res,next){
    var newPersona = assign({},{"nombre":"","apellido":""},req.body);
    personasColl.insert(newPersona, function(err, rslt){
      if(err){
        return res.status(400).json(err);
        //res.status(400).json({"error":"No se puede insertar!"});
      }
      res.status(200).json(newPersona);
    }
    );
  });
  router.get('/personas', function(req,res,next){
    personasColl.find({}).toArray(function(err,personas){
      if(err){
        return res.status(400).json([]);
      }
      res.status(200).json(personas);
    });
  });

  router.get('/persona/:id', function(req,res,next){
      var id = ObjectID(req.params.id);
      personasColl.findOne({"_id":id}, function(err,persona){
        if(err){
          console.log(err);
          return res.status(400).json({"error":"Error al cargar la persona"});
        }
        res.status(200).json(persona);
      });
  });

  router.put('/persona/:id', function(req,res,next){
      var id = ObjectID(req.params.id);
      var updateAddress = assign({},
                                  {"direccion":"",
                                  "telefono":"",
                                  "correo":""},
                                  req.body
                                );
        var updateExpression = {"$push":
                                  {"direcciones":updateAddress},
                                "$inc":
                                  {"numDirecciones":1}
                                };
        personasColl.update({"_id":id},updateExpression, function(err,rlt){
            if(err){
              console.log(err);
              return res.status(400).json({"error":"No se pudo actualizar persona"});
            }
            //console.log(rlt.result);
            if(rlt.result.nModified){
                res.status(200).json({"status":"ok"});
            }else{
              res.status(400).json({"error":"No se modificó la persona seleccionada"});
            }

        });
  });

  router.get('/personas/:pagina/:documentos', function(req,res,next){
      var paginaReal = parseInt(req.params.pagina) -1;
      if(paginaReal <0) paginaReal = 0;
      var documentos = parseInt(req.params.documentos);
      if (documentos < 5) documentos  =5;
      personasColl.find()
                  .project({"nombre":1,"apellido":1})
                  .sort({"nombre":1})
                  .skip((paginaReal * documentos))
                  .limit(documentos)
                  .toArray(function(err, personas){
                    if(err){
                      return res.status(400).json({"error":"Error al obtener personas"});
                    }
                    res.status(200).json(personas);
                  });
  });

 return router;
} //apiFactory

module.exports = apiFactory;
