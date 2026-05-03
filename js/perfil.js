// --- MENÚ DESPLEGABLE SOLO EN MÓVIL ---
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('sidebarToggle');
    function isMobile() {
        return window.innerWidth <= 900;
    }
    if (sidebar && menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            if (isMobile()) {
                sidebar.classList.toggle('active');
            }
        });
        document.addEventListener('click', (e) => {
            if (isMobile() && sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuBtn) {
                sidebar.classList.remove('active');
            }
        });
    }
});
/* ================================================
   js/perfil.js
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {

    // ── Leer usuario desde localStorage ──
    let user = JSON.parse(localStorage.getItem('estuFinCurrentUser') || '{}');

    // Cambiado 'const' por 'let' para permitir actualizarlas luego si no se recarga la página
    let nombre   = user.name   || user.nombre || 'Usuario';
    let email    = user.email  || user.correo || '';
    let password = '';
    
    // Bloque try-catch por si la contraseña anterior no estaba en Base64
    try {
        password = user.password ? atob(user.password) : '';
    } catch (e) {
        password = user.password || ''; 
    }

    let fecha    = user.fechaRegistro || new Date().toLocaleDateString('es-CO', {
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
    const btnEditar   = document.getElementById('btnEditarPerfil');
    const editActions = document.getElementById('perfilEditActions');
    const btnCancelar = document.getElementById('btnCancelarEdit');
    const btnGuardar  = document.getElementById('btnGuardarEdit');

    let valoresOriginales = { nombre, email, password };

    btnEditar.addEventListener('click', () => {
        inputNombre.removeAttribute('readonly');
        inputEmail.removeAttribute('readonly');
        inputPassword.removeAttribute('readonly');
        inputNombre.focus();
        editActions.classList.remove('hidden');
        btnEditar.classList.add('hidden');
    });

    btnCancelar.addEventListener('click', () => {
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

        // 1. Actualizar objeto usuario local
        user.name = nuevoNombre;
        user.email = nuevoEmail;
        if(nuevoPassword && nuevoPassword !== '••••••') {
            user.password = btoa(nuevoPassword);
        }
        
        // 2. Guardar CurrentUser actualizado
        localStorage.setItem('estuFinCurrentUser', JSON.stringify(user));

        // 3. Actualizar en el array principal de usuarios
        const usuarios = JSON.parse(localStorage.getItem('estuFinUsers') || '[]');
        // Usamos la variable email que contiene el valor ANTES de este guardado
        const idx = usuarios.findIndex(u => u.email === email || u.correo === email);
        
        if (idx !== -1) {
            usuarios[idx].name = nuevoNombre;
            usuarios[idx].email = nuevoEmail;
            
            // Actualizar posibles propiedades equivalentes para evitar fallos
            if(usuarios[idx].nombre !== undefined) usuarios[idx].nombre = nuevoNombre;
            if(usuarios[idx].correo !== undefined) usuarios[idx].correo = nuevoEmail;

            if (nuevoPassword && nuevoPassword !== '••••••') {
                usuarios[idx].password = btoa(nuevoPassword);
            }
            localStorage.setItem('estuFinUsers', JSON.stringify(usuarios));
        }

        // Actualizamos las variables de control en memoria (Importante para evitar fallos si no se recarga la pag)
        email = nuevoEmail;
        nombre = nuevoNombre;
        valoresOriginales = { nombre: nuevoNombre, email: nuevoEmail, password: nuevoPassword };
        
        // Efectos visuales de confirmación
        document.getElementById('heroNombre').textContent = nuevoNombre;
        document.getElementById('heroEmail').textContent  = nuevoEmail;
        desactivarEdicion();
        
        alert('¡Perfil actualizado correctamente!');

        // 4. Forzar recarga de página para que scripts como header.js obtengan la info actualizada
        window.location.reload();
    });

    function desactivarEdicion() {
        inputNombre.setAttribute('readonly', true);
        inputEmail.setAttribute('readonly', true);
        inputPassword.setAttribute('readonly', true);
        inputPassword.type = 'password';
        passwordVisible = false;
        editActions.classList.add('hidden');
        btnEditar.classList.remove('hidden');
        
        // Restaurar botón ojito
        btnVerPassword.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.8"/>
             <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/>
           </svg>`;
    }
});