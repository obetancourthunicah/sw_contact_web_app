//Archivo de Control de la Aplicacion

//Cuando JqueryMobile se ha cargado
//Funciones de Inicio


$("#contact_list").on('pagecreate', contact_list_onLoad);
$("#contact_detail").on('pagecreate', function() { _dtlCargado = true; });
$("#contact_list_mainlist").on('click', 'a', contact_list_mainList_onclick);
$("#btn_agregar_contact").on('click', nc_contact_onclick);
$("#btn_agregar_direccion").on('click', nd_direccion_onclick);
$("#btn_login").on('click', lg_login_onclick);
$("#btn_register").on('click', lg_register_onclick);




// Handlers
var _currectPage = 1;
var _numPersonas = 9999;
var _currentContactId = "";
var _dtlCargado = false;
//Para Manejar el tocken 
var _tocken = "";
var _tockenValidated = false;
//verificamos si el browser soporta localstorage
var _storageAvailable = (typeof(Storage) !== "undefined") ? true : false;


function validateTocken() {
    if (!_tockenValidated && _storageAvailable) {
        //verificamos si existe algun tocken en la localstorage
        if (localStorage._tocken) {
            _tocken = localStorage._tocken;
        }
        _tockenAvailable = (_tocken) && true;
    }
    ajax_validate_token(function(err, data) {
        if (err) {
            _tocken = "";
            _tockenValidated = false;
            _tockenAvailable = false;
            //esto elimina el sibolo del localStorage
            delete localStorage._tocken;
            changeTo("login_page");
        } else {
            _tockenValidated = true;
            _tockenAvailable = true;
            changeTo("contact_list");
        }
    })
} //validateTocken

function contact_list_onLoad(e) {
    obtenerPersonas(_currectPage, _numPersonas,
        function(err, personas) {
            if (err) {
                return console.log("Error al Cargar Personas");
            }
            render_persona_list(personas);

        }
    );
} //contact_list_onLoad


function render_persona_list(personas) {
    var htmlstr = personas.map(
        function(persona, i) {
            return '<li><a href="#contact_detail" data-id="' + persona._id + '">' + persona.nombre + " " + persona.apellido + '</a></li>';
        }
    ).join("");

    $("#contact_list_mainlist").html(htmlstr).listview("refresh");
}

function contact_list_mainList_onclick(e) {
    e.preventDefault();
    e.stopPropagation();
    var sender = $(this);
    _currentContactId = sender.data("id");
    console.log(_currentContactId);
    render_persona_actual();
} //contact_list_mainList_onclick

function render_persona_actual() {
    obtenerPersonaActual(_currentContactId, function(err, persona) {
        if (err) return console.log("Error al cargar persona");
        console.log(persona);
        $("#dtlNombre").html(persona.nombre);
        $("#dtlApellido").html(persona.apellido);
        var direccionesHtml = "";
        if (persona.direcciones && true) {
            direccionesHtml = persona.direcciones.map(
                function(direccion, i) {
                    return "<li><p>" + direccion.direccion + "</p><p>" + direccion.telefono + "</p><p>" + direccion.correo + "</p></li>";
                }
            ).join("");
        }
        direccionesHtml += '<li><a href="#nueva_direccion">Agregar Dirección</a></li>';
        console.log(direccionesHtml);
        var lv = $("#dtlDirecciones").html(direccionesHtml);
        if (_dtlCargado) lv.listview("refresh");
        changeTo("contact_detail");
    });
}

function nc_contact_onclick(e) {
    e.preventDefault();
    e.stopPropagation();

    var _nombre = $("#nc_nombre").val();
    var _apellido = $("#nc_apellido").val();

    var form_body = {
        "nombre": _nombre,
        "apellido": _apellido
    };

    guardarNuevoContacto(form_body, function(err, data) {
            if (err) {
                return console.log("Error al guardar contacto");
            }
            $("#nc_nombre").val("");
            $("#nc_apellido").val("");

            obtenerPersonas(_currectPage, _numPersonas,
                function(err, personas) {
                    if (err) {
                        return console.log("Error al Cargar Personas");
                    }
                    render_persona_list(personas);
                    changeTo("contact_list");
                }); //obtenerPersonas
        } // guardarNuevoContacto
    );
} //nc_contact_onclick

function nd_direccion_onclick(e) {
    e.preventDefault();
    e.stopPropagation();

    var _telefono = $("#nd_telefono").val();
    var _direccion = $("#nd_direccion").val();
    var _correo = $("#nd_correo").val();

    var _form_body = {
        "direccion": _direccion,
        "telefono": _telefono,
        "correo": _correo
    };

    guardarNuevaDireccion(_currentContactId, _form_body, function(err, data) {
        if (err) {
            return console.log("Error al guardar la dirección");
        }
        $("#nd_telefono").val("");
        $("#nd_direccion").val("");
        $("#nd_correo").val("");

        render_persona_actual();

    }); //guardarNuevaDireccion//;

} //

function lg_login_onclick(e) {
    e.preventDefault();
    e.stopPropagation();

    var _correo = $("#lg_correo").val();
    var _password = $("#lg_password").val();

    var login_data = {
        "correo": _correo,
        "password": _password
    };

    login_ajax(login_data, function(err, data) {
        if (err) {
            alert("Error al validar credenciales");
        } else {
            _tocken = data._id;
            _tockenValidated = true;
            _tockenAvailable = true;
            localStorage._tocken = _tocken;
            changeTo("contact_list");
        }
    }); //login
} //lg_login_onclick

function lg_register_onclick(e) {
    e.preventDefault();
    e.stopPropagation();

    var _correo = $("#rg_correo").val();
    var _password = $("#rg_password").val();
    var _nombre = $("#rg_nombre").val();

    var register_data = {
        "correo": _correo,
        "password": _password,
        "nombre": _nombre
    };

    register_ajax(register_data, function(err, data) {
        if (err) {
            alert("Error al Registrar Usuario");
        } else {
            changeTo("login_page");
            $("#rg_correo").val("");
            $("#rg_password").val("");
            $("#rg_nombre").val("");
        }
    }); //login
} //lg_register_onclick

//Ajax events
//Configurar Ajax
var settings = {
    "async": true,
    "crossDomain": true,
    "dataType": "json",
    "headers": {
        "cache-control": "no-cache"
    }
}

$.ajaxSetup(settings);

function login_ajax(form_data, despues) {
    $.ajax({
        "url": "api/usuario/login",
        "method": "post",
        "data": form_data,
        "success": function(data, txtSuccess, xhrq) {
            despues(null, data);
        },
        "error": function(xhrq, errTxt, data) {
            despues(true, null);
        }
    });
} //login_ajax

function register_ajax(form_data, despues) {
    $.ajax({
        "url": "api/usuario/nuevo",
        "method": "post",
        "data": form_data,
        "success": function(data, txtSuccess, xhrq) {
            despues(null, data);
        },
        "error": function(xhrq, errTxt, data) {
            despues(true, null);
        }
    });
} //register_ajax

function ajax_validate_token(despues) {
    $.ajax({
        "url": "/api/tocken/" + _tocken,
        "method": "get",
        "data": {},
        "success": function(data, txtSuccess, xhrq) {
            despues(null, data);
        },
        "error": function(xhrq, errTxt, data) {
            despues(true, null);
        }
    });
} // ajax_validate_token

function obtenerPersonas(page, numPersonas, despues) {
    $.ajax({
        "url": "api/personas/" + page + "/" + numPersonas + "?tocken=" + _tocken,
        "method": "get",
        "data": {},
        "success": function(data, txtSuccess, xhrq) {
            despues(null, data);
        },
        "error": function(xhrq, errTxt, data) {
            despues(true, null);
        }
    });
} //obtenerPersonas

function obtenerPersonaActual(currentid, despues) {
    $.ajax({
        "url": "api/persona/" + currentid + "?tocken=" + _tocken,
        "method": "get",
        "data": {},
        "success": function(data, txtSuccess, xhrq) {
            despues(null, data);
        },
        "error": function(xhrq, errTxt, data) {
            despues(true, null);
        }
    });
}

function guardarNuevoContacto(form_data, despues) {
    $.ajax({
        "url": "api/nueva_persona?tocken=" + _tocken,
        "method": "post",
        "data": form_data,
        "success": function(data, txtSuccess, xhrq) {
            despues(null, data);
        },
        "error": function(xhrq, errTxt, data) {
            despues(true, null);
        }
    });
};

function guardarNuevaDireccion(current_id, form_data, despues) {
    $.ajax({
        "url": "api/persona/" + current_id + "?tocken=" + _tocken,
        "method": "put",
        "data": form_data,
        "success": function(data, txtSuccess, xhrq) {
            despues(null, data);
        },
        "error": function(xhrq, errTxt, data) {
            despues(true, null);
        }
    });
};

//utilities
function changeTo(to) {
    $(":mobile-pagecontainer").pagecontainer("change", "#" + to);
}

//funciones que se corren al inicio

function init_spa(e) {
    console.log("Inició Mobile SPA");
    validateTocken();
}

init_spa();