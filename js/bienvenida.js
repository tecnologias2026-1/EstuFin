// js/bienvenida.js
document.addEventListener('DOMContentLoaded', () => {
    // Cargar métodos guardados
    let paymentMethods = JSON.parse(localStorage.getItem('estuFinPaymentMethods')) || [];

    const form = document.getElementById('paymentForm');
    const nameInput = document.getElementById('paymentName');
    const amountInput = document.getElementById('paymentAmount');
    const methodsContainer = document.getElementById('methodsContainer');
    const goToDashboardBtn = document.getElementById('goToDashboardBtn');

    // Función para renderizar la lista de métodos
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

        // Agregar event listeners a los botones eliminar
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
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // Manejar el envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const amount = parseFloat(amountInput.value);

        // Validaciones
        if (!name) {
            mostrarError('Por favor, ingresa un nombre para el método de pago.');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            mostrarError('Ingresa un monto válido mayor a 0.');
            return;
        }

        // Agregar nuevo método
        paymentMethods.push({
            id: Date.now(),
            name: name,
            amount: amount
        });

        // Limpiar campos
        nameInput.value = '';
        amountInput.value = '';

        // Guardar y actualizar vista
        saveAndRender();

        // Mostrar mensaje de éxito temporal
        const successMsg = document.createElement('div');
        successMsg.className = 'error-message';
        successMsg.style.color = 'green';
        successMsg.textContent = 'Método agregado correctamente.';
        form.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 2000);
    });

    function mostrarError(mensaje) {
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        form.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Botón para ir al dashboard
    goToDashboardBtn.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });

    // Renderizar al cargar
    renderMethods();
});