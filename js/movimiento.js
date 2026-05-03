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

    // Usamos el correo de prueba que vimos en tu base de datos
    const emailUsuario = localStorage.getItem('usuarioLogueado') || 'juli@gmail.com';

    // 1. Cargar métodos de pago desde Supabase
    async function loadPaymentMethods() {
        paymentSelect.innerHTML = '<option value="">Cargando cuentas...</option>';
        paymentSelect.disabled = true;

        const { data: methods, error } = await db
            .from('metodos_pago')
            .select('*')
            .eq('usuario_email', emailUsuario); // Filtramos por tu usuario

        if (error) {
            console.error("Error al cargar métodos:", error);
            paymentSelect.innerHTML = '<option value="">Error de conexión</option>';
            return;
        }

        paymentSelect.innerHTML = '<option value="">Selecciona un método</option>';
        
        methods.forEach((method) => {
            const option = document.createElement('option');
            option.value = method.id; 
            // Usamos "method.nombre" como está en tu tabla de Supabase
            option.textContent = `${method.nombre} (Saldo: $${method.saldo.toLocaleString('es-CO')})`;
            
            option.dataset.saldo = method.saldo;
            option.dataset.nombre = method.nombre;
            
            paymentSelect.appendChild(option);
        });
        
        paymentSelect.disabled = methods.length === 0;
    }

    loadPaymentMethods();

    // 2. Manejo visual de botones Ingreso/Gasto
    incomeBtn.addEventListener('click', () => { currentType = 'income'; updateUI(); });
    expenseBtn.addEventListener('click', () => { currentType = 'expense'; updateUI(); });

    function updateUI() {
        incomeBtn.classList.toggle('active', currentType === 'income');
        expenseBtn.classList.toggle('active', currentType === 'expense');
        submitBtn.textContent = currentType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto';
        submitBtn.className = `submit-btn ${currentType === 'income' ? 'income-btn' : 'expense-btn'}`;
    }

    // 3. Registrar el movimiento en la nube
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault(); 

        const amountValue = parseFloat(document.getElementById('amount').value);
        const methodId = paymentSelect.value;
        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;

        if (!amountValue || methodId === '' || !date || !description) {
            alert('Por favor, completa todos los campos.');
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

        const nuevoSaldo = currentType === 'income' ? currentSaldo + amountValue : currentSaldo - amountValue;
        const tipoMovimiento = currentType === 'income' ? 'ingreso' : 'gasto';

        try {
            // Guardar en la tabla `movimientos`
            const { error: errorMov } = await db.from('movimientos').insert([
                {
                    usuario_email: emailUsuario,
                    tipo: tipoMovimiento,
                    monto: amountValue,
                    categoria: 'General', 
                    fecha: date,
                    metodo_pago: methodName,
                    descripcion: description
                }
            ]);

            if (errorMov) throw errorMov;

            // Actualizar el saldo en la tabla `metodos_pago`
            const { error: errorSaldo } = await db
                .from('metodos_pago')
                .update({ saldo: nuevoSaldo })
                .eq('id', methodId); 

            if (errorSaldo) throw errorSaldo;

            alert('¡Movimiento registrado con éxito!');
            window.location.href = 'dashboard.html'; 

        } catch (error) {
            console.error("Error en la base de datos:", error.message);
            alert("Hubo un error al guardar. Intenta de nuevo.");
            
            submitBtn.disabled = false;
            submitBtn.textContent = currentType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto';
        }
    });
});