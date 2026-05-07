/* ================================================
   js/movimiento.js
   Registrar Movimiento — solo localStorage
   ================================================ */

// --- MENÚ DESPLEGABLE SOLO EN MÓVIL ---
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('sidebarToggle');

    function isMobile() { return window.innerWidth <= 900; }

    if (sidebar && menuBtn) {
        menuBtn.addEventListener('click', () => {
            if (isMobile()) sidebar.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (isMobile() && sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) && e.target !== menuBtn) {
                sidebar.classList.remove('active');
            }
        });
    }
});

// --- LÓGICA DE MOVIMIENTOS ---
document.addEventListener('DOMContentLoaded', () => {

    // ── Usuario y claves ──────────────────────────────────────
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    const sufijoUsuario = (usuarioActual && usuarioActual.email) ? '_' + usuarioActual.email : '';
    const STORAGE_KEY_METODOS = 'metodosPago' + sufijoUsuario;
    const STORAGE_KEY_MOV     = 'transacciones'; // clave global de transacciones

    // ── Referencias DOM ───────────────────────────────────────
    const paymentSelect = document.getElementById('metodo_pago');
    const incomeBtn     = document.querySelector('.income');
    const expenseBtn    = document.querySelector('.expense');
    const submitBtn     = document.querySelector('.submit-btn');
    const cancelBtn     = document.querySelector('.cancel-btn');

    let currentType = 'income';

    // ── 1. Cargar métodos de pago ─────────────────────────────
    function loadPaymentMethods() {
        if (!usuarioActual) {
            paymentSelect.innerHTML = '<option value="">Inicia sesión primero</option>';
            paymentSelect.disabled = true;
            return;
        }

        const metodos = JSON.parse(localStorage.getItem(STORAGE_KEY_METODOS)) || [];

        paymentSelect.innerHTML = '<option value="">Selecciona un método</option>';

        if (metodos.length > 0) {
            metodos.forEach((metodo, index) => {
                const option = document.createElement('option');
                option.value             = index;
                option.dataset.saldo     = metodo.amount;
                option.dataset.nombre    = metodo.name;
                option.textContent       = `${metodo.name} (Saldo: $${Number(metodo.amount).toLocaleString('es-CO')})`;
                paymentSelect.appendChild(option);
            });
            paymentSelect.disabled = false;
        } else {
            paymentSelect.innerHTML = '<option value="">No tienes métodos registrados</option>';
            paymentSelect.disabled = true;
        }
    }

    loadPaymentMethods();

    // ── 2. Botones Ingreso / Gasto ────────────────────────────
    incomeBtn.addEventListener('click',  () => { currentType = 'income';  updateUI(); });
    expenseBtn.addEventListener('click', () => { currentType = 'expense'; updateUI(); });

    function updateUI() {
        incomeBtn.classList.toggle('active',  currentType === 'income');
        expenseBtn.classList.toggle('active', currentType === 'expense');
        submitBtn.textContent = currentType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto';
        submitBtn.className   = `submit-btn ${currentType === 'income' ? 'income-btn' : 'expense-btn'}`;
    }

    // Activar estado inicial
    updateUI();

    // ── 3. Cancelar ───────────────────────────────────────────
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    // ── 4. Registrar movimiento ───────────────────────────────
    submitBtn.addEventListener('click', () => {

        const amountValue   = parseFloat(document.getElementById('amount').value);
        const methodIndex   = paymentSelect.value;
        const date          = document.getElementById('date').value;
        const description   = document.getElementById('description').value.trim();

        if (!amountValue || amountValue <= 0 || methodIndex === '' || !date || !description) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }

        const selectedOption = paymentSelect.options[paymentSelect.selectedIndex];
        const currentSaldo   = parseFloat(selectedOption.dataset.saldo);
        const methodName     = selectedOption.dataset.nombre;

        // Validar fondos suficientes en gastos
        if (currentType === 'expense' && amountValue > currentSaldo) {
            alert(`¡Fondos insuficientes en ${methodName}!\nTu saldo actual es $${currentSaldo.toLocaleString('es-CO')}.`);
            return;
        }

        // A. Actualizar saldo del método de pago
        const metodos    = JSON.parse(localStorage.getItem(STORAGE_KEY_METODOS)) || [];
        const nuevoSaldo = currentType === 'income'
            ? currentSaldo + amountValue
            : currentSaldo - amountValue;

        metodos[parseInt(methodIndex)].amount = nuevoSaldo;
        localStorage.setItem(STORAGE_KEY_METODOS, JSON.stringify(metodos));

        // B. Guardar transacción en el historial
        const transacciones = JSON.parse(localStorage.getItem(STORAGE_KEY_MOV)) || [];
        transacciones.push({
            id:          Date.now(),
            type:        currentType,
            amount:      amountValue,
            method:      { nombre: methodName },
            date:        date,
            description: description,
            categoria:   'General'
        });
        localStorage.setItem(STORAGE_KEY_MOV, JSON.stringify(transacciones));

        alert('¡Movimiento registrado con éxito!');
        window.location.href = 'dashboard.html';
    });
});