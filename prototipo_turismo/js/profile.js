document.addEventListener('DOMContentLoaded', async () => {
    auth.checkAuth();
    const user = auth.getUser();
    if (!user) return;

    M.Modal.init(document.querySelectorAll('.modal'));

    // Llenar datos básicos
    document.getElementById('userNameDisplay').textContent = user.name;
    document.getElementById('userEmailDisplay').textContent = user.email;
    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
    M.updateTextFields();

    // Cargar Reservas reales
    loadProfileBookings();

    // Evento: Editar Perfil
    document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updated = { name: document.getElementById('editName').value, email: document.getElementById('editEmail').value };
        try {
            const res = await auth.fetch('/users/' + user.id, { method: 'PUT', body: JSON.stringify(updated) });
            if (res.ok) {
                localStorage.setItem('turiscol_user', JSON.stringify({ ...user, ...updated }));
                M.toast({html: 'Perfil actualizado', classes: 'green'});
                setTimeout(() => location.reload(), 1000);
            }
        } catch (err) { M.toast({html: 'Error al actualizar', classes: 'red'}); }
    });

    // Evento: Cambiar Contraseña
    document.getElementById('changePassForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { 
            currentPassword: document.getElementById('currPass').value, 
            newPassword: document.getElementById('newPass').value 
        };
        try {
            const res = await auth.fetch('/users/' + user.id + '/password', { 
                method: 'PUT', 
                body: JSON.stringify(data) 
            });
            const resData = await res.json();
            if (res.ok) {
                M.toast({html: '¡Contraseña cambiada!', classes: 'green'});
                M.Modal.getInstance(document.getElementById('modalPass')).close();
            } else {
                M.toast({html: resData.message || 'Error', classes: 'red'});
            }
        } catch (err) { M.toast({html: 'Error de conexión', classes: 'red'}); }
    });
});

async function loadProfileBookings() {
    const list = document.getElementById('bookings-list');
    if (!list) return;

    try {
        const res = await auth.fetch('/bookings/my');
        if (res.ok) {
            const items = await res.json();
            if (items.length === 0) {
                list.innerHTML = '<p class="center-align grey-text" style="padding: 20px;">No tienes reservas aún.</p>';
            } else {
                list.innerHTML = '';
                items.reverse().forEach(book => {
                    const date = new Date(book.bookingDate).toLocaleDateString();
                    list.innerHTML += `
                        <div class="collection-item" style="background: #252525; border-bottom: 1px solid #333; margin-bottom: 10px; border-radius: 8px; padding: 15px;">
                            <div class="row" style="margin-bottom: 0; display: flex; align-items: center;">
                                <div class="col s8">
                                    <span class="title white-text" style="font-weight: bold; font-size: 1.1rem;">${book.destinationName}</span>
                                    <p class="grey-text" style="margin: 5px 0;">
                                        <i class="material-icons tiny">event</i> Fecha: ${date}<br>
                                        <span class="teal-text">Plan: ${book.planName}</span><br>
                                        <span class="orange-text">Precio: $${new Intl.NumberFormat('es-CO').format(book.price)}</span>
                                    </p>
                                </div>
                                <div class="col s4 right-align">
                                    <button onclick="deleteBooking(${book.id})" class="btn-floating btn-small red waves-effect waves-light">
                                        <i class="material-icons">delete</i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
        }
    } catch (err) { console.error('Error cargando reservas en perfil:', err); }
}

async function deleteBooking(id) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
    try {
        const res = await auth.fetch(`/bookings/${id}`, { method: 'DELETE' });
        if (res.ok) {
            M.toast({html: 'Reserva cancelada correctamente', classes: 'green'});
            loadProfileBookings();
        } else {
            const data = await res.json();
            M.toast({html: data.message || 'Error al cancelar', classes: 'red'});
        }
    } catch (err) { console.error(err); }
}
