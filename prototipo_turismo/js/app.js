document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    if (typeof M !== 'undefined') {
        M.AutoInit();
        M.updateTextFields();
    }
    if (document.getElementById('destinos-container')) fetchDestinos();
    if (document.getElementById('itinerarios-list')) loadItineraries();
    if (document.getElementById('muro-sugerencias')) loadSuggestionsMuro();

    const itinForm = document.getElementById('itinerario-form');
    if (itinForm) itinForm.addEventListener('submit', handleItinerarySubmit);

    const suggForm = document.getElementById('sugerencia-form');
    if (suggForm) suggForm.addEventListener('submit', handleSuggestionSubmit);
}


const getDestinoImage = (name) => {
    const imageMap = {
        "Antioquia": "antioquia.png",
        "Atlántico": "atlantico.jpg",
        "Bolívar": "bolivar.png",
        "Cesar": "cesar.jpg",
        "Magdalena": "magdalena.png"
    };
    const file = imageMap[name] || "default.png";
    return `prototipo_turismo/img/${file}`;
};

const DEPARTAMENTOS = [
    { id: 1, name: "Amazonas" },
    { id: 2, name: "Antioquia" },
    { id: 3, name: "Arauca" },
    { id: 4, name: "Atlántico" },
    { id: 5, name: "Bolívar" },
    { id: 12, name: "Cesar" },
    { id: 13, name: "Chocó" },
    { id: 20, name: "Magdalena" },
    { id: 21, name: "Meta" }
];

function fetchDestinos() {
    const container = document.getElementById('destinos-container');
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
    if (!container) return;

    container.innerHTML = '';
    DEPARTAMENTOS.forEach(dept => {
        const img = getDestinoImage(dept.name);
        container.innerHTML += `
            <div class="col s12 m6 l4">
                <div class="card hoverable z-depth-3" style="background: #1e1e1e; border-radius: 12px; margin-bottom: 30px;">
                    <div class="card-image">
                        <img src="${img}" alt="${dept.name}" style="height: 250px; object-fit: cover; border-radius: 12px 12px 0 0;" 
                             onerror="this.src='prototipo_turismo/img/default.png'">
                        <span class="card-title" style="background: rgba(0,0,0,0.6); width: 100%; font-weight: bold; padding: 15px !important;">${dept.name}</span>
                    </div>
                    <div class="card-action" style="border-top: none; padding: 15px;">
                        <button onclick="openDestinoModal(${dept.id}, '${dept.name}')" 
                                class="btn orange darken-3 waves-effect waves-light" 
                                style="width: 100%; border-radius: 8px; font-weight: bold;">
                            <i class="material-icons left">explore</i> VER DETALLES
                        </button>
                    </div>
                </div>
            </div>`;
    });
}

function openDestinoModal(id, name) {
    const config = typeof TOURISM_CONFIG !== 'undefined' ? TOURISM_CONFIG.plans[name] || TOURISM_CONFIG.defaultPlan : {};
    let modal = document.getElementById('modal-destino');
    if (!modal) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="modal-destino" class="modal modal-fixed-footer grey darken-4">
                <div class="modal-content white-text" id="modal-content-body"></div>
                <div class="modal-footer grey darken-4">
                    <a href="#!" class="modal-close btn-flat white-text">Cerrar</a>
                    <button id="btn-reservar-modal" class="btn orange darken-3">Reservar Ahora</button>
                </div>
            </div>`);
        modal = document.getElementById('modal-destino');
        M.Modal.init(modal);
    }
    document.getElementById('modal-content-body').innerHTML = `
        <h4>${name}</h4>
        <div class="divider"></div>
        <p class="grey-text text-lighten-2" style="margin-top: 15px;">${config.details}</p>
        <div class="card teal darken-4 white-text" style="padding: 15px; border-radius: 10px;">
            <p style="font-size: 1.1rem;">Plan: ${config.featured_plan}</p>
            <h5 class="orange-text">$${new Intl.NumberFormat('es-CO').format(config.price)} COP</h5>
        </div>`;
    document.getElementById('btn-reservar-modal').onclick = () => handleBooking(name, config.featured_plan, config.price);
    M.Modal.getInstance(modal).open();
}

async function handleBooking(dest, plan, price) {
    if (!auth.isAuthenticated()) return M.toast({ html: 'Inicia sesión' });
    try {
        const res = await auth.fetch('/bookings', { method: 'POST', body: JSON.stringify({ destinationName: dest, planName: plan, price: price }) });
        if (res.ok) { M.toast({ html: '¡Reserva exitosa!', classes: 'green' }); M.Modal.getInstance(document.getElementById('modal-destino')).close(); }
    } catch (err) { M.toast({ html: 'Error de red' }); }
}

async function handleItinerarySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('itinerary-id').value;
    const data = {
        destino: document.getElementById('destino-select').value,
        fecha_ida: document.getElementById('fecha-ida').value,
        fecha_vuelta: document.getElementById('fecha-vuelta').value || "NR",
        num_viajeros: parseInt(document.getElementById('num-viajeros').value) || 1,
        presupuesto_estimado: parseFloat(document.getElementById('presupuesto').value) || 0,
        tipo_viaje: document.getElementById('tipo-viaje').value,
        observaciones: document.getElementById('observaciones').value
    };
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/itineraries/${id}` : '/itineraries';
        const res = await auth.fetch(url, { method, body: JSON.stringify(data) });
        if (res.ok) {
            M.toast({ html: id ? '¡Itinerario Actualizado!' : '¡Itinerario Guardado!', classes: 'green' });
            resetItineraryForm();
            loadItineraries();
        }
    } catch (err) { console.error(err); }
}

function prepareEditItinerary(it) {
    document.getElementById('itinerary-id').value = it.id;
    document.getElementById('destino-select').value = it.destino;
    document.getElementById('fecha-ida').value = it.fecha_ida;
    document.getElementById('fecha-vuelta').value = it.fecha_vuelta;
    document.getElementById('num-viajeros').value = it.num_viajeros;
    document.getElementById('presupuesto').value = it.presupuesto_estimado;
    document.getElementById('tipo-viaje').value = it.tipo_viaje;
    document.getElementById('observaciones').value = it.observaciones;

    // UI update
    document.getElementById('btn-save-itinerary').innerHTML = 'Actualizar Itinerario <i class="material-icons right">edit</i>';
    document.getElementById('btn-cancel-edit').style.display = 'block';

    // Re-initialize Materialize selects and inputs
    M.FormSelect.init(document.querySelectorAll('select'));
    M.updateTextFields();
    M.textareaAutoResize(document.getElementById('observaciones'));

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetItineraryForm() {
    const form = document.getElementById('itinerario-form');
    if (form) form.reset();
    document.getElementById('itinerary-id').value = '';
    document.getElementById('btn-save-itinerary').innerHTML = 'Guardar Mi Itinerario <i class="material-icons right">save</i>';
    document.getElementById('btn-cancel-edit').style.display = 'none';
    M.FormSelect.init(document.querySelectorAll('select'));
    M.updateTextFields();
}

async function deleteItinerary(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este plan?')) return;
    try {
        const res = await auth.fetch(`/itineraries/${id}`, { method: 'DELETE' });
        if (res.ok) {
            M.toast({ html: 'Itinerario eliminado', classes: 'grey darken-3' });
            loadItineraries();
        }
    } catch (err) { console.error(err); }
}

async function loadItineraries() {
    const list = document.getElementById('itinerarios-list');
    if (!list || !auth.isAuthenticated()) return;
    try {
        const res = await auth.fetch('/itineraries/my');
        if (res.ok) {
            const items = await res.json();
            list.innerHTML = items.length === 0 ? '<p class="center grey-text">No hay planes favoritos aún.</p>' : '';
            items.reverse().forEach(it => {
                list.innerHTML += `
                    <div class="col s12 m6">
                        <div class="card grey darken-3 white-text" style="border-radius: 10px;">
                            <div class="card-content">
                                <span class="card-title orange-text" style="font-weight: bold;">${it.destino}</span>
                                <p><strong>Presupuesto:</strong> $${new Intl.NumberFormat('es-CO').format(it.presupuesto_estimado)}</p>
                                <p><strong>Fecha:</strong> ${it.fecha_ida} - ${it.fecha_vuelta}</p>
                                <p class="grey-text text-lighten-1">${it.observaciones || ''}</p>
                            </div>
                            <div class="card-action" style="border-top: 1px solid rgba(255,255,255,0.1);">
                                <button onclick="prepareEditItinerary(${JSON.stringify(it).replace(/"/g, '&quot;')})" class="btn-flat white-text waves-effect"><i class="material-icons left">edit</i>Editar</button>
                                <button onclick="deleteItinerary(${it.id})" class="btn-flat red-text waves-effect"><i class="material-icons left">delete</i>Borrar</button>
                            </div>
                        </div>
                    </div>`;
            });

        }
    } catch (e) { console.error(e); }
}

async function loadSuggestionsMuro() {
    const muro = document.getElementById('muro-sugerencias');
    if (!muro) return;
    const user = auth.getUser();
    const isAdmin = user && user.role === 'admin';

    try {
        const res = await auth.fetch('/suggestions');
        if (res.ok) {
            const items = await res.json();
            muro.innerHTML = '';
            items.reverse().forEach(s => {
                let adminButtons = '';
                if (isAdmin) {
                    adminButtons = `
                    <div class="card-action" style="background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.1);">
                        <button onclick="prepareEditSuggestion(${JSON.stringify(s).replace(/"/g, '&quot;')})" class="btn-small teal waves-effect waves-light" style="border-radius: 4px; margin-right: 10px;">
                            <i class="material-icons left">edit</i>Editar
                        </button>
                        <button onclick="deleteSuggestion('${s._id}')" class="btn-small red waves-effect waves-light" style="border-radius: 4px;">
                            <i class="material-icons left">delete</i>Borrar
                        </button>
                    </div>`;
                }

                muro.innerHTML += `
                <div class="col s12 m6">
                    <div class="card grey darken-4 white-text z-depth-2" style="border-radius: 8px; overflow: hidden;">
                        <div class="card-content">
                            <span class="card-title orange-text" style="font-size: 1.2rem; font-weight: bold;">${s.nombre_lugar}</span>
                            <p class="teal-text text-lighten-2" style="font-size: 0.9rem; margin-bottom: 10px;">
                                <i class="material-icons tiny left">location_on</i> ${s.ubicacion}
                            </p>
                            <p class="grey-text text-lighten-2">${s.descripcion}</p>
                        </div>
                        ${adminButtons}
                    </div>
                </div>`;
            });
        }
    } catch (err) { console.error(err); }
}

async function handleSuggestionSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('sugerencia-id').value;
    const data = {
        nombre_lugar: document.getElementById('nombre_lugar').value,
        ubicacion: document.getElementById('ubicacion').value,
        descripcion: document.getElementById('descripcion').value
    };

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/suggestions/${id}` : '/suggestions';
        const res = await auth.fetch(url, { method, body: JSON.stringify(data) });
        if (res.ok) {
            M.toast({ html: id ? '¡Sugerencia Actualizada!' : '¡Sugerencia recibida!' });
            resetSugerenciaForm();
            loadSuggestionsMuro();
        }
    } catch (err) { console.error(err); }
}

function prepareEditSuggestion(s) {
    document.getElementById('sugerencia-id').value = s._id;
    document.getElementById('nombre_lugar').value = s.nombre_lugar;
    document.getElementById('ubicacion').value = s.ubicacion;
    document.getElementById('descripcion').value = s.descripcion;

    document.getElementById('btn-save-sugerencia').innerHTML = 'Actualizar Sugerencia <i class="material-icons right">edit</i>';
    document.getElementById('btn-cancel-sugg').style.display = 'block';

    M.updateTextFields();
    M.textareaAutoResize(document.getElementById('descripcion'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetSugerenciaForm() {
    const form = document.getElementById('sugerencia-form');
    if (form) form.reset();
    document.getElementById('sugerencia-id').value = '';
    document.getElementById('btn-save-sugerencia').innerHTML = 'Enviar Sugerencia <i class="material-icons right">send</i>';
    document.getElementById('btn-cancel-sugg').style.display = 'none';
    M.updateTextFields();
}

async function deleteSuggestion(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta sugerencia?')) return;
    try {
        const res = await auth.fetch(`/suggestions/${id}`, { method: 'DELETE' });
        if (res.ok) {
            M.toast({ html: 'Sugerencia eliminada', classes: 'green' });
            loadSuggestionsMuro();
        } else {
            const data = await res.json();
            M.toast({ html: data.message || 'Error al eliminar', classes: 'red' });
        }
    } catch (err) { console.error(err); }
}
