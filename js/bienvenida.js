// js/bienvenida.js
// CLAVE ÚNICA: 'estuFinPaymentMethods' — usada también en dashboard.js

document.addEventListener('DOMContentLoaded', () => {

    const STORAGE_KEY = 'estuFinPaymentMethods';

    let paymentMethods = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    const form              = document.getElementById('paymentForm');
    const nameInput         = document.getElementById('paymentName');
    const amountInput       = document.getElementById('paymentAmount');
    const methodsContainer  = document.getElementById('methodsContainer');
    const goToDashboardBtn  = document.getElementById('goToDashboardBtn');
    const totalDisplay      = document.getElementById('totalDisplay');
    const totalAmountSpan   = document.getElementById('totalAmount');

    // ── Renderizar lista de métodos ──────────────────────────────
    function renderMethods() {
        methodsContainer.innerHTML = '';

        if (paymentMethods.length === 0) {
            methodsContainer.innerHTML = `
                <p style="text-align:center; color:#A0AEC0; margin:auto; font-size:14px;">
                    Aún no has agregado ningún método.
                </p>`;
            goToDashboardBtn.disabled = true;
            totalDisplay.classList.add('hidden');
            return;
        }

        paymentMethods.forEach((method, index) => {
            const item = document.createElement('div');
            item.className = 'method-card-item';
            item.innerHTML = `
                <div class="method-info-left">
                    <span class="method-name">${escapeHtml(method.name)}</span>
                    <span class="method-amount">$${formatNumber(method.amount)} COP</span>
                </div>
                <button class="delete-btn" data-index="${index}" title="Eliminar">🗑️</button>
            `;
            methodsContainer.appendChild(item);
        });

        // Botones eliminar
        methodsContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                paymentMethods.splice(idx, 1);
                saveAndRender();
            });
        });

        // Total
        const total = paymentMethods.reduce((acc, m) => acc + m.amount, 0);
        totalAmountSpan.textContent = formatNumber(total);
        totalDisplay.classList.remove('hidden');

        // Habilitar botón de continuar
        goToDashboardBtn.disabled = false;
    }

    // ── Guardar en localStorage y re-renderizar ──────────────────
    function saveAndRender() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(paymentMethods));
        renderMethods();
    }

    // ── Agregar método ───────────────────────────────────────────
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name   = nameInput.value.trim();
        const amount = parseFloat(amountInput.value);

        // Validaciones
        if (!name) {
            mostrarError('Por favor escribe un nombre para el método de pago.');
            return;
        }
        if (isNaN(amount) || amount < 0) {
            mostrarError('Ingresa un monto válido (puede ser 0).');
            return;
        }

        paymentMethods.push({
            id:     Date.now(),
            name:   name,
            amount: amount
        });

        nameInput.value   = '';
        amountInput.value = '';
        nameInput.focus();

        saveAndRender();
    });

    // ── Ir al Dashboard ──────────────────────────────────────────
    goToDashboardBtn.addEventListener('click', () => {
        if (paymentMethods.length === 0) return;
        // Marcar que el usuario ya configuró sus métodos
        localStorage.setItem('estuFinSetupDone', 'true');
        window.location.href = 'dashboard.html';
    });

    // ── Helpers ──────────────────────────────────────────────────
    function formatNumber(num) {
        return Number(num).toLocaleString('es-CO');
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;',
            '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function mostrarError(msg) {
        // Quitar errores anteriores
        document.querySelectorAll('.error-message').forEach(e => e.remove());
        const div = document.createElement('div');
        div.className = 'error-message';
        div.textContent = msg;
        form.appendChild(div);
        setTimeout(() => div.remove(), 3500);
    }

    // ── Inicio ───────────────────────────────────────────────────
    renderMethods();
});