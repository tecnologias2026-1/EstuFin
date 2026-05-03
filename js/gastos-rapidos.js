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
        const modal = document.getElementById('fixed-expense-modal');
        const closeBtn = document.querySelector('.modal-close');
        const cancelBtn = document.getElementById('modal-cancel');
        const form = document.getElementById('fixed-expense-form');
        const expenseMethodSelect = document.getElementById('expense-method');
        const emptyState = document.getElementById('empty-state');
        const list = document.getElementById('fixed-expenses-list');
        const totalCard = document.getElementById('total-card');
        const totalAmountEl = document.getElementById('total-amount');


        // Función para cargar métodos de pago en el select
        function loadPaymentMethods() {
            expenseMethodSelect.innerHTML = '<option value="">Selecciona un método</option>';
            const methods = JSON.parse(localStorage.getItem('estuFinPaymentMethods') || '[]');
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
            modal.classList.add('active');
        });

        // Abrir modal (botón empty state)
        document.getElementById('add-fixed-expense').addEventListener('click', () => {
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
            const expenses = JSON.parse(localStorage.getItem('gastosRapidos') || '[]');
            list.innerHTML = '';

            if (expenses.length === 0) {
                if (emptyState) emptyState.style.display = 'block';
                if (totalCard) totalCard.style.display = 'none';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';
            if (totalCard) totalCard.style.display = 'none'; // Oculta la barra morada si existe
            if (totalAmountEl) totalAmountEl.textContent = '';

            // Obtener métodos actualizados para mostrar el nombre correcto
            const methods = JSON.parse(localStorage.getItem('estuFinPaymentMethods') || '[]');

            expenses.forEach((expense) => {
                let methodName = 'Sin método';
                if (methods[expense.methodIndex] && methods[expense.methodIndex].name) {
                    methodName = methods[expense.methodIndex].name;
                }
                // Obtener categoría
                let categoria = expense.category || '';
                // Tarjeta visual tipo la imagen adjunta, pero más pequeña y con más espacio entre tarjetas
                const card = document.createElement('div');
                card.className = 'quick-expense-card-custom';
                card.innerHTML = `
                    <div class="quick-expense-card-actions-row">
                        <span></span>
                        <div class="quick-expense-card-actions">
                            <button class="quick-expense-edit-btn" data-id="${expense.id}" title="Editar"><span class="quick-expense-edit-icon">✏️</span></button>
                            <button class="quick-expense-delete-btn" data-id="${expense.id}" title="Eliminar"><span class="quick-expense-delete-icon">🗑️</span></button>
                        </div>
                    </div>
                    <div class="quick-expense-card-content">
                        <p class="quick-expense-card-title">${expense.name}</p>
                        <div class="quick-expense-card-method">${methodName}</div>
                        <div class="quick-expense-card-category">${categoria}</div>
                        <div class="quick-expense-card-amount">$${expense.amount.toLocaleString('es-CO')}</div>
                    </div>
                    <div class="quick-expense-card-footer">
                        <button class="quick-expense-card-btn" data-id="${expense.id}">
                            <span class="quick-expense-card-icon">⚡</span> Registrar
                        </button>
                    </div>
                `;
                list.appendChild(card);

                // Botón registrar movimiento
                card.querySelector('.quick-expense-card-btn').addEventListener('click', () => {
                    // Obtener método de pago
                    const methods = JSON.parse(localStorage.getItem('estuFinPaymentMethods') || '[]');
                    const method = methods[expense.methodIndex] || { name: 'Sin método' };
                    // Crear transacción
                    const transactions = JSON.parse(localStorage.getItem('transacciones') || '[]');
                    transactions.push({
                        type: 'expense',
                        amount: expense.amount,
                        method: { nombre: method.name },
                        date: new Date().toISOString(),
                        description: expense.name,
                        id: Date.now()
                    });
                    localStorage.setItem('transacciones', JSON.stringify(transactions));
                    alert('¡Gasto registrado en el historial!');
                });

                // Botón eliminar
                card.querySelector('.quick-expense-delete-btn').addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    let expenses = JSON.parse(localStorage.getItem('gastosRapidos') || '[]');
                    expenses = expenses.filter(e => e.id !== id);
                    localStorage.setItem('gastosRapidos', JSON.stringify(expenses));
                    renderList();
                });

                // Botón editar: abrir modal y llenar el formulario
                card.querySelector('.quick-expense-edit-btn').addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.dataset.id);
                    const gastosRapidos = JSON.parse(localStorage.getItem('gastosRapidos') || '[]');
                    const gasto = gastosRapidos.find(g => g.id === id);
                    if (gasto) {
                        document.getElementById('expense-name').value = gasto.name;
                        document.getElementById('expense-amount').value = gasto.amount;
                        document.getElementById('expense-category').value = gasto.category;
                        expenseMethodSelect.value = gasto.methodIndex;
                        editingId = gasto.id;
                        modal.classList.add('active');
                    }
                });
            });
        }

        // Estado para saber si estamos editando o creando
        let editingId = null;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('expense-name').value;
            const amount = parseFloat(document.getElementById('expense-amount').value);
            const methodIndex = expenseMethodSelect.value;
            const category = document.getElementById('expense-category') ? document.getElementById('expense-category').value : '';

            if (!name || !amount || methodIndex === '' || !category) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            let gastosRapidos = JSON.parse(localStorage.getItem('gastosRapidos') || '[]');

            if (editingId) {
                // Editar gasto existente
                gastosRapidos = gastosRapidos.map(gasto => {
                    if (gasto.id === editingId) {
                        return {
                            ...gasto,
                            name,
                            amount,
                            methodIndex,
                            category
                        };
                    }
                    return gasto;
                });
                editingId = null;
            } else {
                // Crear nuevo gasto
                const quickExpense = {
                    id: Date.now(),
                    name,
                    amount,
                    methodIndex,
                    category,
                    createdAt: new Date().toISOString()
                };
                gastosRapidos.push(quickExpense);
            }

            localStorage.setItem('gastosRapidos', JSON.stringify(gastosRapidos));
            modal.classList.remove('active');
            form.reset();
            renderList();
        });

        // Cargar al iniciar
        renderList();
    });