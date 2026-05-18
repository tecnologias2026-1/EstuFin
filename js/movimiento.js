/* ================================================
   js/movimiento.js — conectado al backend PHP
   ================================================ */


document.addEventListener('DOMContentLoaded', async () => {

    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    if (!usuarioActual) return;
    const userEmail = usuarioActual.email;

    const paymentSelect = document.getElementById('metodo_pago');
    const incomeBtn     = document.querySelector('.income');
    const expenseBtn    = document.querySelector('.expense');
    const submitBtn     = document.querySelector('.submit-btn');
    const cancelBtn     = document.querySelector('.cancel-btn');

    let currentType = 'income';
    let metodos = [];

    // ── Cargar métodos de pago desde backend ─────────────────
    async function cargarMetodos() {
        try {
            const res = await fetch(`${API_BASE}/metodos_pago.php?email=${userEmail}`);
            metodos = await res.json();

            paymentSelect.innerHTML = '<option value="">Selecciona un método</option>';

            if (metodos.length > 0) {
                metodos.forEach(m => {
                    const option = document.createElement('option');
                    option.value          = m.id;
                    option.dataset.saldo  = m.saldo;
                    option.dataset.nombre = m.nombre_metodo;
                    option.textContent    = `${m.nombre_metodo} (Saldo: $${Number(m.saldo).toLocaleString('es-CO')})`;
                    paymentSelect.appendChild(option);
                });
                paymentSelect.disabled = false;
            } else {
                paymentSelect.innerHTML = '<option value="">No tienes métodos registrados</option>';
                paymentSelect.disabled = true;
            }
        } catch (e) {
            console.error('Error cargando métodos:', e);
        }
    }

    await cargarMetodos();

    // ── Botones Ingreso / Gasto ───────────────────────────────
    incomeBtn.addEventListener('click',  () => { currentType = 'income';  updateUI(); });
    expenseBtn.addEventListener('click', () => { currentType = 'expense'; updateUI(); });

    function updateUI() {
        incomeBtn.classList.toggle('active',  currentType === 'income');
        expenseBtn.classList.toggle('active', currentType === 'expense');
        submitBtn.textContent = currentType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto';
        submitBtn.className   = `submit-btn ${currentType === 'income' ? 'income-btn' : 'expense-btn'}`;
    }
    updateUI();

    if (cancelBtn) cancelBtn.addEventListener('click', () => window.location.href = 'dashboard.html');

    // ── Registrar movimiento ──────────────────────────────────
    submitBtn.addEventListener('click', async () => {
        const monto       = parseFloat(document.getElementById('amount').value);
        const metodoPagoId = paymentSelect.value;
        const fecha       = document.getElementById('date').value;
        const descripcion = document.getElementById('description').value.trim();

        if (!monto || monto <= 0 || !metodoPagoId || !fecha || !descripcion) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }

        const selectedOption = paymentSelect.options[paymentSelect.selectedIndex];
        const saldoActual    = parseFloat(selectedOption.dataset.saldo);
        const nombreMetodo   = selectedOption.dataset.nombre;

        if (currentType === 'expense' && monto > saldoActual) {
            alert(`¡Fondos insuficientes en ${nombreMetodo}!\nSaldo actual: $${saldoActual.toLocaleString('es-CO')}`);
            return;
        }

        try {
            // A. Guardar movimiento
            await fetch(`${API_BASE}/movimientos.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_email: userEmail,
                    tipo:          currentType === 'income' ? 'ingreso' : 'gasto',
                    monto,
                    categoria:     'General',
                    fecha,
                    metodo_pago:   nombreMetodo,
                    descripcion
                })
            });

            // B. Actualizar saldo del método de pago
            const nuevoSaldo = currentType === 'income'
                ? saldoActual + monto
                : saldoActual - monto;

            await fetch(`${API_BASE}/metodos_pago.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: parseInt(metodoPagoId), saldo: nuevoSaldo })
            });

            alert('¡Movimiento registrado con éxito!');
            window.location.href = 'dashboard.html';

        } catch (e) {
            console.error('Error registrando movimiento:', e);
            alert('Hubo un error al registrar el movimiento.');
        }
    });
});