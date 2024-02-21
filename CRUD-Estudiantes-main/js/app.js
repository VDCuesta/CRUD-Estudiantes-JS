// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA7Pge-QF85I0doZKnHdE7zBG1BWsmXyfg",
    authDomain: "crud-js-394b8.firebaseapp.com",
    projectId: "crud-js-394b8",
    storageBucket: "crud-js-394b8.appspot.com",
    messagingSenderId: "260132245242",
    appId: "1:260132245242:web:6ae36a22b666d275af0343",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import {
    getDatabase,
    set,
    get,
    update,
    remove,
    ref,
    child,
    push,
    onValue
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const db = getDatabase(app);

const registerForm = document.getElementById("register-form");

// Crear nuevo estudiante

async function registrarNuevoEstudiante() {

    const newStudentRef = push(ref(db, "Students"));

    try {
        const newStudentRef = push(ref(db, "Students"));

        await set(newStudentRef, {
            nombre: registerForm["nombre"].value,
            ape1: registerForm["apellido1"].value,
            ape2: registerForm["apellido2"].value,
            telef: registerForm["telefono"].value,
            email: registerForm["email"].value,
            desc: registerForm["descripcion"].value,
        });

        alert("¡¡Nuevo estudiante registrado!!");
    } catch (error) {
        alert(error);
    }
}

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if(validarDatos(registerForm))
        registrarNuevoEstudiante();
});

////////////////////////CODIGO AÑADIDO///////////////////////////

//PASOS COMUNES////

//Global 
const editForm = document.getElementById("edit-form");

//Eventos

//Se añade evento submit al formulario de edición,
//si son correctos los datos, edita al Alumno en FireBase
editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if(validarDatos(editForm))
        editarAlumno();
});

//ACTUALIZACIÓN DE LA VISTA////////////////

//Refresca y actualiza la tabla
onValue(ref(db, "Students"), alumnos => {
    actualizarTabla(alumnos)
})

//Actualiza la tabla con los alumnos de la BBDD
function actualizarTabla(alumnos) {
    const tabla = document.getElementById("tabla");

    tabla.innerHTML = "";

    const alumnosJSON = alumnos.toJSON();

    for(const idAlumno in alumnosJSON) {
        const alumno = alumnosJSON[idAlumno];
        const fila = crearFila({...alumno, id: idAlumno});

        tabla.appendChild(fila);
    }
}

//Crea y devuelve un botón con las clases de BootStrap y de FontAwesome proporcionadas
//y la función manejadora del evento click del botón
function crearBoton(tipoBoton, tipoIcono, funcionManejadora){
    
    //Creación del botón
    const boton = document.createElement("button");
    boton.setAttribute("type", "button");
    //Añade clase botón de bootstrap
    boton.classList = `btn btn-${tipoBoton}`;
    
    //Crea icono
    const icono = document.createElement("i");
    icono.setAttribute("aria-hidden", "true");
    //Añade clase icono de fontawesome
    icono.classList = `fa fa-${tipoIcono}`;

    //Añade el icono al botón
    boton.appendChild(icono);

    //Añade la función manejadora al evento
    boton.addEventListener("click", funcionManejadora);

    return boton;
}

//Crea una fila de la tabla con las propiedades del objeto
function crearFila ({nombre, ape1, ape2, telef, email, id, desc}) {
    
    //Crea elemento tr
    const fila = document.createElement("tr");

    //Crea th para id 
    const campoId = document.createElement("th");    
    campoId.setAttribute("scope", "row");
    campoId.innerText = id;
    
    //Añade el campo de id a la fila
    fila.appendChild(campoId);

    //Crea un array con las propiedades del objeto
    const campos = [nombre, ape1, ape2, telef, email];

    //Itera sobre el array creando un td que contiene la propiedad
    //y la añade a la fila
    for(const campo of campos) {
        const insercion = document.createElement("td");
        insercion.innerText = campo;
        fila.appendChild(insercion);
    }

    //Crea el botón de editar, que edita el formulario de edición para mostrar
    //los valores del alumno
    const botonEditar = crearBoton("warning", "pencil", () => {
        editForm["nombre"].value = nombre
        editForm["apellido1"].value = ape1
        editForm["apellido2"].value = ape2
        editForm["telefono"].value = telef
        editForm["email"].value = email
        editForm["descripcion"].value = desc
        editForm["id"].value = id
    });

    //Crea el botón de eliminar, que llama a eliminarAlumno
    const botonEliminar = crearBoton("danger", "trash", () => eliminarAlumno(id));

    //Añade los atributos de bootstrap al botón de editar que abren el modal
    botonEditar.setAttribute("data-bs-toggle","modal");
    botonEditar.setAttribute("data-bs-target","#editarModal");

    //Crea elemento td para los botones, los añade al td y a la fila
    const botones = document.createElement("td");

    //Esta clase añida sólo afecta a css
    botones.classList = "btns";

    botones.appendChild(botonEditar);
    botones.appendChild(botonEliminar);

    fila.appendChild(botones);

    //Devuelve el elemento tr relleno
    return fila;
}

//PASOS EDICIÓN Y ELIMINACIÓN DE ESTUDIANTES/////

//Elimina el alumno de la BBDD
async function eliminarAlumno(id) {
    remove(ref(db, "Students/" + id))
}

//Edita las propiedades del alumno en la BBDD con los valores del formulario
async function editarAlumno () {
    await update(ref(db, "Students/" + editForm["id"].value), {
        nombre: editForm["nombre"].value,
        ape1: editForm["apellido1"].value,
        ape2: editForm["apellido2"].value,
        telef: editForm["telefono"].value,
        email: editForm["email"].value,
        desc: editForm["descripcion"].value,
    });
    alert("¡¡El estudiante se ha editado!!")
}

//Valida los campos nombre, apellido1, apellido2, telefono, email del formulario dado
function validarDatos(form){
    if(!/[A-ZÀ-ÿa-z-,a-z. ']{0,20}/.test(form["nombre"].value))
        return alert("Nombre no es válido.");

    if(!/[A-ZÀ-ÿa-z-,a-z. ']{0,20}/.test(form["apellido1"].value))
        return alert("Apellido1 no es válido.");

    if(!/[A-ZÀ-ÿa-z-,a-z. ']{0,20}/.test(form["apellido2"].value))
        return alert("Apellido2 no es válido.");

    if(!/(6|7)[ -]*([0-9][ -]*){8}$/.test(form["telefono"].value))
        return alert("Telefono no es válido.");
    
    if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form["email"].value))
        return alert("Email no es válido.");
    
    return true;
}