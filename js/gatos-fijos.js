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
            // Limpiar opciones actuales
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

            const expenses = JSON.parse(localStorage.getItem('gastosFijos') || '[]');
            list.innerHTML = '';

            if (expenses.length === 0) {
                emptyState.style.display = 'block';
                totalCard.style.display = 'none';
                return;
            }

            emptyState.style.display = 'none';
            totalCard.style.display = 'flex';

            // Calcular total
            const total = expenses.reduce((sum, e) => sum + e.amount, 0);
            totalAmountEl.textContent = '$' + total.toLocaleString('es-CO');

            // Obtener métodos actualizados para mostrar el nombre correcto
            const methods = JSON.parse(localStorage.getItem('estuFinPaymentMethods') || '[]');

            // Renderizar cada gasto
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
        }

        // Guardar gasto fijo
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('expense-name').value;
            const amount = parseFloat(document.getElementById('expense-amount').value);
            const methodIndex = expenseMethodSelect.value;

            if (!name || !amount || methodIndex === '') {
                alert('Por favor, completa todos los campos.');
                return;
            }

            const fixedExpense = {
                id: Date.now(),
                name,
                amount,
                methodIndex,
                createdAt: new Date().toISOString()
            };

            const fixedExpenses = JSON.parse(localStorage.getItem('gastosFijos') || '[]');
            fixedExpenses.push(fixedExpense);
            localStorage.setItem('gastosFijos', JSON.stringify(fixedExpenses));

            modal.classList.remove('active');
            form.reset();
            renderList();
        });

        // Cargar al iniciar
        renderList();
    });