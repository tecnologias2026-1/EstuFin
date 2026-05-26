/* ================================================
   js/gastos-fijos.js — Conectado al backend
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    if (!usuarioActual) return;
    const userEmail = usuarioActual.email;

    const API_FIJOS       = `${API_BASE}/gastos_fijos.php`;
    const API_METODOS     = `${API_BASE}/metodos_pago.php`;
    const API_MOVIMIENTOS = `${API_BASE}/movimientos.php`;

    const modal               = document.getElementById('fixed-expense-modal');
    const closeBtn            = document.querySelector('.modal-close');
    const cancelBtn           = document.getElementById('modal-cancel');
    const form                = document.getElementById('fixed-expense-form');
    const expenseMethodSelect = document.getElementById('expense-method');
    const emptyState          = document.getElementById('empty-state');
    const list                = document.getElementById('fixed-expenses-list');
    const totalCard           = document.getElementById('total-card');
    const totalAmountEl       = document.getElementById('total-amount');

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

    // ── Cargar métodos desde backend ──────────────────────────
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
        } catch (e) {
            console.error('Error cargando métodos:', e);
        }
    }

    // ── Abrir / cerrar modal ──────────────────────────────────
    async function abrirModal() {
        await cargarMetodos();
        modal.classList.add('active');
    }

    const btnTop   = document.getElementById('add-fixed-expense-top');
    const btnEmpty = document.getElementById('add-fixed-expense');
    if (btnTop)   btnTop.addEventListener('click',   abrirModal);
    if (btnEmpty) btnEmpty.addEventListener('click', abrirModal);

    closeBtn.addEventListener('click',  () => { modal.classList.remove('active'); form.reset(); });
    cancelBtn.addEventListener('click', () => { modal.classList.remove('active'); form.reset(); });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { modal.classList.remove('active'); form.reset(); }
    });

    // ── Renderizar lista desde backend ────────────────────────
    async function renderList() {
        try {
            const res    = await fetch(`${API_FIJOS}?email=${encodeURIComponent(userEmail)}`);
            const gastos = await res.json();

            list.innerHTML = '';

            if (gastos.length === 0) {
                emptyState.style.display = 'block';
                totalCard.style.display  = 'none';
                return;
            }

            emptyState.style.display = 'none';
            totalCard.style.display  = 'flex';

            const total = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
            totalAmountEl.textContent = '$' + total.toLocaleString('es-CO');

            gastos.forEach(g => {
                const card = document.createElement('div');
                card.className = 'expense-item-card';
                card.innerHTML = `
                    <div class="expense-info">
                        <p class="expense-name">${g.nombre}</p>
                        <p class="expense-method">${g.metodo_pago}</p>
                    </div>
                    <div class="expense-actions">
                        <span class="expense-amount">$${Number(g.monto).toLocaleString('es-CO')}</span>
                        <button class="btn-pagar-fijo" 
                            data-id="${g.id}"
                            data-nombre="${g.nombre}"
                            data-monto="${g.monto}"
                            data-metodo="${g.metodo_pago}">✅ Pagar</button>
                        <button class="btn-delete" data-id="${g.id}">🗑️</button>
                    </div>
                `;
                list.appendChild(card);
            });

            // ── Evento ELIMINAR ───────────────────────────────
            list.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('¿Eliminar este gasto fijo?')) return;
                    await fetch(`${API_FIJOS}?id=${btn.dataset.id}`, { method: 'DELETE' });
                    await renderList();
                });
            });

            // ── Evento PAGAR → crea movimiento ────────────────
            list.querySelectorAll('.btn-pagar-fijo').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const nombre = btn.dataset.nombre;
                    const monto  = parseFloat(btn.dataset.monto);
                    const metodo = btn.dataset.metodo;

                    if (!confirm(`¿Registrar pago de "${nombre}" por $${monto.toLocaleString('es-CO')}?`)) return;

                    btn.disabled = true;
                    try {
                        // 1. Buscar el método y verificar saldo
                        const resM      = await fetch(`${API_METODOS}?email=${encodeURIComponent(userEmail)}`);
                        const metodos   = await resM.json();
                        const metodoObj = metodos.find(m => m.nombre_metodo === metodo);

                        if (!metodoObj) {
                            alert('El método de pago no existe en tu cuenta.');
                            return;
                        }
                        if (monto > parseFloat(metodoObj.saldo)) {
                            alert(`¡Fondos insuficientes en ${metodo}!\nSaldo: $${parseFloat(metodoObj.saldo).toLocaleString('es-CO')}`);
                            return;
                        }

                        // 2. Descontar saldo del método
                        await fetch(API_METODOS, {
                            method:  'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id:    metodoObj.id,
                                saldo: Math.max(0, parseFloat(metodoObj.saldo) - monto)
                            })
                        });

                        // 3. Crear movimiento en Gastos e Ingresos
                        await fetch(API_MOVIMIENTOS, {
                            method:  'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                usuario_email: userEmail,
                                tipo:          'gasto',
                                monto:         monto,
                                categoria:     'Gastos Fijos',
                                fecha:         new Date().toISOString().split('T')[0],
                                metodo_pago:   metodo,
                                descripcion:   nombre
                            })
                        });

                        alert(`✅ Pago de "${nombre}" registrado.\nYa aparece en Gastos e Ingresos.`);

                    } catch (err) {
                        alert('Error al registrar pago: ' + err.message);
                    } finally {
                        btn.disabled = false;
                    }
                });
            });

        } catch (e) {
            console.error('Error cargando gastos fijos:', e);
        }
    }

    // ── Guardar nuevo gasto fijo ──────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('expense-name').value.trim();
        const monto  = parseFloat(document.getElementById('expense-amount').value);
        const metodo = expenseMethodSelect.value;

        if (!nombre || !monto || !metodo) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        try {
            await fetch(API_FIJOS, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_email: userEmail,
                    nombre,
                    monto,
                    metodo_pago: metodo
                })
            });
            modal.classList.remove('active');
            form.reset();
            await renderList();
        } catch (err) {
            alert('Error al guardar: ' + err.message);
        }
    });

    await renderList();
});