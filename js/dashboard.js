// js/dashboard.js
// Clave unificada con bienvenida.js
const STORAGE_KEY = 'estuFinPaymentMethods';

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
function getMethods() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveMethods(methods) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
}

function formatCOP(num) {
    return Number(num).toLocaleString('es-CO');
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
}

/* ══════════════════════════════════════════════════════════
   RENDERIZAR CHIPS (tarjeta azul)
══════════════════════════════════════════════════════════ */
function renderChips() {
    const container = document.getElementById('methodsChips');
    if (!container) return; // Si no estamos en el dashboard, salir

    const methods   = getMethods();
    container.innerHTML = '';

    if (methods.length === 0) {
        container.innerHTML = `
            <span style="opacity:.7; font-size:13px;">
                No tienes métodos de pago aún.
            </span>`;
    } else {
        methods.forEach(m => {
            const chip = document.createElement('div');
            chip.className = 'method-chip';
            chip.innerHTML = `
                <span class="chip-name">${escapeHtml(m.name || m.nombre)}</span>
                <span class="chip-amount">$${formatCOP(m.saldo !== undefined ? m.saldo : (m.amount !== undefined ? m.amount : 0))}</span>
            `;
            container.appendChild(chip);
        });
    }

    // Actualizar saldo total usando saldo si existe, sino amount
    const total = methods.reduce((acc, m) => acc + Number(m.saldo !== undefined ? m.saldo : (m.amount !== undefined ? m.amount : 0)), 0);
    const totalBalance = document.getElementById('totalBalance');
    if (totalBalance) totalBalance.textContent = `$${formatCOP(total)}`;
}

/* ══════════════════════════════════════════════════════════
   RENDERIZAR LISTA DETALLADA (sección "Mis Métodos")
══════════════════════════════════════════════════════════ */
function renderMethodsList() {
    const list    = document.getElementById('methodsList');
    if (!list) return;

    const methods = getMethods();
    list.innerHTML = '';

    if (methods.length === 0) {
        list.innerHTML = `
            <p class="method-list-empty">
                Aún no tienes métodos de pago configurados.
            </p>`;
        return;
    }

    methods.forEach(m => {
        const item = document.createElement('div');
        item.className = 'method-list-item';
        item.innerHTML = `
            <span class="m-name">${escapeHtml(m.name || m.nombre)}</span>
            <span class="m-amount">$${formatCOP(m.amount !== undefined ? m.amount : m.saldo)} COP</span>
        `;
        list.appendChild(item);
    });
}

/* ══════════════════════════════════════════════════════════
   NOMBRE DE USUARIO
══════════════════════════════════════════════════════════ */
function loadUserName() {
    const user = JSON.parse(localStorage.getItem('estuFinCurrentUser')) || JSON.parse(localStorage.getItem('usuarioActual')) || {};
    const el   = document.getElementById('userNameDisplay');
    if (el) el.textContent = user.name || user.nombre || user.email || 'Usuario';
}

/* ══════════════════════════════════════════════════════════
   MODAL — AGREGAR MÉTODO DESDE DASHBOARD
══════════════════════════════════════════════════════════ */
function initModal() {
    const modal      = document.getElementById('addMethodModal');
    if (!modal) return;

    const form       = document.getElementById('modalPaymentForm');
    const nameInput  = document.getElementById('modalMethodName');
    const amtInput   = document.getElementById('modalMethodAmount');
    const errorDiv   = document.getElementById('modalError');

    // Botones que abren el modal
    ['openAddMethodModal', 'openAddMethodModal2'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => openModal());
    });

    // Botones que cierran el modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelModal').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    // Guardar nuevo método
    form.addEventListener('submit', e => {
        e.preventDefault();
        errorDiv.classList.add('hidden');

        const name   = nameInput.value.trim();
        const amount = parseFloat(amtInput.value);

        if (!name) {
            showModalError('Escribe un nombre para el método.');
            return;
        }
        if (isNaN(amount) || amount < 0) {
            showModalError('Ingresa un monto válido (puede ser 0).');
            return;
        }

        const methods = getMethods();
        methods.push({ id: Date.now(), name, amount });
        saveMethods(methods);

        renderChips();
        renderMethodsList();
        closeModal();
    });

    function openModal() {
        nameInput.value  = '';
        amtInput.value   = '';
        errorDiv.classList.add('hidden');
        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    function showModalError(msg) {
        errorDiv.textContent = msg;
        errorDiv.classList.remove('hidden');
    }
}

/* ══════════════════════════════════════════════════════════
   NUEVO: MENÚ HAMBURGUESA PARA CELULARES
══════════════════════════════════════════════════════════ */
function initMobileMenu() {
    const header = document.querySelector('.top-header');
    const sidebar = document.querySelector('.sidebar');
    
    // Si la página tiene un header y un sidebar, aplicamos la magia
    if (header && sidebar) {
        
        // 1. Crear el botón hamburguesa
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = `
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;
        
        // Lo inyectamos al principio de la cabecera (al lado del título)
        const leftDiv = header.querySelector('div:first-child');
        if (leftDiv) {
            leftDiv.style.display = 'flex';
            leftDiv.style.alignItems = 'center';
            leftDiv.insertBefore(menuBtn, leftDiv.firstChild);
        } else {
            header.insertBefore(menuBtn, header.firstChild);
        }

        // 2. Crear el fondo negro semi-transparente
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // 3. Darle funcionalidad al botón para abrir/cerrar
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            // Evitar que la página de fondo haga scroll cuando el menú está abierto
            document.body.style.overflow = 'hidden'; 
        });

        // 4. Cerrar al hacer clic en el fondo negro
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto'; // Devolver el scroll
        });
        
        // Cerrar al hacer clic en un enlace del menú
        const navLinks = sidebar.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }
}

/* ══════════════════════════════════════════════════════════
   INIT GENERAL
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    loadUserName();
    renderChips();
    renderMethodsList();
    initModal();
    initMobileMenu(); // <- Activamos el menú móvil en todas las páginas
});