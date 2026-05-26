/* ================================================
   js/header.js — EstuFin
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. Usuario ───────────────────────────────────────────
    const userString = localStorage.getItem('estuFinCurrentUser') || localStorage.getItem('usuarioActual') || '{}';
    const user = JSON.parse(userString);
    const nombreCompleto = user.nombre || user.name || 'Usuario';
    const primerNombre   = nombreCompleto.split(' ')[0];
    const email          = user.email || user.correo || '';
    const inicial        = primerNombre.charAt(0).toUpperCase();

    // ── 2. Inyectar header ───────────────────────────────────
    const userInfo = document.querySelector('.user-info');
    if (!userInfo) return;

    userInfo.innerHTML = `
        <div class="header-bell-wrap" id="headerBellWrap">
            <button class="header-bell-btn" id="headerBellBtn" title="Notificaciones">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3a7 7 0 00-7 7v3.5L3 16h18l-2-2.5V10a7 7 0 00-7-7z"
                          stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 19a2 2 0 004 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
                <span class="bell-badge hidden" id="bellBadge"></span>
            </button>
            <div class="notif-dropdown hidden" id="notifDropdown">
                <div class="notif-header"><span class="notif-title">Notificaciones</span></div>
                <div class="notif-body" id="notifBody">
                    <div class="notif-empty">
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" opacity="0.3">
                            <path d="M12 3a7 7 0 00-7 7v3.5L3 16h18l-2-2.5V10a7 7 0 00-7-7z"
                                  stroke="#9CA3AF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10 19a2 2 0 004 0" stroke="#9CA3AF" stroke-width="1.8" stroke-linecap="round"/>
                        </svg>
                        <p>No tienes notificaciones</p>
                        <span>Aquí aparecerán tus alertas y recordatorios</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="header-avatar-wrap" id="headerAvatarWrap">
            <span class="user-name" id="headerUserName">${primerNombre}</span>
            <button class="header-avatar-btn" id="headerAvatarBtn" title="Mi cuenta">
                <span class="avatar-inicial">${inicial}</span>
            </button>
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
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                    Mi Perfil
                </a>
                <button class="user-dropdown-item user-dropdown-logout" id="btnLogout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                        <path d="M10 17l5-5-5-5M15 12H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    `;

    // ── 3. Dropdowns header ──────────────────────────────────
    const bellBtn       = document.getElementById('headerBellBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    const avatarBtn     = document.getElementById('headerAvatarBtn');
    const userDropdown  = document.getElementById('userDropdown');
    const btnLogout     = document.getElementById('btnLogout');

    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('hidden');
        userDropdown.classList.add('hidden');
    });
    avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('hidden');
        notifDropdown.classList.add('hidden');
    });
    document.addEventListener('click', () => {
        notifDropdown.classList.add('hidden');
        userDropdown.classList.add('hidden');
    });
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('usuarioActual');
        localStorage.removeItem('estuFinCurrentUser');
        localStorage.removeItem('sesionActiva');
        window.location.href = 'login.html';
    });

    // ── 4. Notificaciones ────────────────────────────────────
    cargarNotificaciones();

    async function cargarNotificaciones() {
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
                        notificaciones.push({ texto: `⏳ "${pago.nombre_pago}" vence en ${diferenciaDias} día(s).`, fecha: new Date().toLocaleDateString('es-CO') });
                    } else if (diferenciaDias < 0) {
                        notificaciones.push({ texto: `⚠️ "${pago.nombre_pago}" está VENCIDO.`, fecha: new Date().toLocaleDateString('es-CO') });
                    }
                }
            });
            if (notificaciones.length === 0) {
                badge.classList.add('hidden');
                body.innerHTML = `<div class="notif-empty"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" opacity="0.3"><path d="M12 3a7 7 0 00-7 7v3.5L3 16h18l-2-2.5V10a7 7 0 00-7-7z" stroke="#9CA3AF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 19a2 2 0 004 0" stroke="#9CA3AF" stroke-width="1.8" stroke-linecap="round"/></svg><p>No tienes notificaciones</p><span>Aquí aparecerán tus alertas y recordatorios</span></div>`;
            } else {
                badge.textContent = notificaciones.length;
                badge.classList.remove('hidden');
                body.innerHTML = notificaciones.map(n => `<div class="notif-item" style="cursor:pointer" onclick="window.location.href='proximos-pagos.html'"><p class="notif-item-texto">${n.texto}</p><span class="notif-item-fecha">${n.fecha}</span></div>`).join('');
            }
        } catch (e) {
            console.error('Error cargando notificaciones:', e);
        }
    }

    // ── 5. SIDEBAR TOGGLE ────────────────────────────────────
    // dashboard.css usa .active para abrir el sidebar
    const sidebarToggle  = document.getElementById('sidebarToggle');
    const sidebar        = document.getElementById('sidebar');
    let   sidebarOverlay = document.getElementById('sidebarOverlay');

    // Crear overlay si no existe en el HTML
    if (sidebar && !sidebarOverlay) {
        sidebarOverlay = document.createElement('div');
        sidebarOverlay.id        = 'sidebarOverlay';
        sidebarOverlay.className = 'sidebar-overlay';
        document.body.insertBefore(sidebarOverlay, document.body.firstChild);
    }

    function abrirSidebar() {
        sidebar.classList.add('sidebar-open');
        if (sidebarOverlay) sidebarOverlay.classList.add('overlay-visible');
        document.body.style.overflow = 'hidden';
    }
    function cerrarSidebar() {
        sidebar.classList.remove('sidebar-open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('overlay-visible');
        document.body.style.overflow = '';
    }

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.contains('sidebar-open') ? cerrarSidebar() : abrirSidebar();
        });
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', cerrarSidebar);
    }
    if (sidebar) {
        sidebar.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => {
                if (sidebar.classList.contains('sidebar-open')) cerrarSidebar();
            });
        });
    }
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) cerrarSidebar();
    });

});