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
                <span class="chip-name">${escapeHtml(m.name)}</span>
                <span class="chip-amount">$${formatCOP(m.amount)}</span>
            `;
            container.appendChild(chip);
        });
    }

    // Actualizar saldo total
    const total = methods.reduce((acc, m) => acc + Number(m.amount), 0);
    document.getElementById('totalBalance').textContent = `$${formatCOP(total)}`;
}

/* ══════════════════════════════════════════════════════════
   RENDERIZAR LISTA DETALLADA (sección "Mis Métodos")
══════════════════════════════════════════════════════════ */
function renderMethodsList() {
    const list    = document.getElementById('methodsList');
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
            <span class="m-name">${escapeHtml(m.name)}</span>
            <span class="m-amount">$${formatCOP(m.amount)} COP</span>
        `;
        list.appendChild(item);
    });
}

/* ══════════════════════════════════════════════════════════
   NOMBRE DE USUARIO
══════════════════════════════════════════════════════════ */
function loadUserName() {
    const user = JSON.parse(localStorage.getItem('estuFinUser')) || {};
    const el   = document.getElementById('userNameDisplay');
    if (el) el.textContent = user.name || user.email || 'Usuario';
}

/* ══════════════════════════════════════════════════════════
   MODAL — AGREGAR MÉTODO DESDE DASHBOARD
══════════════════════════════════════════════════════════ */
function initModal() {
    const modal      = document.getElementById('addMethodModal');
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
    document.getElementById('closeModal') .addEventListener('click', closeModal);
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
   INIT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    loadUserName();
    renderChips();
    renderMethodsList();
    initModal();
});