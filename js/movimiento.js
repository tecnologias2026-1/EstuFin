document.addEventListener('DOMContentLoaded', () => {
    const paymentSelect = document.getElementById('payment-method');
    const incomeBtn = document.querySelector('.income');
    const expenseBtn = document.querySelector('.expense');
    const submitBtn = document.querySelector('.submit-btn');
    const transactionType = document.querySelector('.transaction-type');

    // Cargar métodos de pago desde localStorage
    let methods = JSON.parse(localStorage.getItem('metodosPago') || '[]');

    if (methods.length > 0) {
        methods.forEach((method, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${method.nombre}${method.banco ? ' — ' + method.banco : ''} (${method.tipo}) - $${method.saldo.toLocaleString('es-CO')}`;
            paymentSelect.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No hay métodos de pago configurados';
        paymentSelect.appendChild(option);
        paymentSelect.disabled = true;
    }

    // Manejar selección de tipo de transacción
    let currentType = 'income';

    incomeBtn.addEventListener('click', () => {
        setActiveType('income');
    });

    expenseBtn.addEventListener('click', () => {
        setActiveType('expense');
    });

    function setActiveType(type) {
        currentType = type;
        incomeBtn.classList.toggle('active', type === 'income');
        expenseBtn.classList.toggle('active', type === 'expense');
        submitBtn.textContent = type === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto';
        submitBtn.classList.toggle('income-btn', type === 'income');
        submitBtn.classList.toggle('expense-btn', type === 'expense');
    }

    // Inicializar con ingreso activo
    setActiveType('income');

    // Manejar envío del formulario
    submitBtn.addEventListener('click', () => {
        const amountValue = document.getElementById('amount').value;
        const methodIndex = paymentSelect.value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        if (!amountValue || methodIndex === '' || !date || !description) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const amount = parseFloat(amountValue);
        const selectedMethod = methods[methodIndex];
        const transaction = {
            type: currentType,
            amount,
            method: selectedMethod,
            date,
            description,
            id: Date.now()
        };

        // Actualizar saldo del método de pago
        if (currentType === 'income') {
            methods[methodIndex].saldo = (parseFloat(methods[methodIndex].saldo) || 0) + amount;
        } else {
            methods[methodIndex].saldo = (parseFloat(methods[methodIndex].saldo) || 0) - amount;
        }

        localStorage.setItem('metodosPago', JSON.stringify(methods));

        // Guardar transacción en localStorage
        const transactions = JSON.parse(localStorage.getItem('transacciones') || '[]');
        transactions.push(transaction);
        localStorage.setItem('transacciones', JSON.stringify(transactions));

        alert(`${currentType === 'income' ? 'Ingreso' : 'Gasto'} registrado exitosamente!`);

        // Limpiar formulario y recargar métodos visuales
        document.getElementById('amount').value = '';
        document.getElementById('date').value = '';
        document.getElementById('description').value = '';
        paymentSelect.value = '';

        // Recargar select para mostrar el saldo actualizado
        paymentSelect.innerHTML = '';
        methods.forEach((method, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${method.nombre}${method.banco ? ' — ' + method.banco : ''} (${method.tipo}) - $${method.saldo.toLocaleString('es-CO')}`;
            paymentSelect.appendChild(option);
        });

        // Si el usuario vuelve al dashboard, el efecto ya estará visible porque el saldo del método cambió.
    });
});