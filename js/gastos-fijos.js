// --- MENÚ DESPLEGABLE SOLO EN MÓVIL ---
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('sidebarToggle');
    function isMobile() {
        return window.innerWidth <= 900;
    }
    if (sidebar && menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            if (isMobile()) {
                sidebar.classList.toggle('active');
            }
        });
        document.addEventListener('click', (e) => {
            if (isMobile() && sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuBtn) {
                sidebar.classList.remove('active');
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {

        // --- Lógica igual a gastos rápidos para métodos de pago por usuario ---
        const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
        const sufijoUsuario = (usuarioActual && usuarioActual.email) ? '_' + usuarioActual.email : '';
        const STORAGE_KEY_METODOS = 'metodosPago' + sufijoUsuario;

        const modal = document.getElementById('fixed-expense-modal');
        const closeBtn = document.querySelector('.modal-close');
        const cancelBtn = document.getElementById('modal-cancel');
        const form = document.getElementById('fixed-expense-form');
        const expenseMethodSelect = document.getElementById('expense-method');
        const emptyState = document.getElementById('empty-state');
        const list = document.getElementById('fixed-expenses-list');
        const totalCard = document.getElementById('total-card');
        const totalAmountEl = document.getElementById('total-amount');

        function loadPaymentMethods() {
            expenseMethodSelect.innerHTML = '<option value="">Selecciona un método</option>';
            const methods = JSON.parse(localStorage.getItem(STORAGE_KEY_METODOS)) || [];
            methods.forEach((method, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = method.name;
                expenseMethodSelect.appendChild(option);
            });
            return methods;
        }

        // Inicializar métodos de pago al cargar la página (opcional, para que el select no esté vacío)
        loadPaymentMethods();

        // Abrir modal (botón header)
        document.getElementById('add-fixed-expense-top').addEventListener('click', () => {
            loadPaymentMethods();
            modal.classList.add('active');
        });

        // Abrir modal (botón empty state)
        document.getElementById('add-fixed-expense').addEventListener('click', () => {
            loadPaymentMethods();
            modal.classList.add('active');
        });

        // Abrir modal (botón header)
        document.getElementById('add-fixed-expense-top').addEventListener('click', () => {
            loadPaymentMethods();
            modal.classList.add('active');
        });

        // Abrir modal (botón empty state)
        document.getElementById('add-fixed-expense').addEventListener('click', () => {
            loadPaymentMethods();
            modal.classList.add('active');
        });

        // Cerrar modal
        closeBtn.addEventListener('click', () => { modal.classList.remove('active'); form.reset(); });
        cancelBtn.addEventListener('click', () => { modal.classList.remove('active'); form.reset(); });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { modal.classList.remove('active'); form.reset(); }
        });

        // Renderizar lista
        function renderList() {
            const expenses = JSON.parse(localStorage.getItem('gastosFijos') || '[]');
            list.innerHTML = '';

            if (expenses.length === 0) {
                emptyState.style.display = 'block';
                totalCard.style.display = 'none';
                return;
            }

            emptyState.style.display = 'none';
            totalCard.style.display = 'flex';

            const total = expenses.reduce((sum, e) => sum + e.amount, 0);
            totalAmountEl.textContent = '$' + total.toLocaleString('es-CO');

            // Obtener métodos actualizados para mostrar el nombre correcto (por usuario)
            const methods = JSON.parse(localStorage.getItem(STORAGE_KEY_METODOS) || '[]');

            expenses.forEach((expense) => {
                let methodName = 'Sin método';
                if (methods[expense.methodIndex] && methods[expense.methodIndex].name) {
                    methodName = methods[expense.methodIndex].name;
                }
                const card = document.createElement('div');
                card.className = 'expense-item-card';
                card.innerHTML = `
                    <div class="expense-info">
                        <p class="expense-name">${expense.name}</p>
                        <p class="expense-method">${methodName}</p>
                    </div>
                    <div class="expense-actions">
                        <span class="expense-amount">$${expense.amount.toLocaleString('es-CO')}</span>
                        <button class="btn-edit" data-id="${expense.id}">✏️</button>
                        <button class="btn-delete" data-id="${expense.id}">🗑️</button>
                    </div>
                `;
                // Elimina cualquier botón '+ Añadir' que pudiera quedar por error
                const addBtn = card.querySelector('.btn-add-fijos-inline');
                if (addBtn) addBtn.remove();
                list.appendChild(card);
            });

            // Botones eliminar
            list.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    let expenses = JSON.parse(localStorage.getItem('gastosFijos') || '[]');
                    expenses = expenses.filter(e => e.id !== id);
                    localStorage.setItem('gastosFijos', JSON.stringify(expenses));
                    renderList();
                });
            });
            // Botones editar
            list.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    const expenses = JSON.parse(localStorage.getItem('gastosFijos') || '[]');
                    const expense = expenses.find(e => e.id === id);
                    if (!expense) return;
                    document.getElementById('expense-name').value = expense.name;
                    document.getElementById('expense-amount').value = expense.amount;
                    expenseMethodSelect.value = expense.methodIndex;
                    form.setAttribute('data-edit-id', id);
                    loadPaymentMethods();
                    modal.classList.add('active');
                });
            });
        }

        // Guardar o editar gasto fijo
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('expense-name').value;
            const amount = parseFloat(document.getElementById('expense-amount').value);
            const methodIndex = expenseMethodSelect.value;

            if (!name || !amount || methodIndex === '') {
                alert('Por favor, completa todos los campos.');
                return;
            }

            const editId = form.getAttribute('data-edit-id');
            let gastosFijos = JSON.parse(localStorage.getItem('gastosFijos') || '[]');

            if (editId) {
                // Editar gasto existente
                gastosFijos = gastosFijos.map(gasto => {
                    if (gasto.id === parseInt(editId)) {
                        return {
                            ...gasto,
                            name,
                            amount,
                            methodIndex
                        };
                    }
                    return gasto;
                });
                form.removeAttribute('data-edit-id');
            } else {
                // Nuevo gasto
                const fixedExpense = {
                    id: Date.now(),
                    name,
                    amount,
                    methodIndex,
                    createdAt: new Date().toISOString()
                };
                gastosFijos.push(fixedExpense);
            }

            localStorage.setItem('gastosFijos', JSON.stringify(gastosFijos));

            modal.classList.remove('active');
            form.reset();
            renderList();
        });

        // Cerrar modal (modificado para limpiar edición)
        closeBtn.addEventListener('click', () => { 
            modal.classList.remove('active'); 
            form.reset(); 
            form.removeAttribute('data-edit-id');
        });
        cancelBtn.addEventListener('click', () => { 
            modal.classList.remove('active'); 
            form.reset(); 
            form.removeAttribute('data-edit-id');
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { 
                modal.classList.remove('active'); 
                form.reset(); 
                form.removeAttribute('data-edit-id');
            }
        });

        // Cargar al iniciar
        renderList();
    });