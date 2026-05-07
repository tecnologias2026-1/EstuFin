// --- MENÚ DESPLEGABLE SOLO EN MÓVIL ---
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('sidebarToggle');
    function isMobile() { return window.innerWidth <= 900; }
    if (sidebar && menuBtn) {
        menuBtn.addEventListener('click', (e) => {
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

    // ── Usuario y clave por usuario ───────────────────────────
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    const sufijoUsuario = (usuarioActual && usuarioActual.email) ? '_' + usuarioActual.email : '';
    const KEY_TRANSACCIONES = 'transacciones' + sufijoUsuario;

    const addButton = document.querySelector('.btn-primary-dash');
    if (addButton) {
        addButton.addEventListener('click', () => {
            window.location.href = 'movimiento.html';
        });
    }

    const closeButton = document.querySelector('.details-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => hideTransactionDetails());
    }

    loadTransactions();

    function loadTransactions() {
        const transactions = JSON.parse(localStorage.getItem(KEY_TRANSACCIONES) || '[]');
        const transactionsList = document.getElementById('transactions-list');
        const totalEl = document.getElementById('total-transactions');

        totalEl.textContent = `${transactions.length} total`;

        if (transactions.length === 0) return;

        transactionsList.innerHTML = '';

        transactions.slice().reverse().forEach((transaction) => {
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
            day: 'numeric', month: 'long', year: 'numeric'
        });
        detailsContainer.innerHTML = `
            <div class="details-card">
                <button class="details-close" aria-label="Cerrar detalles">×</button>
                <div class="details-item"><h4>Tipo</h4><p>${typeLabel}</p></div>
                <div class="details-item">
                    <h4>Monto</h4>
                    <p class="transaction-detail-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toLocaleString('es-CO')}
                    </p>
                </div>
                <div class="details-item"><h4>Fecha</h4><p>${formattedDate}</p></div>
                <div class="details-item"><h4>Método de Pago</h4><p>${transaction.method.nombre}</p></div>
                <div class="details-item"><h4>Descripción</h4><p>${transaction.description}</p></div>
            </div>
        `;
        detailsContainer.querySelector('.details-close').addEventListener('click', () => hideTransactionDetails());
    }

    function hideTransactionDetails() {
        document.getElementById('transaction-details-content').innerHTML = `
            <div class="details-icon">📄</div>
            <p>Selecciona una transacción<br>para ver los detalles</p>
        `;
        document.querySelectorAll('.transaction-item').forEach(el => el.classList.remove('selected'));
    }
});