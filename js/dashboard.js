// js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos del usuario actual
    const currentUser = JSON.parse(localStorage.getItem('estuFinCurrentUser'));
    const userNameSpan = document.getElementById('userNameDisplay');
    if (currentUser && currentUser.name) {
        userNameSpan.textContent = currentUser.name.split(' ')[0]; // Muestra solo el primer nombre
    } else {
        userNameSpan.textContent = 'Invitado';
    }

    // Cargar métodos de pago
    let paymentMethods = JSON.parse(localStorage.getItem('estuFinPaymentMethods')) || [];

    const totalBalanceSpan = document.getElementById('totalBalance');
    const totalMethodsBadge = document.getElementById('totalMethodsBadge');
    const methodsContainer = document.getElementById('paymentMethodsList');
    const addMoreBtn = document.getElementById('addMoreMethodsBtn');

    function formatCurrency(amount) {
        return '$' + amount.toLocaleString('es-CO') + ' COP';
    }

    function updateBalance() {
        const total = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
        totalBalanceSpan.textContent = formatCurrency(total);
        totalMethodsBadge.innerHTML = `💵 Total métodos: ${formatCurrency(total)}`;
    }

    function renderPaymentMethods() {
        if (!methodsContainer) return;
        if (paymentMethods.length === 0) {
            methodsContainer.innerHTML = '<div class="empty-methods">📭 No has agregado ningún método de pago. Ve a Bienvenida para agregar.</div>';
            updateBalance();
            return;
        }

        methodsContainer.innerHTML = '';
        paymentMethods.forEach(method => {
            const card = document.createElement('div');
            card.className = 'payment-method-card';
            card.innerHTML = `
                <div class="payment-method-info">
                    <span class="method-name">${escapeHtml(method.name)}</span>
                    <span class="method-amount">${formatCurrency(method.amount)}</span>
                </div>
                <!-- Aquí podrías agregar un botón para editar/eliminar si quieres -->
            `;
            methodsContainer.appendChild(card);
        });
        updateBalance();
    }

    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // Botón para ir a bienvenida y agregar más métodos
    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', () => {
            window.location.href = 'bienvenida.html';
        });
    }

    // También si el usuario hace clic en "Agregar pago" de la sección de próximos pagos,
    // lo redirigimos a bienvenida (opcional)
    const addPagoBtn = document.querySelector('.empty-state .btn-outline');
    if (addPagoBtn) {
        addPagoBtn.addEventListener('click', () => {
            window.location.href = 'bienvenida.html';
        });
    }

    // Inicializar
    renderPaymentMethods();

    // Escuchar cambios en localStorage (por si se actualiza desde otra pestaña)
    window.addEventListener('storage', (event) => {
        if (event.key === 'estuFinPaymentMethods') {
            paymentMethods = JSON.parse(event.newValue) || [];
            renderPaymentMethods();
        }
    });
});