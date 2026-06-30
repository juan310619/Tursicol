// Gestión de Interfaz Dinámica TurisCol
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    initFormLabels();
});

function initFormLabels() {
    document.querySelectorAll('.input-field input, .input-field textarea, .input-field select').forEach(function(el) {
        const label = el.parentElement.querySelector('label');
        if (!label) return;
        if (el.value) label.classList.add('active');
        el.addEventListener('focus', function(){ label.classList.add('active'); });
        el.addEventListener('blur', function(){ if(!this.value) label.classList.remove('active'); });
        el.addEventListener('change', function(){ if(this.value) label.classList.add('active'); else label.classList.remove('active'); });
    });
}

function updateNavbar() {
    const navWrappers = document.querySelectorAll('.nav-wrapper ul.right, .sidenav');
    const isLoggedIn = auth.isAuthenticated();
    const user = auth.getUser();

    navWrappers.forEach(nav => {
        nav.querySelectorAll('.dynamic-nav').forEach(el => el.remove());

        if (isLoggedIn) {
            let profileHtml = `
                <li class="dynamic-nav ${window.location.pathname.includes('perfil.html') ? 'active' : ''}">
                    <a href="perfil.html"><i class="material-icons left">account_circle</i>${user ? user.name.split(' ')[0] : 'Perfil'}</a>
                </li>`;
            let logoutHtml = `
                <li class="dynamic-nav">
                    <a href="#" onclick="auth.logout()"><i class="material-icons left">logout</i>Salir</a>
                </li>`;
            
            nav.insertAdjacentHTML('beforeend', profileHtml);
            nav.insertAdjacentHTML('beforeend', logoutHtml);

            nav.querySelectorAll('a[href="itinerario.html"], a[href="sugerencias.html"], a[href="perfil.html"]').forEach(a => {
                a.parentElement.style.display = 'block';
            });
        } else {
            let loginHtml = `
                <li class="dynamic-nav ${window.location.pathname.includes('login.html') ? 'active' : ''}">
                    <a href="login.html" class="teal-text text-lighten-4"><i class="material-icons left">login</i>Entrar</a>
                </li>`;
            nav.insertAdjacentHTML('beforeend', loginHtml);

            nav.querySelectorAll('a[href="perfil.html"]').forEach(a => {
                a.parentElement.style.display = 'none';
            });
        }
    });
}

function showAuthMessage(containerId, title = "¡Comienza tu Aventura!", message = "Para utilizar todas las funciones, por favor inicia sesión.") {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="col s12 center-align animated fadeIn auth-message-card" style="padding: 60px 20px; border-radius: 20px; margin-top: 30px;">
            <div style="background: #004d40; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <i class="material-icons large white-text">explore</i>
            </div>
            <h3 class="white-text" style="font-weight: 300;">${title}</h3>
            <p class="grey-text text-lighten-1" style="font-size: 1.2rem; max-width: 600px; margin: 0 auto 40px;">
                ${message}
            </p>
            <div class="row" style="max-width: 500px; margin: 0 auto;">
                <div class="col s12 m6">
                    <a href="login.html" class="btn-large waves-effect waves-light teal darken-1 btn-block" style="width: 100%;">Iniciar Sesión</a>
                </div>
                <div class="col s12 m6">
                    <a href="registro.html" class="btn-large waves-effect waves-light orange darken-3 btn-block" style="width: 100%;">Crear Cuenta</a>
                </div>
            </div>
        </div>
    `;
}
