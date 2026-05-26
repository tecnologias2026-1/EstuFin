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

document.addEventListener('DOMContentLoaded', async () => {

    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
  if (!usuarioActual) {
    window.location.href = 'login.html';
    return;
}
    const userEmail = usuarioActual.email;

    const addButton = document.querySelector('.btn-primary-dash');
    if (addButton) addButton.addEventListener('click', () => window.location.href = 'movimiento.html');

    const closeButton = document.querySelector('.details-close');
    if (closeButton) closeButton.addEventListener('click', () => hideTransactionDetails());

    // ── Cargar movimientos desde backend ─────────────────────
    async function loadTransactions() {
        try {
            const res = await fetch(`${API_BASE}/movimientos.php?email=${userEmail}`);
            const transactions = await res.json();

            const transactionsList = document.getElementById('transactions-list');
            const totalEl = document.getElementById('total-transactions');

            totalEl.textContent = `${transactions.length} total`;
            if (transactions.length === 0) return;

            transactionsList.innerHTML = '';

            transactions.forEach((t) => {
                const item = document.createElement('div');
                item.className = 'transaction-item';
                item.innerHTML = `
                    <div class="transaction-info">
                        <div class="transaction-icon ${t.tipo === 'ingreso' ? 'income' : 'expense'}">
                            ${t.tipo === 'ingreso' ? '+' : '-'}
                        </div>
                        <div class="transaction-details">
                            <h4>${t.descripcion}</h4>
                            <p>${t.metodo_pago} • ${new Date(t.fecha).toLocaleDateString('es-CO')}</p>
                        </div>
                    </div>
                    <div class="transaction-amount ${t.tipo === 'ingreso' ? 'income' : 'expense'}">
                        ${t.tipo === 'ingreso' ? '+' : '-'}$${Number(t.monto).toLocaleString('es-CO')}
                    </div>
                `;
                item.addEventListener('click', () => {
                    document.querySelectorAll('.transaction-item').forEach(el => el.classList.remove('selected'));
                    item.classList.add('selected');
                    showTransactionDetails(t);
                });
                transactionsList.appendChild(item);
            });
        } catch (e) {
            console.error('Error cargando movimientos:', e);
        }
    }

    function showTransactionDetails(t) {
        const detailsContainer = document.getElementById('transaction-details-content');
        const typeLabel = t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto';
        const formattedDate = new Date(t.fecha).toLocaleDateString('es-CO', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
        detailsContainer.innerHTML = `
            <div class="details-card">
                <button class="details-close" aria-label="Cerrar detalles">×</button>
                <div class="details-item"><h4>Tipo</h4><p>${typeLabel}</p></div>
                <div class="details-item">
                    <h4>Monto</h4>
                    <p class="transaction-detail-amount ${t.tipo}">
                        ${t.tipo === 'ingreso' ? '+' : '-'}$${Number(t.monto).toLocaleString('es-CO')}
                    </p>
                </div>
                <div class="details-item"><h4>Fecha</h4><p>${formattedDate}</p></div>
                <div class="details-item"><h4>Método de Pago</h4><p>${t.metodo_pago}</p></div>
                <div class="details-item"><h4>Descripción</h4><p>${t.descripcion}</p></div>
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

    await loadTransactions();
});