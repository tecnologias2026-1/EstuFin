/* ================================================
   js/perfil.js
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Leer usuario desde localStorage ─────────────────────
    const user = JSON.parse(localStorage.getItem('usuarioActual') || '{}');

    const nombre   = user.nombre   || user.name  || 'Usuario';
    const email    = user.email    || '';
    const password = user.password || user.contraseña || '';
    const fecha    = user.fechaRegistro || user.fecha || new Date().toLocaleDateString('es-CO', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    // ── Llenar hero ──────────────────────────────────────────
    document.getElementById('heroNombre').textContent = nombre;
    document.getElementById('heroEmail').textContent  = email;
    document.getElementById('heroFecha').textContent  = `Miembro desde ${fecha}`;

    // ── Llenar campos ────────────────────────────────────────
    const inputNombre   = document.getElementById('inputNombre');
    const inputEmail    = document.getElementById('inputEmail');
    const inputPassword = document.getElementById('inputPassword');
    const inputFecha    = document.getElementById('inputFecha');

    inputNombre.value   = nombre;
    inputEmail.value    = email;
    inputPassword.value = password || '••••••';
    inputFecha.value    = fecha;

    // ── Ver / ocultar contraseña ─────────────────────────────
    const btnVerPassword = document.getElementById('btnVerPassword');
    let passwordVisible  = false;

    btnVerPassword.addEventListener('click', () => {
        passwordVisible = !passwordVisible;
        inputPassword.type = passwordVisible ? 'text' : 'password';

        // Cambiar ícono
        btnVerPassword.innerHTML = passwordVisible
            ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                 <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                 <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                 <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
               </svg>`
            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                 <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.8"/>
                 <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
               </svg>`;
    });

    // ── Editar perfil ────────────────────────────────────────
    const btnEditar       = document.getElementById('btnEditarPerfil');
    const editActions     = document.getElementById('perfilEditActions');
    const btnCancelar     = document.getElementById('btnCancelarEdit');
    const btnGuardar      = document.getElementById('btnGuardarEdit');

    // Guardar valores originales para cancelar
    let valoresOriginales = { nombre, email, password };

    btnEditar.addEventListener('click', () => {
        // Activar campos editables
        inputNombre.removeAttribute('readonly');
        inputEmail.removeAttribute('readonly');
        inputPassword.removeAttribute('readonly');

        inputNombre.focus();
        editActions.classList.remove('hidden');
        btnEditar.classList.add('hidden');
    });

    btnCancelar.addEventListener('click', () => {
        // Restaurar valores
        inputNombre.value   = valoresOriginales.nombre;
        inputEmail.value    = valoresOriginales.email;
        inputPassword.value = valoresOriginales.password || '••••••';

        desactivarEdicion();
    });

    btnGuardar.addEventListener('click', () => {
        const nuevoNombre   = inputNombre.value.trim();
        const nuevoEmail    = inputEmail.value.trim();
        const nuevoPassword = inputPassword.value.trim();

        if (!nuevoNombre || !nuevoEmail) {
            alert('El nombre y el correo no pueden estar vacíos.');
            return;
        }

        // Actualizar localStorage
        const userActualizado = {
            ...user,
            nombre:   nuevoNombre,
            name:     nuevoNombre,
            email:    nuevoEmail,
            password: nuevoPassword,
            fechaRegistro: fecha
        };
        localStorage.setItem('usuarioActual', JSON.stringify(userActualizado));

        // Actualizar hero
        document.getElementById('heroNombre').textContent = nuevoNombre;
        document.getElementById('heroEmail').textContent  = nuevoEmail;

        // Actualizar valores originales
        valoresOriginales = { nombre: nuevoNombre, email: nuevoEmail, password: nuevoPassword };

        desactivarEdicion();
        alert('¡Perfil actualizado correctamente!');
    });

    function desactivarEdicion() {
        inputNombre.setAttribute('readonly', true);
        inputEmail.setAttribute('readonly', true);
        inputPassword.setAttribute('readonly', true);
        inputPassword.type = 'password';
        passwordVisible = false;

        editActions.classList.add('hidden');
        btnEditar.classList.remove('hidden');
    }
});
