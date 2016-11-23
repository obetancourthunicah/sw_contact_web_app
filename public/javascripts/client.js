//Archivo de Control de la Aplicacion

//Funciones de Inicio
$("#contact_list").on('pagecreate', contact_list_onLoad );

// Handlers
var _currectPage = 1;
var _numPersonas = 10;

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
}


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
}
