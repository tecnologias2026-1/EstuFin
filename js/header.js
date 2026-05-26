/* ================================================
   js/header.js
   Inyecta el header interactivo (campana + avatar)
   en TODAS las páginas automáticamente.
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Leer usuario desde localStorage ──────────────────
    // IMPORTANTE: Buscamos ambas claves para asegurar compatibilidad con tu perfil.js
    const userString = localStorage.getItem('estuFinCurrentUser') || localStorage.getItem('usuarioActual') || '{}';
    const user = JSON.parse(userString);
    
    const nombreCompleto = user.nombre || user.name || 'Usuario';
    const primerNombre   = nombreCompleto.split(' ')[0]; // Extrae solo el primer nombre
    const email          = user.email || user.correo || '';
    const inicial        = primerNombre.charAt(0).toUpperCase();

    // ── 2. Buscar el contenedor .user-info del header ────────
    const userInfo = document.querySelector('.user-info');
    if (!userInfo) return; // Si la página no tiene header, salir

    // ── 3. Reemplazar contenido del user-info ────────────────
    userInfo.innerHTML = `
        <!-- CAMPANA -->
        <div class="header-bell-wrap" id="headerBellWrap">
            <button class="header-bell-btn" id="headerBellBtn" title="Notificaciones">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3a7 7 0 00-7 7v3.5L3 16h18l-2-2.5V10a7 7 0 00-7-7z"
                          stroke="currentColor" stroke-width="1.8"
                          stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 19a2 2 0 004 0" stroke="currentColor"
                          stroke-width="1.8" stroke-linecap="round"/>
                </svg>
                <span class="bell-badge hidden" id="bellBadge"></span>
            </button>

            <!-- Dropdown notificaciones -->
            <div class="notif-dropdown hidden" id="notifDropdown">
                <div class="notif-header">
                    <span class="notif-title">Notificaciones</span>
                </div>
                <div class="notif-body" id="notifBody">
                    <div class="notif-empty">
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" opacity="0.3">
                            <path d="M12 3a7 7 0 00-7 7v3.5L3 16h18l-2-2.5V10a7 7 0 00-7-7z"
                                  stroke="#9CA3AF" stroke-width="1.8"
                                  stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 19a2 2 0 004 0" stroke="#9CA3AF"
                                  stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                        <p>No tienes notificaciones</p>
                        <span>Aquí aparecerán tus alertas y recordatorios</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- NOMBRE + AVATAR -->
        <div class="header-avatar-wrap" id="headerAvatarWrap">
            <span class="user-name" id="headerUserName">${primerNombre}</span>
            <button class="header-avatar-btn" id="headerAvatarBtn" title="Mi cuenta">
                <span class="avatar-inicial">${inicial}</span>
            </button>

            <!-- Dropdown usuario -->
            <div class="user-dropdown hidden" id="userDropdown">
                <div class="user-dropdown-info">
                    <div class="user-dropdown-avatar">${inicial}</div>
                    <div>
                        <p class="user-dropdown-nombre">${nombreCompleto}</p>
                        <p class="user-dropdown-email">${email}</p>
                    </div>
                </div>
                <hr class="user-dropdown-hr">
                <a href="perfil.html" class="user-dropdown-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/>
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor"
                              stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                    Mi Perfil
                </a>
                <button class="user-dropdown-item user-dropdown-logout" id="btnLogout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor"
                              stroke-width="1.8" stroke-linecap="round"/>
                        <path d="M10 17l5-5-5-5M15 12H3" stroke="currentColor"
                              stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    `;

    // ── 4. Lógica de dropdowns ───────────────────────────────
    const bellBtn       = document.getElementById('headerBellBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    const avatarBtn     = document.getElementById('headerAvatarBtn');
    const userDropdown  = document.getElementById('userDropdown');
    const btnLogout     = document.getElementById('btnLogout');

    // Toggle campana
    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('hidden');
        userDropdown.classList.add('hidden'); // cierra el otro
    });

    // Toggle avatar
    avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
        notifDropdown.classList.add('hidden'); // cierra el otro
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', () => {
        notifDropdown.classList.add('hidden');
        userDropdown.classList.add('hidden');
    });

    // Cerrar sesión
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('usuarioActual');
        localStorage.removeItem('estuFinCurrentUser'); // Limpia la sesión en ambas variables
        localStorage.removeItem('sesionActiva');
        window.location.href = 'login.html';
    });

    // ── 5. Cargar notificaciones desde localStorage ──────────
    
    // VARIABLES CLAVE PARA MULTIUSUARIO
    const sufijoUsuario = email ? '_' + email : '';
    const KEY_NOTIF = 'notificaciones' + sufijoUsuario;
    const KEY_PAGOS = 'pagosPendientes' + sufijoUsuario;

    // ── 5. Notificaciones desde el backend ──────────────────
    cargarNotificaciones();

    async function cargarNotificaciones() {
        await revisarNotificacionesGlobales();
    }

    async function revisarNotificacionesGlobales() {
        const badge = document.getElementById('bellBadge');
        const body  = document.getElementById('notifBody');

        if (!email) return;

        try {
            const res   = await fetch(`${API_BASE}/proximos_pagos.php?email=${encodeURIComponent(email)}`);
            const pagos = await res.json();

            const notificaciones = [];
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            pagos.forEach(pago => {
                if (pago.estado === 'pendiente') {
                    const fechaPago      = new Date(pago.fecha_vencimiento + 'T00:00:00');
                    const diferenciaDias = Math.ceil((fechaPago - hoy) / (1000 * 3600 * 24));

                    if (diferenciaDias <= 5 && diferenciaDias >= 0) {
                        notificaciones.push({
                            texto: `⏳ "${pago.nombre_pago}" vence en ${diferenciaDias} día(s).`,
                            fecha: new Date().toLocaleDateString('es-CO')
                        });
                    } else if (diferenciaDias < 0) {
                        notificaciones.push({
                            texto: `⚠️ "${pago.nombre_pago}" está VENCIDO.`,
                            fecha: new Date().toLocaleDateString('es-CO')
                        });
                    }
                }
            });

            if (notificaciones.length === 0) {
                badge.classList.add('hidden');
                body.innerHTML = `
                    <div class="notif-empty">
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" opacity="0.3">
                            <path d="M12 3a7 7 0 00-7 7v3.5L3 16h18l-2-2.5V10a7 7 0 00-7-7z"
                                  stroke="#9CA3AF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 19a2 2 0 004 0" stroke="#9CA3AF" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                        <p>No tienes notificaciones</p>
                        <span>Aquí aparecerán tus alertas y recordatorios</span>
                    </div>`;
            } else {
                badge.textContent = notificaciones.length;
                badge.classList.remove('hidden');
                body.innerHTML = notificaciones.map(n => `
                    <div class="notif-item" style="cursor:pointer"
                         onclick="window.location.href='proximos-pagos.html'">
                        <p class="notif-item-texto">${n.texto}</p>
                        <span class="notif-item-fecha">${n.fecha}</span>
                    </div>
                `).join('');
            }

        } catch (e) {
            console.error('Error cargando notificaciones:', e);
        }
    }
});