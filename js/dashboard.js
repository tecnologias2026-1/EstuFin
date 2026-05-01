// js/dashboard.js
const STORAGE_KEY = 'estuFinPaymentMethods';

function getMethods() { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
function saveMethods(methods) { localStorage.setItem(STORAGE_KEY, JSON.stringify(methods)); }
function formatCOP(num) { return Number(num).toLocaleString('es-CO'); }
function escapeHtml(str) { return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// SOLUCIÓN PUNTO 5: Actualizar saldo total automáticamente
function renderChips() {
    const container = document.getElementById('methodsChips');
    if (!container) return;
    const methods = getMethods();
    container.innerHTML = '';

    if (methods.length === 0) {
        container.innerHTML = `<span style="opacity:.7; font-size:13px;">No tienes métodos de pago aún.</span>`;
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

    const total = methods.reduce((acc, m) => acc + Number(m.amount), 0);
    const totalBalance = document.getElementById('totalBalance');
    if (totalBalance) totalBalance.textContent = `$${formatCOP(total)}`;
}

// SOLUCIÓN PUNTO 2: Permitir editar métodos de pago
function renderMethodsList() {
    const list = document.getElementById('methodsList');
    if (!list) return;
    const methods = getMethods();
    list.innerHTML = '';

    if (methods.length === 0) {
        list.innerHTML = `<p class="method-list-empty">No hay métodos configurados.</p>`;
        return;
    }

    methods.forEach((m, index) => {
        const item = document.createElement('div');
        item.className = 'method-list-item';
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';
        item.innerHTML = `
            <div>
                <span class="m-name" style="font-weight:bold;">${escapeHtml(m.name)}</span>
                <br>
                <span class="m-amount" style="color: #4A5568;">$${formatCOP(m.amount)} COP</span>
            </div>
            <button onclick="editMethodAmount(${index})" style="background:#4C51BF; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-size:12px;">Editar Saldo</button>
        `;
        list.appendChild(item);
    });
}

window.editMethodAmount = function(index) {
    const methods = getMethods();
    const newAmount = prompt(`Editar saldo para ${methods[index].name}:`, methods[index].amount);
    if (newAmount !== null && !isNaN(parseFloat(newAmount)) && parseFloat(newAmount) >= 0) {
        methods[index].amount = parseFloat(newAmount);
        saveMethods(methods);
        renderChips();
        renderMethodsList();
    } else if (newAmount !== null) {
        alert("Por favor ingresa un número válido.");
    }
};

function initModal() {
    const modal = document.getElementById('addMethodModal');
    if (!modal) return;
    const form = document.getElementById('modalPaymentForm');
    const nameInput = document.getElementById('modalMethodName');
    const amtInput = document.getElementById('modalMethodAmount');
    const errorDiv = document.getElementById('modalError');

    ['openAddMethodModal', 'openAddMethodModal2'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => { modal.classList.remove('hidden'); });
    });

    document.getElementById('closeModal').addEventListener('click', () => modal.classList.add('hidden'));
    
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const amount = parseFloat(amtInput.value);

        if (!name || isNaN(amount)) return;
        
        const methods = getMethods();
        // SOLUCIÓN PUNTO 3: Validar duplicados también en el modal
        if (methods.some(m => m.name.toLowerCase() === name.toLowerCase())) {
            errorDiv.textContent = "Este nombre ya existe.";
            errorDiv.classList.remove('hidden');
            return;
        }

        methods.push({ id: Date.now(), name, amount });
        saveMethods(methods);
        renderChips();
        renderMethodsList();
        modal.classList.add('hidden');
    });
}

function loadUserName() {
    const user = JSON.parse(localStorage.getItem('estuFinCurrentUser')) || {};
    const el = document.getElementById('userNameDisplay');
    if (el) el.textContent = user.name || 'Estudiante';
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserName();
    renderChips();
    renderMethodsList();
    initModal();
});