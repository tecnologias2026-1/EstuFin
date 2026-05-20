document.addEventListener('DOMContentLoaded', () => {
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
});

document.addEventListener('DOMContentLoaded', async () => {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    if (!usuarioActual) return;
    const userEmail = usuarioActual.email;

    const modal             = document.getElementById('fixed-expense-modal');
    const closeBtn          = document.querySelector('.modal-close');
    const cancelBtn         = document.getElementById('modal-cancel');
    const form              = document.getElementById('fixed-expense-form');
    const expenseMethodSelect = document.getElementById('expense-method');
    const emptyState        = document.getElementById('empty-state');
    const list              = document.getElementById('fixed-expenses-list');
    const totalCard         = document.getElementById('total-card');
    const totalAmountEl     = document.getElementById('total-amount');

    // ── Cargar métodos de pago desde BD ──────────────────────
    async function cargarMetodos() {
        try {
            const res     = await fetch(`${API_BASE}/metodos_pago.php?email=${userEmail}`);
            const metodos = await res.json();
            expenseMethodSelect.innerHTML = '<option value="">Selecciona un método</option>';
            metodos.forEach(m => {
                const opt = document.createElement('option');
                opt.value       = m.nombre_metodo;
                opt.textContent = m.nombre_metodo;
                expenseMethodSelect.appendChild(opt);
            });
        } catch (e) {
            console.error('Error cargando métodos:', e);
        }
    }

    // ── Cargar y renderizar gastos fijos desde BD ─────────────
    async function renderList() {
        try {
            const res      = await fetch(`${API_BASE}/gastos_fijos.php?email=${userEmail}`);
            const gastos   = await res.json();

            list.innerHTML = '';

            if (!gastos.length) {
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
                        <button class="btn-delete" data-id="${g.id}">🗑️</button>
                    </div>
                `;
                list.appendChild(card);
            });

            // Eliminar
            list.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    await fetch(`${API_BASE}/gastos_fijos.php?id=${id}`, { method: 'DELETE' });
                    renderList();
                });
            });

        } catch (e) {
            console.error('Error cargando gastos fijos:', e);
        }
    }

    // ── Abrir / cerrar modal ──────────────────────────────────
    function abrirModal() { cargarMetodos(); modal.classList.add('active'); }
    function cerrarModal() { modal.classList.remove('active'); form.reset(); form.removeAttribute('data-edit-id'); }

    document.getElementById('add-fixed-expense-top').addEventListener('click', abrirModal);
    document.getElementById('add-fixed-expense').addEventListener('click', abrirModal);
    closeBtn.addEventListener('click', cerrarModal);
    cancelBtn.addEventListener('click', cerrarModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });

    // ── Guardar gasto fijo ────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre      = document.getElementById('expense-name').value.trim();
        const monto       = parseFloat(document.getElementById('expense-amount').value);
        const metodo_pago = expenseMethodSelect.value;

        if (!nombre || !monto || !metodo_pago) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        await fetch(`${API_BASE}/gastos_fijos.php`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ usuario_email: userEmail, nombre, monto, metodo_pago })
        });

        cerrarModal();
        renderList();
    });

    await cargarMetodos();
    await renderList();
});