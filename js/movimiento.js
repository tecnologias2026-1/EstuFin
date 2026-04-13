document.addEventListener('DOMContentLoaded', () => {
    const paymentSelect = document.getElementById('payment-method');
    const incomeBtn = document.querySelector('.income');
    const expenseBtn = document.querySelector('.expense');
    const submitBtn = document.querySelector('.submit-btn');
    const transactionType = document.querySelector('.transaction-type');

    // Cargar métodos de pago desde localStorage (estuFinPaymentMethods)
    function loadPaymentMethods() {
        paymentSelect.innerHTML = '<option value="">Selecciona un método</option>';
        let methods = JSON.parse(localStorage.getItem('estuFinPaymentMethods') || '[]');
        if (methods.length > 0) {
            methods.forEach((method, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = method.nombre || method.name;
                paymentSelect.appendChild(option);
            });
            paymentSelect.disabled = false;
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay métodos de pago configurados';
            paymentSelect.appendChild(option);
            paymentSelect.disabled = true;
        }
    }

    // Inicializar métodos de pago al cargar la página
    loadPaymentMethods();


    // Manejar selección de tipo de transacción
    let currentType = 'income';

    function updateTransactionButtons(type) {
        if (type === 'income') {
            incomeBtn.classList.add('active');
            expenseBtn.classList.remove('active');
        } else {
            incomeBtn.classList.remove('active');
            expenseBtn.classList.add('active');
        }
    }

    incomeBtn.addEventListener('click', () => {
        setActiveType('income');
    });

    expenseBtn.addEventListener('click', () => {
        setActiveType('expense');
    });

    function setActiveType(type) {
        currentType = type;
        updateTransactionButtons(type);
        submitBtn.textContent = type === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto';
        submitBtn.classList.toggle('income-btn', type === 'income');
        submitBtn.classList.toggle('expense-btn', type === 'expense');
    }

    // Inicializar con ingreso activo
    setActiveType('income');

    // Manejar envío del formulario
    submitBtn.addEventListener('click', () => {
        // Efecto visual: poner azul el botón mientras está presionado
        submitBtn.classList.add('active');
        setTimeout(() => submitBtn.classList.remove('active'), 200);
        const amountValue = document.getElementById('amount').value;
        const methodIndex = paymentSelect.value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        if (!amountValue || methodIndex === '' || !date || !description) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        // Obtener métodos de pago actualizados
        let methods = JSON.parse(localStorage.getItem('estuFinPaymentMethods') || '[]');
        const amount = parseFloat(amountValue);
        // Asegurarse de que el método tenga la propiedad 'nombre' para compatibilidad
        const selectedMethodRaw = methods[methodIndex];
        const selectedMethod = {
            nombre: selectedMethodRaw.nombre || selectedMethodRaw.name || '',
            tipo: selectedMethodRaw.tipo || selectedMethodRaw.type || '',
            banco: selectedMethodRaw.banco || selectedMethodRaw.bank || '',
            saldo: selectedMethodRaw.saldo || selectedMethodRaw.balance || 0
        };
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
        localStorage.setItem('estuFinPaymentMethods', JSON.stringify(methods));

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