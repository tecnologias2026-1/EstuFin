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

// --- LÓGICA DE MOVIMIENTOS CON SUPABASE ---
document.addEventListener('DOMContentLoaded', () => {
    const paymentSelect = document.getElementById('payment-method');
    const incomeBtn = document.querySelector('.income');
    const expenseBtn = document.querySelector('.expense');
    const submitBtn = document.querySelector('.submit-btn');
    let currentType = 'income';

    // 1. Cargar los métodos de pago desde Supabase
    async function loadPaymentMethods() {
        paymentSelect.innerHTML = '<option value="">Cargando métodos...</option>';
        paymentSelect.disabled = true;

        // Obtenemos el usuario que inició sesión
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            paymentSelect.innerHTML = '<option value="">Inicia sesión primero</option>';
            return;
        }

        // Buscamos los métodos de pago de este usuario específico
        const { data: metodos, error } = await supabase
            .from('metodos_pago')
            .select('*')
            .eq('usuario_email', user.email);

        if (error) {
            console.error("Error al cargar métodos:", error);
            paymentSelect.innerHTML = '<option value="">Error de conexión</option>';
            return;
        }

        paymentSelect.innerHTML = '<option value="">Selecciona un método</option>';

        // Llenamos el select si encontramos métodos de pago
        if (metodos && metodos.length > 0) {
            metodos.forEach((metodo) => {
                const option = document.createElement('option');
                option.value = metodo.id; // Guardamos el ID para actualizar el saldo luego
                
                // Guardamos datos extra escondidos en la opción para usarlos al guardar el movimiento
                option.dataset.saldo = metodo.saldo;
                option.dataset.nombre = metodo.nombre;
                
                // Lo que ve el usuario (Ej: Nequi (Saldo: $50.000))
                option.textContent = `${metodo.nombre} (Saldo: $${metodo.saldo.toLocaleString('es-CO')})`;
                paymentSelect.appendChild(option);
            });
            paymentSelect.disabled = false;
        } else {
            paymentSelect.innerHTML = '<option value="">No tienes métodos registrados</option>';
            paymentSelect.disabled = true;
        }
    }

    loadPaymentMethods();

    // 2. Control de los botones visuales Ingreso / Gasto
    incomeBtn.addEventListener('click', () => { currentType = 'income'; updateUI(); });
    expenseBtn.addEventListener('click', () => { currentType = 'expense'; updateUI(); });

    function updateUI() {
        incomeBtn.classList.toggle('active', currentType === 'income');
        expenseBtn.classList.toggle('active', currentType === 'expense');
        submitBtn.textContent = currentType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto';
        submitBtn.className = `submit-btn ${currentType === 'income' ? 'income-btn' : 'expense-btn'}`;
    }

    // 3. Guardar el movimiento en la Base de Datos
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // Evita que la página se recargue por defecto

        const amountValue = parseFloat(document.getElementById('amount').value);
        const methodId = paymentSelect.value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        if (!amountValue || methodId === '' || !date || !description) {
            alert('Completa todos los campos.');
            return;
        }

        // Sacamos los datos de la opción que el usuario seleccionó en la lista
        const selectedOption = paymentSelect.options[paymentSelect.selectedIndex];
        const currentSaldo = parseFloat(selectedOption.dataset.saldo);
        const methodName = selectedOption.dataset.nombre;

        // No permitir valores negativos (Gasto > Saldo)
        if (currentType === 'expense' && amountValue > currentSaldo) {
            alert(`¡Fondos insuficientes en ${methodName}! Tu saldo actual es $${currentSaldo.toLocaleString('es-CO')}.`);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando en la nube...';

        const { data: { user } } = await supabase.auth.getUser();
        const nuevoSaldo = currentType === 'income' ? currentSaldo + amountValue : currentSaldo - amountValue;
        const tipoMovimiento = currentType === 'income' ? 'ingreso' : 'gasto';

        try {
            // A. Guardar en la tabla de Movimientos
            const { error: errorMov } = await supabase.from('movimientos').insert([
                {
                    usuario_email: user.email,
                    tipo: tipoMovimiento,
                    monto: amountValue,
                    categoria: 'General',
                    fecha: date,
                    metodo_pago: methodName,
                    descripcion: description
                }
            ]);

            if (errorMov) throw errorMov;

            // B. Actualizar el saldo restante en la tabla de Métodos de Pago
            const { error: errorSaldo } = await supabase
                .from('metodos_pago')
                .update({ saldo: nuevoSaldo })
                .eq('id', methodId);

            if (errorSaldo) throw errorSaldo;

            alert('¡Movimiento registrado con éxito!');
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error("Error al registrar:", error);
            alert("Hubo un error al guardar el movimiento. Revisa la consola.");
            submitBtn.disabled = false;
            submitBtn.textContent = currentType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto';
        }
    });
});