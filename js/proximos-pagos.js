document.addEventListener('DOMContentLoaded', () => {

    // ── Referencias DOM ──────────────────────────────────────
    const btnAbrirForm      = document.getElementById('btnAbrirForm');
    const formInline        = document.getElementById('formInlinePago');
    const btnCancelar       = document.getElementById('cancelInlinePago');
    const btnGuardar        = document.getElementById('guardarInlinePago');
    const fabPago           = document.getElementById('fabPago');

    const inputNombre       = document.getElementById('pagoNombre');
    const inputMonto        = document.getElementById('pagoMonto');
    const inputFecha        = document.getElementById('pagoFecha');
    const selectMetodo      = document.getElementById('pagoMetodo');

    const listaPendientes   = document.getElementById('listaPagosPendientes');
    const emptyPagos        = document.getElementById('emptyPagos');
    const listaHistorial    = document.getElementById('listaHistorial');
    const emptyHistorial    = document.getElementById('emptyHistorial');

    // ── Cargar métodos de pago desde localStorage ────────────
    const methods = JSON.parse(localStorage.getItem('metodosPago') || '[]');

    if (methods.length > 0) {
        methods.forEach((method, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${method.nombre}${method.banco ? ' — ' + method.banco : ''} (${method.tipo})`;
            selectMetodo.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No hay métodos configurados';
        selectMetodo.appendChild(option);
        selectMetodo.disabled = true;
    }

    // ── Botón "+ Agregar Pago" → muestra formulario inline ───
    btnAbrirForm.addEventListener('click', () => {
        formInline.classList.remove('hidden');
        inputNombre.focus();
    });

    // ── Cancelar → oculta formulario ─────────────────────────
    btnCancelar.addEventListener('click', () => {
        formInline.classList.add('hidden');
        limpiarForm();
    });

    // ── FAB "+" → redirige a Registrar Movimiento ────────────
    fabPago.addEventListener('click', () => {
        window.location.href = 'movimiento.html';
    });

    // ── Guardar Pago ─────────────────────────────────────────
    btnGuardar.addEventListener('click', () => {
        const nombre      = inputNombre.value.trim();
        const monto       = parseFloat(inputMonto.value);
        const fecha       = inputFecha.value;
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

        // Guardar en localStorage
        const pagosPendientes = JSON.parse(localStorage.getItem('pagosPendientes') || '[]');
        pagosPendientes.push(nuevoPago);
        localStorage.setItem('pagosPendientes', JSON.stringify(pagosPendientes));

        // Ocultar formulario y limpiar
        formInline.classList.add('hidden');
        limpiarForm();

        // Actualizar vista
        renderPagosPendientes();
    });

    // ── Render Pagos Pendientes ───────────────────────────────
    function renderPagosPendientes() {
        const pagos = JSON.parse(localStorage.getItem('pagosPendientes') || '[]');
        const pendientes = pagos.filter(p => p.estado === 'pendiente');

        // Limpiar tarjeta (excepto el empty state)
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

            // Evento "Marcar pagado"
            listaPendientes.querySelectorAll('.btn-pagar').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    marcarPagado(parseInt(e.target.dataset.id));
                });
            });
        }
    }

    // ── Render Historial ──────────────────────────────────────
    function renderHistorial() {
        const pagos = JSON.parse(localStorage.getItem('pagosPendientes') || '[]');
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

    // ── Marcar como pagado ────────────────────────────────────
    function marcarPagado(id) {
        const pagos = JSON.parse(localStorage.getItem('pagosPendientes') || '[]');
        const index = pagos.findIndex(p => p.id === id);
        if (index !== -1) {
            pagos[index].estado = 'pagado';
            localStorage.setItem('pagosPendientes', JSON.stringify(pagos));
            renderPagosPendientes();
            renderHistorial();
        }
    }

    // ── Helpers ───────────────────────────────────────────────
    function limpiarForm() {
        inputNombre.value = '';
        inputMonto.value  = '';
        inputFecha.value  = '';
        selectMetodo.selectedIndex = 0;
    }

    function formatearFecha(fechaStr) {
        const [year, month, day] = fechaStr.split('-');
        return `${day}/${month}/${year}`;
    }

    // ── Inicializar vistas ────────────────────────────────────
    renderPagosPendientes();
    renderHistorial();
});