// js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar Usuario
    const currentUser = JSON.parse(localStorage.getItem('estuFinCurrentUser'));
    const userNameSpan = document.getElementById('userNameDisplay');
    userNameSpan.textContent = currentUser ? currentUser.name.split(' ')[0] : 'Invitado';

    // 2. Cargar Métodos de Pago
    let paymentMethods = JSON.parse(localStorage.getItem('estuFinPaymentMethods')) || [];

    const totalBalanceSpan = document.getElementById('totalBalance');
    const totalMethodsBadge = document.getElementById('totalMethodsBadge');
    const methodsContainer = document.getElementById('paymentMethodsList');

    function formatCurrency(amount) {
        return '$' + amount.toLocaleString('es-CO');
    }

    function updateBalance() {
        const total = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
        // Solo ponemos el número, el "COP" ya está en el HTML
        totalBalanceSpan.textContent = formatCurrency(total);
        totalMethodsBadge.innerHTML = `💵 Total métodos: ${formatCurrency(total)} COP`;
    }

    function renderPaymentMethods() {
        if (!methodsContainer) return;
        
        if (paymentMethods.length === 0) {
            methodsContainer.innerHTML = '<div class="empty-methods">📭 No hay métodos. Ve a Bienvenida.</div>';
            updateBalance();
            return;
        }

        methodsContainer.innerHTML = '';
        paymentMethods.forEach(method => {
            const card = document.createElement('div');
            card.className = 'payment-method-card';
            card.innerHTML = `
                <div class="payment-method-info">
                    <span class="method-name">${method.name}</span>
                    <span class="method-amount">${formatCurrency(method.amount)} COP</span>
                </div>
            `;
            methodsContainer.appendChild(card);
        });
        updateBalance();
    }

    // Botones de navegación
    document.getElementById('addMoreMethodsBtn')?.addEventListener('click', () => {
        window.location.href = 'bienvenida.html';
    });

    // Inicializar
    renderPaymentMethods();
});