document.addEventListener('DOMContentLoaded', () => {
            const addButton = document.querySelector('.btn-primary-dash');
            if (addButton) {
                addButton.addEventListener('click', () => {
                    window.location.href = 'movimiento.html';
                });
            }

            const closeButton = document.querySelector('.details-close');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    hideTransactionDetails();
                });
            }

            // Cargar y mostrar transacciones
            loadTransactions();
        });

        function loadTransactions() {
            const transactions = JSON.parse(localStorage.getItem('transacciones') || '[]');
            const transactionsList = document.getElementById('transactions-list');
            const totalEl = document.getElementById('total-transactions');

            totalEl.textContent = `${transactions.length} total`;

            if (transactions.length === 0) {
                return; // Ya muestra el mensaje vacío
            }

            // Limpiar la lista
            transactionsList.innerHTML = '';

            transactions.forEach((transaction, index) => {
                const item = document.createElement('div');
                item.className = 'transaction-item';
                item.innerHTML = `
                    <div class="transaction-info">
                        <div class="transaction-icon ${transaction.type}">
                            ${transaction.type === 'income' ? '+' : '-'}
                        </div>
                        <div class="transaction-details">
                            <h4>${transaction.description}</h4>
                            <p>${transaction.method.nombre} • ${new Date(transaction.date).toLocaleDateString('es-CO')}</p>
                        </div>
                    </div>
                    <div class="transaction-amount ${transaction.type === 'income' ? 'income' : 'expense'}">
                        ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toLocaleString('es-CO')}
                    </div>
                `;

                item.addEventListener('click', () => {
                    document.querySelectorAll('.transaction-item').forEach(el => el.classList.remove('selected'));
                    item.classList.add('selected');
                    showTransactionDetails(transaction);
                });

                transactionsList.appendChild(item);
            });
        }

        function showTransactionDetails(transaction) {
            const detailsContainer = document.getElementById('transaction-details-content');
            const typeLabel = transaction.type === 'income' ? 'Ingreso' : 'Gasto';
            const formattedDate = new Date(transaction.date).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            detailsContainer.innerHTML = `
                <div class="details-card">
                    <div class="details-item">
                        <h4>Tipo</h4>
                        <p>${typeLabel}</p>
                    </div>
                    <div class="details-item">
                        <h4>Monto</h4>
                        <p class="transaction-detail-amount ${transaction.type}">${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toLocaleString('es-CO')}</p>
                    </div>
                    <div class="details-item">
                        <h4>Fecha</h4>
                        <p>${formattedDate}</p>
                    </div>
                    <div class="details-item">
                        <h4>Método de Pago</h4>
                        <p>${transaction.method.nombre}</p>
                    </div>
                    <div class="details-item">
                        <h4>Descripción</h4>
                        <p>${transaction.description}</p>
                    </div>
                </div>
            `;
        }

        function hideTransactionDetails() {
            document.getElementById('transaction-details-content').innerHTML = `
                <div class="details-icon">📄</div>
                <p>Selecciona una transacción<br>para ver los detalles</p>
            `;
            document.querySelectorAll('.transaction-item').forEach(el => el.classList.remove('selected'));
        }