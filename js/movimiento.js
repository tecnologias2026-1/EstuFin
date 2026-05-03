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

        try {
            // Obtenemos el usuario que inició sesión usando "db"
            const { data: { user } } = await db.auth.getUser();

            if (!user) {
                paymentSelect.innerHTML = '<option value="">Inicia sesión primero</option>';
                return;
            }

            // Buscamos los métodos de pago de este usuario específico usando "db"
            const { data: metodos, error } = await db
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
                    option.value = metodo.id; 
                    
                    option.dataset.saldo = metodo.saldo;
                    option.dataset.nombre = metodo.nombre;
                    
                    option.textContent = `${metodo.nombre} (Saldo: $${metodo.saldo.toLocaleString('es-CO')})`;
                    paymentSelect.appendChild(option);
                });
                paymentSelect.disabled = false;
            } else {
                paymentSelect.innerHTML = '<option value="">No tienes métodos registrados</option>';
                paymentSelect.disabled = true;
            }
        } catch (err) {
            console.error("Error fatal en loadPaymentMethods:", err);
            paymentSelect.innerHTML = '<option value="">Error de sistema</option>';
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
        e.preventDefault(); 

        const amountValue = parseFloat(document.getElementById('amount').value);
        const methodId = paymentSelect.value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        if (!amountValue || methodId === '' || !date || !description) {
            alert('Completa todos los campos.');
            return;
        }

        const selectedOption = paymentSelect.options[paymentSelect.selectedIndex];
        const currentSaldo = parseFloat(selectedOption.dataset.saldo);
        const methodName = selectedOption.dataset.nombre;

        if (currentType === 'expense' && amountValue > currentSaldo) {
            alert(`¡Fondos insuficientes en ${methodName}! Tu saldo actual es $${currentSaldo.toLocaleString('es-CO')}.`);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando en la nube...';

        try {
            const { data: { user } } = await db.auth.getUser();
            const nuevoSaldo = currentType === 'income' ? currentSaldo + amountValue : currentSaldo - amountValue;
            const tipoMovimiento = currentType === 'income' ? 'ingreso' : 'gasto';

            // A. Guardar en la tabla de Movimientos usando "db"
            const { error: errorMov } = await db.from('movimientos').insert([
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

            // B. Actualizar el saldo usando "db"
            const { error: errorSaldo } = await db
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