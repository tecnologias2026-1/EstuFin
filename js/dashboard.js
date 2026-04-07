document.addEventListener('DOMContentLoaded', () => {
    const userNameEl = document.querySelector('.user-profile .user-name');
    const amountEl = document.querySelector('.balance-card .amount');
    const balanceBadgeEl = document.querySelector('.balance-badge');

    const userData = JSON.parse(localStorage.getItem('estuFinUser') || 'null');
    const methods = JSON.parse(localStorage.getItem('metodosPago') || '[]');

    if (userData && userNameEl) {
        userNameEl.textContent = userData.name;
    }

    const totalBalance = methods.reduce((sum, item) => {
        return sum + (parseFloat(item.saldo) || 0);
    }, 0);

    if (amountEl) {
        amountEl.textContent = `$${totalBalance.toLocaleString('es-CO')}`;
    }

    if (balanceBadgeEl) {
        balanceBadgeEl.textContent = `💵 Total: $${totalBalance.toLocaleString('es-CO')}`;
    }
});
