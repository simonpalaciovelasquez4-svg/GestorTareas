/*
    js/app.js
    Lógica principal de la aplicación Gestor de Tareas.
    - Lee y escribe tareas en localStorage
    - Maneja creación, edición, eliminación y marcado de completadas
    - Renderiza la tabla de tareas con búsqueda y filtros
*/

// ---------- Referencias a elementos del DOM ----------
const formTarea = document.getElementById("formTarea");
const estudiante = document.getElementById("estudiante");
const materia = document.getElementById("materia");
const titulo = document.getElementById("titulo");
const descripcion = document.getElementById("descripcion");
const fecha = document.getElementById("fecha");
const idTarea = document.getElementById("idTarea");
const buscar = document.getElementById("buscar");
const filtroEstado = document.getElementById("filtroEstado");
const tablaTareas = document.getElementById("tablaTareas");

// Estado de la aplicación: array de tareas (persistido en localStorage)
let tareas = JSON.parse(localStorage.getItem("tareas")) || [];


// ---------- Manejo del envío del formulario ----------
// Si `idTarea` está vacío: crea una nueva tarea. Si contiene id: actualiza.
function manejarEnvioTarea(e){
    e.preventDefault();

    // Obtener y normalizar valores del formulario
    const datoEstudiante = estudiante.value.trim();
    const datoMateria = materia.value.trim();
    const datoTitulo = titulo.value.trim();
    const datoDescripcion = descripcion.value.trim();
    const datoFecha = fecha.value;

    // Validación básica: todos los campos son obligatorios
    if(!datoEstudiante || !datoMateria || !datoTitulo || !datoDescripcion || !datoFecha){
        alert("Complete todos los campos.");
        return;
    }

    if(idTarea.value){
        // Editar tarea existente: reemplaza los campos de la tarea con el mismo id
        tareas = tareas.map(t => {
            if(t.id == idTarea.value){
                return {
                    ...t,
                    estudiante: datoEstudiante,
                    materia: datoMateria,
                    titulo: datoTitulo,
                    descripcion: datoDescripcion,
                    fecha: datoFecha
                };
            }
            return t;
        });
    } else {
        // Crear nueva tarea con id basado en timestamp
        const nuevaTarea = {
            id: String(Date.now()),
            estudiante: datoEstudiante,
            materia: datoMateria,
            titulo: datoTitulo,
            descripcion: datoDescripcion,
            fecha: datoFecha,
            completada: false
        };
        tareas.push(nuevaTarea);
    }

    // Persistir cambios y limpiar formulario
    localStorage.setItem("tareas", JSON.stringify(tareas));
    formTarea.reset();
    idTarea.value = "";
    mostrarTareas();
    window.scrollTo({ top: 0, behavior: "smooth" });
}


// ---------- Renderizado de la lista de tareas ----------
// Aplica búsqueda y filtro por estado antes de renderizar
function mostrarTareas(){
    const textoBusqueda = buscar.value.trim().toLowerCase();
    const estadoFiltro = filtroEstado.value;

    // Vaciar tabla antes de re-renderizar
    tablaTareas.innerHTML = "";

    // Filtrar por texto y estado
    const tareasFiltradas = tareas.filter(t => {
        const coincideBusqueda = t.estudiante.toLowerCase().includes(textoBusqueda) ||
            t.titulo.toLowerCase().includes(textoBusqueda) ||
            t.materia.toLowerCase().includes(textoBusqueda);

        const coincideEstado =
            estadoFiltro === "todas" ? true : estadoFiltro === "pendientes" ? !t.completada : t.completada;

        return coincideBusqueda && coincideEstado;
    });

    // Si no hay tareas que mostrar, mostrar fila vacía informativa
    if(tareasFiltradas.length === 0){
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 7;
        td.textContent = "No hay tareas para mostrar.";
        tr.appendChild(td);
        tablaTareas.appendChild(tr);
        actualizarContadores();
        return;
    }

    // Construir filas para cada tarea filtrada
    tareasFiltradas.forEach(t => {
        const tr = document.createElement("tr");

        // Añadir clase visual si la tarea está completada
        const claseCompletada = t.completada ? "completada" : "";

        // Rellenar contenido de la fila con columnas y botones de acción
        tr.innerHTML = `
            <td class="${claseCompletada}">${t.estudiante}</td>
            <td class="${claseCompletada}">${t.materia}</td>
            <td class="${claseCompletada}">${t.titulo}</td>
            <td class="${claseCompletada}">${t.descripcion}</td>
            <td class="${claseCompletada}">${t.fecha}</td>
            <td>
                <span class="badge ${t.completada ? 'bg-success' : 'bg-warning text-dark'}">
                    ${t.completada ? 'Completada' : 'Pendiente'}
                </span>
            </td>
            <td class="acciones">
                <button class="btn btn-sm btn-outline-success" onclick="completarTarea('${t.id}')">
                    <i class="bi bi-check2-circle"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary" onclick="editarTarea('${t.id}')">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarTarea('${t.id}')">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        `;

        // Resaltar fila si la fecha de entrega ya pasó y la tarea no está completada
        const hoy = new Date().toISOString().slice(0,10);
        if(!t.completada && t.fecha < hoy){
            tr.classList.add('vencida');
        }

        tablaTareas.appendChild(tr);
    });

    // Actualiza los contadores visibles
    actualizarContadores();
}

// ==========================
// EDITAR TAREA
// ==========================

function editarTarea(id){

    const tarea = tareas.find(t => t.id == id);

    estudiante.value = tarea.estudiante;
    materia.value = tarea.materia;
    titulo.value = tarea.titulo;
    descripcion.value = tarea.descripcion;
    fecha.value = tarea.fecha;

    idTarea.value = tarea.id;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// ==========================
// ELIMINAR TAREA
// ==========================

function eliminarTarea(id){

    const confirmar = confirm("¿Desea eliminar esta tarea?");

    if(!confirmar){
        return;
    }

    tareas = tareas.filter(t => t.id != id);

    localStorage.setItem("tareas", JSON.stringify(tareas));

    mostrarTareas();

}

// ==========================
// COMPLETAR TAREA
// ==========================

function completarTarea(id){

    tareas = tareas.map(t => {

        if(t.id == id){

            t.completada = !t.completada;

        }

        return t;

    });

    localStorage.setItem("tareas", JSON.stringify(tareas));

    mostrarTareas();

}

// ==========================
// CONTADORES
// ==========================

function actualizarContadores(){

    document.getElementById("totalTareas").textContent = tareas.length;

    document.getElementById("pendientes").textContent =
        tareas.filter(t => !t.completada).length;

    document.getElementById("completadas").textContent =
        tareas.filter(t => t.completada).length;

}

// Eventos
formTarea.addEventListener('submit', manejarEnvioTarea);
buscar.addEventListener('input', mostrarTareas);
filtroEstado.addEventListener('change', mostrarTareas);

// Mostrar al cargar
mostrarTareas();