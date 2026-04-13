/* ================================================
   js/header.js
   Lee estuFinCurrentUser (clave de auth.js)
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Leer usuario (misma clave que auth.js) ───────────────
    const user    = JSON.parse(localStorage.getItem('estuFinCurrentUser') || '{}');
    const nombre  = user.name  || user.nombre || 'Usuario';
    const email   = user.email || '';
    const inicial = nombre.charAt(0).toUpperCase();

    // ── Buscar el contenedor .user-info ──────────────────────
    const userInfo = document.querySelector('.user-info');
    if (!userInfo) return;

    // ── Inyectar campana + avatar ────────────────────────────
    userInfo.innerHTML = `
        <!-- CAMPANA -->
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
                <div class="notif-header">
                    <span class="notif-title">Notificaciones</span>
                </div>
                <div class="notif-body" id="notifBody"></div>
            </div>
        </div>

        <!-- NOMBRE + AVATAR -->
        <div class="header-avatar-wrap" id="headerAvatarWrap">
            <span class="user-name" id="headerUserName">${nombre}</span>
            <button class="header-avatar-btn" id="headerAvatarBtn" title="Mi cuenta">
                <span class="avatar-inicial">${inicial}</span>
            </button>
            <div class="user-dropdown hidden" id="userDropdown">
                <div class="user-dropdown-info">
                    <div class="user-dropdown-avatar">${inicial}</div>
                    <div>
                        <p class="user-dropdown-nombre">${nombre}</p>
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

    // ── Toggle campana ───────────────────────────────────────
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

    // ── Cerrar sesión ────────────────────────────────────────
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('estuFinCurrentUser');
        window.location.href = 'login.html';
    });

    // ── Notificaciones ───────────────────────────────────────
    const notifs = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    const badge  = document.getElementById('bellBadge');
    const body   = document.getElementById('notifBody');

    if (notifs.length === 0) {
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
            </div>
        `;
    } else {
        badge.textContent = notifs.length;
        badge.classList.remove('hidden');
        body.innerHTML = notifs.map(n => `
            <div class="notif-item">
                <p class="notif-item-texto">${n.texto}</p>
                <span class="notif-item-fecha">${n.fecha || ''}</span>
            </div>
        `).join('');
    }

});


    // Sidebar responsive para móvil
    function checkSidebarToggle() {
        const btn = document.getElementById('sidebarToggle');
        if (!btn) return;
        if (window.innerWidth <= 900) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.remove('open');
        }
    }
    window.addEventListener('resize', checkSidebarToggle);
    window.addEventListener('DOMContentLoaded', checkSidebarToggle);

    if (document.getElementById('sidebarToggle')) {
        document.getElementById('sidebarToggle').addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.toggle('open');
        });
    }
    window.addEventListener('click', function(e) {
        const sidebar = document.querySelector('.sidebar');
        const toggle = document.getElementById('sidebarToggle');
        if (window.innerWidth <= 900 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && e.target !== toggle) {
                sidebar.classList.remove('open');
            }
        }
    });
});

