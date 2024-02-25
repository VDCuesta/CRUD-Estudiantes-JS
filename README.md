# CRUD Estudiantes
La aplicación muestra un listado de estudiantes traídos de una base de datos no relacional de Firebase.

### Funcionalidad de la aplicación

En la aplicación se muestran los datos de los estudiantes en una tabla.

El usuario puede dar de alta nuevos estudiantes, editar los datos de estudiantes existentes y eliminarlos.

## Bloques 

### Base de conexión con Firebase
Hace uso de la configuración de Firebase dada en el proyecto. Sin modifiaciones ya que entendí que había que añadir al código en lugar de crear y configurar el nuestro propio.

## Bloques añadidos
Se hace uso de una constante global que contiene el formulario de edición del alumno
```javascript
const editForm = document.getElementById("edit-form");
```
### Eventos y actualización de la vista

#### Eventos

Añade evento submit al formulario de edición. Cuando ocurre, comprueba que los datos son válidos llamando a `validarDatos(form)` y en caso de serlo llama a `editarAlumno()`.

```javascript
//Se añade evento submit al formulario de edición,
//si son correctos los datos, edita al Alumno en FireBase
editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if(validarDatos(editForm))
        editarAlumno();
});
```

#### Actualización de la vista

Se hace uso de `onValue` para refrescar la tabla de alumnos cuando haya un cambio en la base de datos.

```javascript
//Refresca y actualiza la tabla
onValue(ref(db, "Students"), alumnos => {
    actualizarTabla(alumnos)
})
```

`actualizarTabla(alumnos)` borra el contenido del tbody y añade al dom un una fila por cada alumno.

```javascript
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
```
### Funciones comunes

#### Creación de los botones

Esta función recibe tres parámetros:
- Clase de Bootstrap del color del botón deseado
- Clase de FontAwesome del icono deseado
- Función manejadora del evento click del botón.

La función crea el elemento botón con las clases de Bootstrap proporcionada y le añade como hijo un elemento icono con la clase de FontAwesome dada y las clases de Bootstrap `aria-hidden true`.

Después de crear el botón le añade un evento click que llama a la función dada por parámetro.

```javascript
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
```

#### Creación de filas de la tabla

Esta función se encarga de crear una fila haciendo uso de siguientes atributos del objeto dado:
- nombre
- ape1
- ape2
- telef
- email
- id
- desc

La función crea un elemento tr del que cuelga elementos td que contienen las propiedades del objeto.

Además añade dos botones a otro tr haciendo uso de `crearBoton(tipoBoton, tipoIcono, funcionManejadora)`:
- Uno cuya función será editar el alumno, que contiene en la función manejadora los datos de este.
- Uno de eliminar que llama a `eliminarAlumno(id)` proporcionando la id de este.

Al botón encargado de la edición añade las clases de Bootstrap necesarias para abrir el modal que contiene el formulario de edición.

Una vez finalizada la creación de la fila la devuelve.

```javascript
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
```

### Funciones de eliminación y edición de estudiantes

#### Eliminar alumno

Función asíncrona que elimina al alumno correspondiente a la id proporcionada de la base de datos.

```javascript
//Elimina el alumno de la BBDD
async function eliminarAlumno(id) {
    remove(ref(db, "Students/" + id))
}
```

#### Editar alumno

Función asíncrona que recibe los campos de el formulario de edición y edita los datos del alumno correspondiente en la base de datos.

```javascript
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
```

#### Validar datos

Función que recibe un formulario, valida los datos introducidos y devuelve `true` en caso de ser correctos.

```javascript
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
```
