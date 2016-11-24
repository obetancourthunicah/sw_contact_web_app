//Archivo de Control de la Aplicacion

//Cuando JqueryMobile se ha cargado
  //Funciones de Inicio
  $("#contact_list").on('pagecreate', contact_list_onLoad );
  $("#contact_detail").on('pagecreate', function(){ _dtlCargado = true;} );
  $("#contact_list_mainlist").on('click','a',contact_list_mainList_onclick);




// Handlers
var _currectPage = 1;
var _numPersonas = 9999;
var _currentContactId = "";
var _dtlCargado = false;
function contact_list_onLoad(e){
    obtenerPersonas(_currectPage, _numPersonas,
        function(err, personas){
          if(err){
            return console.log("Error al Cargar Personas");
          }
          var htmlstr = personas.map(
            function(persona, i){
              return '<li><a href="#contact_detail" data-id="'+persona._id+'">'+persona.nombre + " " + persona.apellido +'</a></li>';
            }
          ).join("");

          $("#contact_list_mainlist").html(htmlstr).listview("refresh");

        }
      );
} //contact_list_onLoad

  function contact_list_mainList_onclick(e){
    e.preventDefault();
    e.stopPropagation();
    var sender = $(this);
    _currentContactId = sender.data("id");
    console.log(_currentContactId);
    obtenerPersonaActual(_currentContactId, function(err, persona){
      if(err) return console.log("Error al cargar persona");
      console.log(persona);
      $("#dtlNombre").html(persona.nombre);
      $("#dtlApellido").html(persona.apellido);
      var direccionesHtml = "";
      if(persona.direcciones && true){
         direccionesHtml = persona.direcciones.map(
            function(direccion,i){
              return "<li><p>"+direccion.direccion+"</p><p>"+direccion.telefono+"</p><p>"+direccion.correo+"</p></li>";
            }
          ).join("");
        }
      direccionesHtml += '<li><a href="#nueva_direccion">Agregar Dirección</a></li>';
      console.log(direccionesHtml);
      var lv = $("#dtlDirecciones").html(direccionesHtml);
      if(_dtlCargado) lv.listview("refresh");
      changeTo("contact_detail");
    });
  }//contact_list_mainList_onclick


//Ajax events
//Configurar Ajax
var settings = {
  "async": true,
  "crossDomain": true,
  "dataType":"json",
  "headers": {
    "cache-control": "no-cache"
  }
}

$.ajaxSetup(settings);

function obtenerPersonas(page, numPersonas, despues){
    $.ajax(
      {
        "url":"api/personas/"+page + "/" + numPersonas,
        "method":"get",
        "data":{},
        "success": function(data, txtSuccess, xhrq){
                        despues(null, data);
                    },
        "error": function(xhrq, errTxt, data){
                        despues(true, null);
                    }
      }
    );
} //obtenerPersonas

function obtenerPersonaActual(currentid, despues){
      $.ajax(
        {
          "url":"api/persona/" + currentid,
          "method":"get",
          "data":{},
          "success": function(data, txtSuccess, xhrq){
                          despues(null, data);
                      },
          "error": function(xhrq, errTxt, data){
                          despues(true, null);
                      }
        }
      );
}


//utilities
function changeTo(to){
  $(":mobile-pagecontainer").pagecontainer("change","#" + to);
}
