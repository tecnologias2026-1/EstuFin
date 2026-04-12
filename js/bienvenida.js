// js/bienvenida.js
document.addEventListener('DOMContentLoaded', () => {
    // Cargar métodos guardados
    let paymentMethods = JSON.parse(localStorage.getItem('estuFinPaymentMethods')) || [];

    const form = document.getElementById('paymentForm');
    const nameInput = document.getElementById('paymentName');
    const amountInput = document.getElementById('paymentAmount');
    const methodsContainer = document.getElementById('methodsContainer');
    const goToDashboardBtn = document.getElementById('goToDashboardBtn');

    function renderMethods() {
        if (!methodsContainer) return;
        if (paymentMethods.length === 0) {
            methodsContainer.innerHTML = '<p style="text-align:center; color:#777;">No has agregado ningún método aún.</p>';
            return;
        }

        methodsContainer.innerHTML = '';
        paymentMethods.forEach((method, index) => {
            const methodDiv = document.createElement('div');
            methodDiv.className = 'payment-item';
            methodDiv.innerHTML = `
                <div class="payment-info">
                    <span class="payment-name">${escapeHtml(method.name)}</span>
                    <span class="payment-amount">$${formatNumber(method.amount)} COP</span>
                </div>
                <button class="delete-payment" data-index="${index}" title="Eliminar">🗑️</button>
            `;
            methodsContainer.appendChild(methodDiv);
        });

        // Event listeners para eliminar
        document.querySelectorAll('.delete-payment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.getAttribute('data-index'));
                paymentMethods.splice(index, 1);
                saveAndRender();
            });
        });
    }

    function saveAndRender() {
        localStorage.setItem('estuFinPaymentMethods', JSON.stringify(paymentMethods));
        renderMethods();
    }

    function formatNumber(num) {
        return num.toLocaleString('es-CO');
    }

    function escapeHtml(str) {
        return str.replace(/[&<>]/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[m]));
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const amount = parseFloat(amountInput.value);

        if (!name || isNaN(amount) || amount <= 0) {
            mostrarError('Por favor, ingresa un nombre y un monto válido.');
            return;
        }

        paymentMethods.push({
            id: Date.now(),
            name: name,
            amount: amount
        });

        nameInput.value = '';
        amountInput.value = '';
        saveAndRender();
    });

    function mostrarError(mensaje) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        form.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    goToDashboardBtn.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    renderMethods();
});