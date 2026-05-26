/* ================================================
   js/dashboard.js — conectado al backend PHP
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    // ── 1. USUARIO ───────────────────────────────────────────
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    if (!usuarioActual) return;
    const userEmail = usuarioActual.email;

    // ── 2. FORMATO DE MONEDA ─────────────────────────────────
    const formatCurrency = (value) => new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(value);

    // ── 3. CARGAR MÉTODOS DESDE EL BACKEND ──────────────────
    let paymentMethods = [];

    async function cargarMetodos() {
        try {
            const res = await fetch(`${API_BASE}/metodos_pago.php?email=${userEmail}`);
            paymentMethods = await res.json();
            localStorage.setItem('metodosPago_' + userEmail, JSON.stringify(
                paymentMethods.map(m => ({ name: m.nombre_metodo, amount: m.saldo, id: m.id }))
            ));
            renderDashboard();
        } catch (e) {
            console.error('Error cargando métodos:', e);
        }
    }

    // ── 4. RENDERIZAR ────────────────────────────────────────
    const renderDashboard = () => {
        const listContainer = document.getElementById('methodsList');
        const totalDisplay  = document.getElementById('totalBalance');
        if (!listContainer || !totalDisplay) return;

        listContainer.innerHTML = '';
        let currentTotal = 0;

        paymentMethods.forEach((method) => {
            currentTotal += parseFloat(method.saldo);
            const card = document.createElement('div');
            card.className = 'method-card';
            card.innerHTML = `
                <div class="method-info">
                    <h4>${method.nombre_metodo}</h4>
                    <p>${formatCurrency(method.saldo)}</p>
                </div>
                <div class="method-actions">
                    <button class="btn-edit"   onclick="handleEdit(${method.id}, ${method.saldo}, '${method.nombre_metodo}')">Editar</button>
                    <button class="btn-delete" onclick="handleDelete(${method.id})">Eliminar</button>
                </div>
            `;
            listContainer.appendChild(card);
        });

        totalDisplay.innerText = formatCurrency(currentTotal);
    };

    // ── 5. ELIMINAR ──────────────────────────────────────────
    window.handleDelete = async (id) => {
        if (!confirm('¿Deseas eliminar este método?')) return;
        try {
            await fetch(`${API_BASE}/metodos_pago.php?id=${id}`, { method: 'DELETE' });
            await cargarMetodos();
        } catch (e) {
            console.error('Error eliminando:', e);
        }
    };

    // ── 6. EDITAR ────────────────────────────────────────────
    window.handleEdit = async (id, saldoActual, nombre) => {
        const newAmount = prompt(`Nuevo saldo para ${nombre}:`, saldoActual);
        if (newAmount === null || isNaN(newAmount) || newAmount.trim() === '') return;
        try {
            await fetch(`${API_BASE}/metodos_pago.php`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, saldo: parseFloat(newAmount) })
            });
            await cargarMetodos();
        } catch (e) {
            console.error('Error editando:', e);
        }
    };

    // ── 7. AGREGAR MÉTODO ────────────────────────────────────
    const modal    = document.getElementById('addMethodModal');
    const errorMsg = document.getElementById('errorMessage');
    const openBtn  = document.getElementById('openAddModal');
    const closeBtn = document.getElementById('closeModal');
    const addForm  = document.getElementById('addMethodForm');

    if (openBtn) openBtn.onclick = () => {
        modal.classList.remove('hidden');
        errorMsg.classList.add('hidden');
    };
    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');

    if (addForm) {
        addForm.onsubmit = async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('newMethodName').value.trim();
            const saldo  = parseFloat(document.getElementById('newMethodAmount').value);

            const existe = paymentMethods.some(
                m => m.nombre_metodo.toLowerCase() === nombre.toLowerCase()
            );
            if (existe) { errorMsg.classList.remove('hidden'); return; }

            try {
                // 1. Crear el método de pago
                await fetch(`${API_BASE}/metodos_pago.php`, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_email: userEmail, nombre_metodo: nombre, saldo })
                });

                // 2. Registrar saldo inicial como ingreso en Gastos e Ingresos
                if (saldo > 0) {
                    await fetch(`${API_BASE}/movimientos.php`, {
                        method:  'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            usuario_email: userEmail,
                            tipo:          'ingreso',
                            monto:         saldo,
                            categoria:     'Saldo Inicial',
                            fecha:         new Date().toISOString().split('T')[0],
                            metodo_pago:   nombre,
                            descripcion:   `Saldo inicial de ${nombre}`
                        })
                    });
                }

                modal.classList.add('hidden');
                e.target.reset();
                await cargarMetodos();

            } catch (err) {
                console.error('Error guardando:', err);
            }
        };
    }

    // ── 8. INICIALIZAR ───────────────────────────────────────
    await cargarMetodos();
});