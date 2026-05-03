document.addEventListener('DOMContentLoaded', () => {

    // ── 0. Identificar al usuario actual ──
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    const sufijoUsuario = (usuarioActual && usuarioActual.email) ? '_' + usuarioActual.email : '';

    const KEY_METODOS = 'metodosPago' + sufijoUsuario;
    const KEY_PAGOS   = 'pagosPendientes' + sufijoUsuario;
    const KEY_NOTIF   = 'notificaciones' + sufijoUsuario;

    // ── Referencias DOM ──
    const btnAbrirForm = document.getElementById('btnAbrirForm'); // <-- ¡Faltaba esto!
    const btnCancelar = document.getElementById('cancelInlinePago'); // <-- ¡Y esto!
    const fabPago = document.getElementById('fabPago'); 

    const selectMetodo = document.getElementById('pagoMetodo');
    const inputNombre = document.getElementById('pagoNombre');
    const inputMonto = document.getElementById('pagoMonto');
    const inputFecha = document.getElementById('pagoFecha');
    const formInline = document.getElementById('formInlinePago');
    const listaPendientes = document.getElementById('listaPagosPendientes');
    const emptyPagos = document.getElementById('emptyPagos');
    const listaHistorial = document.getElementById('listaHistorial');
    const emptyHistorial = document.getElementById('emptyHistorial');

    // ── Lógica para Abrir y Cerrar el Formulario ──
    function abrirFormulario() {
        formInline.classList.remove('hidden');
        inputNombre.focus();
    }

    if (btnAbrirForm) btnAbrirForm.addEventListener('click', abrirFormulario);
    if (fabPago) fabPago.addEventListener('click', abrirFormulario);

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            formInline.classList.add('hidden');
            limpiarForm();
        });
    }

    // ── Cargar métodos de pago REALES del Dashboard ──
    let methods = JSON.parse(localStorage.getItem(KEY_METODOS) || '[]');

    // Limpiamos y llenamos el select
    selectMetodo.innerHTML = '<option value="" disabled selected>Selecciona un método...</option>';

    if (methods.length === 0) {
        const option = document.createElement('option');
        option.textContent = "No hay métodos (regístralos en el Dashboard)";
        option.disabled = true;
        selectMetodo.appendChild(option);
    } else {
        methods.forEach((method, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = method.name; // Usamos .name como en el dashboard
            selectMetodo.appendChild(option);
        });
    }

    // ── Guardar Pago ──
    const btnGuardar = document.getElementById('guardarInlinePago');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', () => {
            const nombre = inputNombre.value.trim();
            const monto = parseFloat(inputMonto.value);
            const fecha = inputFecha.value;
            const metodoIndex = selectMetodo.value;

            if (!nombre || !monto || !fecha || metodoIndex === '') {
                alert('Por favor, completa todos los campos.');
                return;
            }

            const selectedMethod = methods[parseInt(metodoIndex)];
            const nuevoPago = {
                id: Date.now(),
                descripcion: nombre,
                monto,
                fecha,
                metodo: selectedMethod,
                estado: 'pendiente'
            };

            const pagosPendientes = JSON.parse(localStorage.getItem(KEY_PAGOS) || '[]');
            pagosPendientes.push(nuevoPago);
            localStorage.setItem(KEY_PAGOS, JSON.stringify(pagosPendientes));

            formInline.classList.add('hidden');
            limpiarForm();
            renderPagosPendientes();
            if (typeof revisarNotificacionesPagos === 'function') {
                revisarNotificacionesPagos(); 
            }
        });
    }

    // ── Renderizar Pagos Pendientes ──
    function renderPagosPendientes() {
        const pagos = JSON.parse(localStorage.getItem(KEY_PAGOS) || '[]');
        const pendientes = pagos.filter(p => p.estado === 'pendiente');
        const items = listaPendientes.querySelectorAll('.pago-item');
        items.forEach(i => i.remove());

        if (pendientes.length === 0) {
            emptyPagos.classList.remove('hidden');
        } else {
            emptyPagos.classList.add('hidden');
            pendientes.forEach(pago => {
                const item = document.createElement('div');
                item.classList.add('pago-item');
                item.dataset.id = pago.id;
                item.innerHTML = `
                    <div class="pago-item-info">
                        <span class="pago-nombre">${pago.descripcion}</span>
                        <span class="pago-fecha">Vence: ${formatearFecha(pago.fecha)}</span>
                    </div>
                    <div class="pago-item-right">
                        <span class="pago-monto">$${pago.monto.toLocaleString('es-CO')}</span>
                        <button class="btn-pagar" data-id="${pago.id}">Marcar pagado</button>
                    </div>
                `;
                listaPendientes.appendChild(item);
            });
            
            // Asignar evento al botón "Marcar pagado"
            listaPendientes.querySelectorAll('.btn-pagar').forEach(btn => {
                btn.addEventListener('click', (e) => marcarPagado(parseInt(e.target.dataset.id)));
            });
        }
    }

// ── Marcar como Pagado, Restar Saldo y Renderizar Historial ──
    function marcarPagado(id) {
        const pagos = JSON.parse(localStorage.getItem(KEY_PAGOS) || '[]');
        const index = pagos.findIndex(p => p.id === id);
        
        if (index !== -1) {
            const pagoRealizado = pagos[index];

            // 1. OBTENER LOS MÉTODOS DE PAGO DEL DASHBOARD
            let methods = JSON.parse(localStorage.getItem(KEY_METODOS) || '[]');
            
            // 2. BUSCAR EL MÉTODO EXACTO QUE SE USÓ PARA ESTE PAGO
            const indexMetodo = methods.findIndex(m => m.name === pagoRealizado.metodo.name);

            if (indexMetodo !== -1) {
                // 3. RESTAR EL MONTO AL SALDO DEL DASHBOARD
                methods[indexMetodo].amount -= pagoRealizado.monto;
                
                // (Opcional) Si no quieres que queden saldos negativos, puedes dejarlo en cero así:
                // if (methods[indexMetodo].amount < 0) methods[indexMetodo].amount = 0;

                // 4. GUARDAR EL NUEVO SALDO
                localStorage.setItem(KEY_METODOS, JSON.stringify(methods));
            } else {
                alert("Atención: El método de pago original ya no existe en tu Dashboard, por lo que no se pudo descontar el saldo.");
            }

            // 5. MARCAR EL PAGO COMO COMPLETADO
            pagoRealizado.estado = 'pagado';
            localStorage.setItem(KEY_PAGOS, JSON.stringify(pagos));
            
            // 6. ACTUALIZAR LAS VISTAS
            renderPagosPendientes();
            renderHistorial();
            if (typeof revisarNotificacionesPagos === 'function') {
                revisarNotificacionesPagos();
            }
        }
    }

    function renderHistorial() {
        const pagos = JSON.parse(localStorage.getItem(KEY_PAGOS) || '[]');
        const pagados = pagos.filter(p => p.estado === 'pagado');
        const items = listaHistorial.querySelectorAll('.historial-item');
        items.forEach(i => i.remove());

        if (pagados.length === 0) {
            emptyHistorial.classList.remove('hidden');
        } else {
            emptyHistorial.classList.add('hidden');
            pagados.forEach(pago => {
                const item = document.createElement('div');
                item.classList.add('historial-item');
                item.innerHTML = `
                    <span class="h-nombre">${pago.descripcion}</span>
                    <span class="h-monto">$${pago.monto.toLocaleString('es-CO')}</span>
                `;
                listaHistorial.appendChild(item);
            });
        }
    }

    // ── Helpers ──
    function limpiarForm() {
        inputNombre.value = ''; 
        inputMonto.value = ''; 
        inputFecha.value = '';
        selectMetodo.selectedIndex = 0;
    }

    function formatearFecha(fechaStr) {
        if (!fechaStr) return '--/--/----';
        const [year, month, day] = fechaStr.split('-');
        return `${day}/${month}/${year}`;
    }

    // Inicializar
    renderPagosPendientes();
    renderHistorial();
});