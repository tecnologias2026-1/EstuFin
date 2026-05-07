/* ================================================
   js/gastos-rapidos.js — keys por usuario
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

document.addEventListener('DOMContentLoaded', () => {

    // ── Usuario y claves por usuario ──────────────────────────
    const usuarioActual       = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    const sufijoUsuario       = (usuarioActual && usuarioActual.email) ? '_' + usuarioActual.email : '';
    const STORAGE_KEY_METODOS = 'metodosPago'    + sufijoUsuario;
    const KEY_RAPIDOS         = 'gastosRapidos'  + sufijoUsuario;
    const KEY_TRANSACCIONES   = 'transacciones'  + sufijoUsuario;

    const modal               = document.getElementById('fixed-expense-modal');
    const closeBtn            = document.querySelector('.modal-close');
    const cancelBtn           = document.getElementById('modal-cancel');
    const form                = document.getElementById('fixed-expense-form');
    const expenseMethodSelect = document.getElementById('expense-method');
    const emptyState          = document.getElementById('empty-state');
    const list                = document.getElementById('fixed-expenses-list');

    let editingId = null;

    function loadPaymentMethods() {
        expenseMethodSelect.innerHTML = '<option value="">Selecciona un método</option>';
        const methods = JSON.parse(localStorage.getItem(STORAGE_KEY_METODOS)) || [];
        methods.forEach((method, index) => {
            const option = document.createElement('option');
            option.value       = index;
            option.textContent = method.name;
            expenseMethodSelect.appendChild(option);
        });
        return methods;
    }

    loadPaymentMethods();

    const btnTop   = document.getElementById('add-fixed-expense-top');
    const btnEmpty = document.getElementById('add-fixed-expense');
    if (btnTop)   btnTop.addEventListener('click',   () => { loadPaymentMethods(); modal.classList.add('active'); });
    if (btnEmpty) btnEmpty.addEventListener('click', () => { loadPaymentMethods(); modal.classList.add('active'); });

    closeBtn.addEventListener('click',  () => { modal.classList.remove('active'); form.reset(); editingId = null; });
    cancelBtn.addEventListener('click', () => { modal.classList.remove('active'); form.reset(); editingId = null; });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) { modal.classList.remove('active'); form.reset(); editingId = null; }
    });

    function updateTotal() {
        const totalEl = document.getElementById('total-amount');
        if (!totalEl) return;
        const gastos = JSON.parse(localStorage.getItem(KEY_RAPIDOS)) || [];
        const total  = gastos.reduce((sum, g) => sum + (g.amount || 0), 0);
        totalEl.textContent = '$' + total.toLocaleString('es-CO');
    }

    function renderList() {
        const expenses = JSON.parse(localStorage.getItem(KEY_RAPIDOS)) || [];
        list.innerHTML = '';

        if (expenses.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            updateTotal();
            return;
        }
        if (emptyState) emptyState.style.display = 'none';
        updateTotal();

        const methods = JSON.parse(localStorage.getItem(STORAGE_KEY_METODOS)) || [];

        expenses.forEach((expense) => {
            let methodName = 'Sin método';
            if (methods[expense.methodIndex] && methods[expense.methodIndex].name) {
                methodName = methods[expense.methodIndex].name;
            }

            const card = document.createElement('div');
            card.className = 'quick-expense-card-custom';
            card.innerHTML = `
                <div class="quick-expense-card-actions-row">
                    <div class="quick-expense-card-actions">
                        <button class="quick-expense-edit-btn"   data-id="${expense.id}" title="Editar">✏️</button>
                        <button class="quick-expense-delete-btn" data-id="${expense.id}" title="Eliminar">🗑️</button>
                    </div>
                </div>
                <div class="quick-expense-card-content">
                    <p class="quick-expense-card-title">${expense.name}</p>
                    <div class="quick-expense-card-method">${methodName}</div>
                    <div class="quick-expense-card-category">${expense.category || ''}</div>
                    <div class="quick-expense-card-amount">$${expense.amount.toLocaleString('es-CO')}</div>
                </div>
                <div class="quick-expense-card-footer">
                    <button class="quick-expense-card-btn" data-id="${expense.id}">
                        <span class="quick-expense-card-icon">⚡</span> Registrar
                    </button>
                </div>
            `;
            list.appendChild(card);

            // REGISTRAR: descuenta saldo y guarda transacción
            card.querySelector('.quick-expense-card-btn').addEventListener('click', () => {
                const methods = JSON.parse(localStorage.getItem(STORAGE_KEY_METODOS)) || [];
                const idx     = parseInt(expense.methodIndex);
                const method  = methods[idx];

                if (!method) {
                    alert('El método de pago ya no existe. Edita el gasto y elige otro.');
                    return;
                }
                if (expense.amount > method.amount) {
                    alert(`¡Fondos insuficientes en ${method.name}!\nSaldo actual: $${method.amount.toLocaleString('es-CO')}`);
                    return;
                }

                methods[idx].amount -= expense.amount;
                localStorage.setItem(STORAGE_KEY_METODOS, JSON.stringify(methods));

                const transactions = JSON.parse(localStorage.getItem(KEY_TRANSACCIONES)) || [];
                transactions.push({
                    id:          Date.now(),
                    type:        'expense',
                    amount:      expense.amount,
                    method:      { nombre: method.name },
                    date:        new Date().toISOString(),
                    description: expense.name,
                    categoria:   expense.category || 'General'
                });
                localStorage.setItem(KEY_TRANSACCIONES, JSON.stringify(transactions));

                alert(`✅ $${expense.amount.toLocaleString('es-CO')} descontado de ${method.name}.\nNuevo saldo: $${methods[idx].amount.toLocaleString('es-CO')}`);
            });

            // ELIMINAR
            card.querySelector('.quick-expense-delete-btn').addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                let gastos = JSON.parse(localStorage.getItem(KEY_RAPIDOS)) || [];
                gastos = gastos.filter(ex => ex.id !== id);
                localStorage.setItem(KEY_RAPIDOS, JSON.stringify(gastos));
                renderList();
            });

            // EDITAR
            card.querySelector('.quick-expense-edit-btn').addEventListener('click', (e) => {
                const id     = parseInt(e.currentTarget.dataset.id);
                const gastos = JSON.parse(localStorage.getItem(KEY_RAPIDOS)) || [];
                const gasto  = gastos.find(g => g.id === id);
                if (gasto) {
                    document.getElementById('expense-name').value   = gasto.name;
                    document.getElementById('expense-amount').value = gasto.amount;
                    if (document.getElementById('expense-category')) {
                        document.getElementById('expense-category').value = gasto.category || '';
                    }
                    loadPaymentMethods();
                    expenseMethodSelect.value = gasto.methodIndex;
                    editingId = gasto.id;
                    modal.classList.add('active');
                }
            });
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name        = document.getElementById('expense-name').value.trim();
        const amount      = parseFloat(document.getElementById('expense-amount').value);
        const methodIndex = expenseMethodSelect.value;
        const category    = document.getElementById('expense-category')
            ? document.getElementById('expense-category').value : '';

        if (!name || !amount || methodIndex === '' || !category) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        let gastosRapidos = JSON.parse(localStorage.getItem(KEY_RAPIDOS)) || [];

        if (editingId) {
            gastosRapidos = gastosRapidos.map(g =>
                g.id === editingId ? { ...g, name, amount, methodIndex, category } : g
            );
            editingId = null;
        } else {
            gastosRapidos.push({
                id: Date.now(), name, amount, methodIndex, category,
                createdAt: new Date().toISOString()
            });
        }

        localStorage.setItem(KEY_RAPIDOS, JSON.stringify(gastosRapidos));
        modal.classList.remove('active');
        form.reset();
        renderList();
    });

    renderList();
});