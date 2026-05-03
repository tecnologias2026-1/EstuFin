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
// js/movimiento.js
document.addEventListener('DOMContentLoaded', () => {
    const paymentSelect = document.getElementById('payment-method');
    const incomeBtn = document.querySelector('.income');
    const expenseBtn = document.querySelector('.expense');
    const submitBtn = document.querySelector('.submit-btn');
    let currentType = 'income';

    function loadPaymentMethods() {
        paymentSelect.innerHTML = '<option value="">Selecciona un método</option>';
        let methods = JSON.parse(localStorage.getItem('estuFinPaymentMethods') || '[]');
        methods.forEach((method, index) => {
            const option = document.createElement('option');
            option.value = index;
            // Mostramos el saldo actual en el select para que el usuario lo vea
            option.textContent = `${method.name} (Saldo: $${method.amount.toLocaleString('es-CO')})`;
            paymentSelect.appendChild(option);
        });
        paymentSelect.disabled = methods.length === 0;
    }

    loadPaymentMethods();

    incomeBtn.addEventListener('click', () => { currentType = 'income'; updateUI(); });
    expenseBtn.addEventListener('click', () => { currentType = 'expense'; updateUI(); });

    function updateUI() {
        incomeBtn.classList.toggle('active', currentType === 'income');
        expenseBtn.classList.toggle('active', currentType === 'expense');
        submitBtn.textContent = currentType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto';
        submitBtn.className = `submit-btn ${currentType === 'income' ? 'income-btn' : 'expense-btn'}`;
    }

    submitBtn.addEventListener('click', () => {
        const amountValue = parseFloat(document.getElementById('amount').value);
        const methodIndex = paymentSelect.value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        if (!amountValue || methodIndex === '' || !date || !description) {
            alert('Completa todos los campos.');
            return;
        }

        let methods = JSON.parse(localStorage.getItem('estuFinPaymentMethods') || '[]');
        let selectedMethod = methods[methodIndex];

        // SOLUCIÓN PUNTO 4: No permitir valores negativos (Gasto > Saldo)
        if (currentType === 'expense' && amountValue > selectedMethod.amount) {
            alert(`¡Fondos insuficientes en ${selectedMethod.name}! Tu saldo actual es $${selectedMethod.amount.toLocaleString('es-CO')}.`);
            return;
        }

        // Actualizar saldo
        if (currentType === 'income') {
            methods[methodIndex].amount += amountValue;
        } else {
            methods[methodIndex].amount -= amountValue;
        }

        localStorage.setItem('estuFinPaymentMethods', JSON.stringify(methods));

        // Guardar la transacción para el historial
        const transactions = JSON.parse(localStorage.getItem('transacciones') || '[]');
        transactions.push({
            type: currentType,
            amount: amountValue,
            methodName: selectedMethod.name,
            date,
            description,
            id: Date.now()
        });
        localStorage.setItem('transacciones', JSON.stringify(transactions));

        alert('¡Movimiento registrado con éxito!');
        window.location.href = 'dashboard.html'; // Redirigir para ver el saldo actualizado
    });
});