/* ================================================
   js/gastos-rapidos.js — Conectado al backend
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    if (!usuarioActual) {
    window.location.href = 'login.html';
    return;
}
    const userEmail = usuarioActual.email;

    const API_RAPIDOS     = `${API_BASE}/gastos_rapidos.php`;
    const API_METODOS     = `${API_BASE}/metodos_pago.php`;
    const API_MOVIMIENTOS = `${API_BASE}/movimientos.php`;

    const modal               = document.getElementById('fixed-expense-modal');
    const closeBtn            = document.querySelector('.modal-close');
    const cancelBtn           = document.getElementById('modal-cancel');
    const form                = document.getElementById('fixed-expense-form');
    const expenseMethodSelect = document.getElementById('expense-method');
    const emptyState          = document.getElementById('empty-state');
    const list                = document.getElementById('fixed-expenses-list');

    // Menú móvil
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('sidebarToggle');
    function isMobile() { return window.innerWidth <= 900; }
    if (sidebar && menuBtn) {
        menuBtn.addEventListener('click', () => { if (isMobile()) sidebar.classList.toggle('active'); });
        document.addEventListener('click', (e) => {
            if (isMobile() && sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) && e.target !== menuBtn)
                sidebar.classList.remove('active');
        });
    }

    let editingId = null;

    // Cargar métodos desde backend
    async function cargarMetodos() {
        try {
            const res     = await fetch(`${API_METODOS}?email=${encodeURIComponent(userEmail)}`);
            const metodos = await res.json();
            expenseMethodSelect.innerHTML = '<option value="">Selecciona un método</option>';
            metodos.forEach(m => {
                const opt       = document.createElement('option');
                opt.value       = m.nombre_metodo;
                opt.textContent = m.nombre_metodo;
                expenseMethodSelect.appendChild(opt);
            });
            return metodos;
        } catch (e) {
            console.error('Error cargando métodos:', e);
            return [];
        }
    }

    async function abrirModal() { await cargarMetodos(); modal.classList.add('active'); }

    const btnTop   = document.getElementById('add-fixed-expense-top');
    const btnEmpty = document.getElementById('add-fixed-expense');
    if (btnTop)   btnTop.addEventListener('click',   abrirModal);
    if (btnEmpty) btnEmpty.addEventListener('click', abrirModal);

    closeBtn.addEventListener('click',  () => { modal.classList.remove('active'); form.reset(); editingId = null; });
    cancelBtn.addEventListener('click', () => { modal.classList.remove('active'); form.reset(); editingId = null; });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { modal.classList.remove('active'); form.reset(); editingId = null; }
    });

    function updateTotal(gastos) {
        const totalEl = document.getElementById('total-amount');
        if (!totalEl) return;
        const total = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
        totalEl.textContent = '$' + total.toLocaleString('es-CO');
    }

    async function renderList() {
        try {
            const res    = await fetch(`${API_RAPIDOS}?email=${encodeURIComponent(userEmail)}`);
            const gastos = await res.json();

            list.innerHTML = '';
            updateTotal(gastos);

            if (gastos.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                return;
            }
            if (emptyState) emptyState.style.display = 'none';

            gastos.forEach(gasto => {
                const card = document.createElement('div');
                card.className = 'quick-expense-card-custom';
                card.innerHTML = `
                    <div class="quick-expense-card-actions-row">
                        <div class="quick-expense-card-actions">
                            <button class="quick-expense-edit-btn"   data-id="${gasto.id}" title="Editar">✏️</button>
                            <button class="quick-expense-delete-btn" data-id="${gasto.id}" title="Eliminar">🗑️</button>
                        </div>
                    </div>
                    <div class="quick-expense-card-content">
                        <p class="quick-expense-card-title">${gasto.nombre}</p>
                        <div class="quick-expense-card-method">${gasto.metodo_pago}</div>
                        <div class="quick-expense-card-category">${gasto.categoria}</div>
                        <div class="quick-expense-card-amount">$${parseFloat(gasto.monto).toLocaleString('es-CO')}</div>
                    </div>
                    <div class="quick-expense-card-footer">
                        <button class="quick-expense-card-btn"
                            data-nombre="${gasto.nombre}"
                            data-monto="${gasto.monto}"
                            data-metodo="${gasto.metodo_pago}"
                            data-categoria="${gasto.categoria}">
                            <span class="quick-expense-card-icon">⚡</span> Registrar
                        </button>
                    </div>
                `;
                list.appendChild(card);

                // ── REGISTRAR → movimiento + descontar saldo ──────────
                card.querySelector('.quick-expense-card-btn').addEventListener('click', async (e) => {
                    const btn      = e.currentTarget;
                    if (btn.disabled) return;
                    btn.disabled   = true;

                    const nombre   = btn.dataset.nombre;
                    const monto    = parseFloat(btn.dataset.monto);
                    const metodo   = btn.dataset.metodo;
                    const categoria = btn.dataset.categoria;

                    try {
                        // 1. Verificar saldo
                        const resM   = await fetch(`${API_METODOS}?email=${encodeURIComponent(userEmail)}`);
                        const metodos = await resM.json();
                        const metodoObj = metodos.find(m => m.nombre_metodo === metodo);

                        if (!metodoObj) {
                            alert('El método de pago ya no existe. Edita el gasto y elige otro.');
                            return;
                        }
                        if (monto > parseFloat(metodoObj.saldo)) {
                            alert(`¡Fondos insuficientes en ${metodo}!\nSaldo: $${parseFloat(metodoObj.saldo).toLocaleString('es-CO')}`);
                            return;
                        }

                        // 2. Crear movimiento en gastos e ingresos
                        await fetch(API_MOVIMIENTOS, {
                            method:  'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                usuario_email: userEmail,
                                tipo:          'gasto',
                                monto:         monto,
                                categoria:     categoria,
                                fecha:         new Date().toISOString().split('T')[0],
                                metodo_pago:   metodo,
                                descripcion:   nombre
                            })
                        });

                        // 3. Descontar saldo
                        await fetch(API_METODOS, {
                            method:  'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id:    metodoObj.id,
                                saldo: Math.max(0, parseFloat(metodoObj.saldo) - monto)
                            })
                        });

                        alert(`✅ $${monto.toLocaleString('es-CO')} registrado desde ${metodo}.\nYa aparece en Gastos e Ingresos.`);

                    } catch (err) {
                        alert('Error al registrar: ' + err.message);
                    } finally {
                        btn.disabled = false;
                    }
                });

                // ── ELIMINAR ──────────────────────────────────────────
                card.querySelector('.quick-expense-delete-btn').addEventListener('click', async () => {
                    if (!confirm(`¿Eliminar "${gasto.nombre}"?`)) return;
                    await fetch(`${API_RAPIDOS}?id=${gasto.id}`, { method: 'DELETE' });
                    await renderList();
                });

                // ── EDITAR ────────────────────────────────────────────
                card.querySelector('.quick-expense-edit-btn').addEventListener('click', async () => {
                    await cargarMetodos();
                    document.getElementById('expense-name').value     = gasto.nombre;
                    document.getElementById('expense-amount').value   = gasto.monto;
                    document.getElementById('expense-category').value = gasto.categoria;
                    expenseMethodSelect.value = gasto.metodo_pago;
                    editingId = gasto.id;
                    modal.classList.add('active');
                });
            });

        } catch (e) {
            console.error('Error cargando gastos rápidos:', e);
        }
    }

    // Guardar (crear o editar)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre    = document.getElementById('expense-name').value.trim();
        const monto     = parseFloat(document.getElementById('expense-amount').value);
        const categoria = document.getElementById('expense-category').value;
        const metodo    = expenseMethodSelect.value;

        if (!nombre || !monto || !metodo || !categoria) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        try {
            if (editingId) {
                await fetch(API_RAPIDOS, {
                    method:  'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingId, nombre, monto, categoria, metodo_pago: metodo })
                });
                editingId = null;
            } else {
                await fetch(API_RAPIDOS, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario_email: userEmail, nombre, monto, categoria, metodo_pago: metodo })
                });
            }
            modal.classList.remove('active');
            form.reset();
            await renderList();
        } catch (err) {
            alert('Error al guardar: ' + err.message);
        }
    });

    await renderList();
});