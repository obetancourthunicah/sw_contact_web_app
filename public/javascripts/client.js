//Archivo de Control de la Aplicacion

//Cuando JqueryMobile se ha cargado
  //Funciones de Inicio
  $("#contact_list").on('pagecreate', contact_list_onLoad );
  $("#contact_detail").on('pagecreate', function(){ _dtlCargado = true;} );
  $("#contact_list_mainlist").on('click','a',contact_list_mainList_onclick);
  $("#btn_agregar_contact").on('click',nc_contact_onclick);
  $("#btn_agregar_direccion").on('click',nd_direccion_onclick);



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
          render_persona_list(personas);

        }
      );
} //contact_list_onLoad


  function render_persona_list(personas){
    var htmlstr = personas.map(
      function(persona, i){
        return '<li><a href="#contact_detail" data-id="'+persona._id+'">'+persona.nombre + " " + persona.apellido +'</a></li>';
      }
    ).join("");

    $("#contact_list_mainlist").html(htmlstr).listview("refresh");
  }

  function contact_list_mainList_onclick(e){
    e.preventDefault();
    e.stopPropagation();
    var sender = $(this);
    _currentContactId = sender.data("id");
    console.log(_currentContactId);
    render_persona_actual();
  }//contact_list_mainList_onclick

  function render_persona_actual(){
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
  }

  function nc_contact_onclick(e){
      e.preventDefault();
      e.stopPropagation();

      var _nombre = $("#nc_nombre").val();
      var _apellido = $("#nc_apellido").val();

      var form_body = {
        "nombre": _nombre,
        "apellido":_apellido
      };

      guardarNuevoContacto(form_body, function(err, data){
        if(err){
          return console.log("Error al guardar contacto");
        }
        $("#nc_nombre").val("");
        $("#nc_apellido").val("");

        obtenerPersonas(_currectPage, _numPersonas,
            function(err, personas){
              if(err){
                return console.log("Error al Cargar Personas");
              }
              render_persona_list(personas);
              changeTo("contact_list");
            } );//obtenerPersonas
          }// guardarNuevoContacto
      );
  }//nc_contact_onclick

  function nd_direccion_onclick(e){
    e.preventDefault();
    e.stopPropagation();

    var _telefono = $("#nd_telefono").val();
    var _direccion = $("#nd_direccion").val();
    var _correo = $("#nd_correo").val();

    var _form_body =  {
        "direccion": _direccion,
        "telefono": _telefono,
        "correo": _correo
    };

  guardarNuevaDireccion(_currentContactId,_form_body, function(err, data){
      if(err){
        return console.log("Error al guardar la dirección");
      }
      $("#nd_telefono").val("");
      $("#nd_direccion").val("");
      $("#nd_correo").val("");

      render_persona_actual();

    }
  ); //guardarNuevaDireccion//;

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

function guardarNuevoContacto(form_data, despues){
  $.ajax(
    {
      "url":"api/nueva_persona",
      "method":"post",
      "data":form_data,
      "success": function(data, txtSuccess, xhrq){
                      despues(null, data);
                  },
      "error": function(xhrq, errTxt, data){
                      despues(true, null);
                  }
    }
  );
};

function guardarNuevaDireccion(current_id,form_data, despues){
  $.ajax(
    {
      "url":"api/persona/"+ current_id,
      "method":"put",
      "data":form_data,
      "success": function(data, txtSuccess, xhrq){
                      despues(null, data);
                  },
      "error": function(xhrq, errTxt, data){
                      despues(true, null);
                  }
    }
  );
};

//utilities
function changeTo(to){
  $(":mobile-pagecontainer").pagecontainer("change","#" + to);
}
