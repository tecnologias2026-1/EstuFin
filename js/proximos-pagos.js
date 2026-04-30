/* ================================================
   js/proximos-pagos.js
   ================================================ */

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
    let methods = JSON.parse(localStorage.getItem('metodosPago') || '[]');

    if (methods.length === 0) {
        // Creamos métodos por defecto si el usuario aún no tiene ninguno configurado
        methods = [
            { nombre: 'Efectivo', tipo: 'Físico' },
            { nombre: 'Nequi / Daviplata', tipo: 'Billetera Digital' },
            { nombre: 'Tarjeta de Débito', tipo: 'Bancario' },
            { nombre: 'Tarjeta de Crédito', tipo: 'Bancario' },
            { nombre: 'Transferencia', tipo: 'Bancario' }
        ];
        localStorage.setItem('metodosPago', JSON.stringify(methods));
    }

    // Llenar el selector con los métodos
    methods.forEach((method, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${method.nombre}${method.banco ? ' — ' + method.banco : ''} (${method.tipo})`;
        selectMetodo.appendChild(option);
    });
    
    // Aseguramos que el menú siempre esté habilitado
    selectMetodo.disabled = false;

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

        // Actualizar vista y revisar alertas
        renderPagosPendientes();
        revisarNotificacionesPagos(); // Verificamos si este nuevo pago genera alerta
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
            revisarNotificacionesPagos(); // Recalcular notificaciones (elimina la alerta si ya se pagó)
        }
    }

    // ── Lógica de Notificaciones de Vencimiento ───────────────
    function revisarNotificacionesPagos() {
        const pagos = JSON.parse(localStorage.getItem('pagosPendientes') || '[]');
        let notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');

        // 1. Limpiar notificaciones automáticas previas para no duplicar
        notificaciones = notificaciones.filter(n => !n.isAutoPago);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Ignorar la hora, solo nos importan los días

        // 2. Revisar cada pago pendiente
        pagos.forEach(pago => {
            if (pago.estado === 'pendiente') {
                // Truco para evitar problemas de zona horaria: añadir T00:00:00
                const fechaPago = new Date(pago.fecha + 'T00:00:00'); 
                const diferenciaTiempo = fechaPago.getTime() - hoy.getTime();
                const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

                // Si faltan 5 días o menos, y no ha vencido
                if (diferenciaDias <= 5 && diferenciaDias >= 0) {
                    notificaciones.push({
                        id: 'auto_' + pago.id,
                        texto: `⏳ El pago "${pago.descripcion}" vence en ${diferenciaDias} día(s).`,
                        fecha: new Date().toLocaleDateString('es-CO'),
                        isAutoPago: true
                    });
                } 
                // Si ya está vencido (días negativos)
                else if (diferenciaDias < 0) {
                    notificaciones.push({
                        id: 'auto_' + pago.id,
                        texto: `⚠️ El pago "${pago.descripcion}" está VENCIDO.`,
                        fecha: new Date().toLocaleDateString('es-CO'),
                        isAutoPago: true
                    });
                }
            }
        });

        // 3. Guardar en localStorage
        localStorage.setItem('notificaciones', JSON.stringify(notificaciones));

        // 4. Actualizar visualmente la campana del header en tiempo real
        actualizarCampanaDOM(notificaciones);
    }

    // Actualiza la UI de la campanita sin necesidad de recargar la página entera
    function actualizarCampanaDOM(notifs) {
        const badge = document.getElementById('bellBadge');
        const body  = document.getElementById('notifBody');

        if (!badge || !body) return; // Si por alguna razón no carga el header, salimos

        if (notifs.length === 0) {
            badge.classList.add('hidden');
            body.innerHTML = `
                <div class="notif-empty">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" opacity="0.3">
                        <path d="M12 3a7 7 0 00-7 7v3.5L3 16h18l-2-2.5V10a7 7 0 00-7-7z"
                              stroke="#9CA3AF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 19a2 2 0 004 0" stroke="#9CA3AF" stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                    <p>No tienes notificaciones</p>
                    <span>Aquí aparecerán tus alertas y recordatorios</span>
                </div>
            `;
        } else {
            badge.textContent = notifs.length;
            badge.classList.remove('hidden');
            body.innerHTML = notifs.map(n => {
                // Hacemos que sea cliqueable si está marcada como pago automático
                const pointerStyle = n.isAutoPago ? 'cursor: pointer;' : '';
                const clickAction  = n.isAutoPago ? `onclick="window.location.href='proximos-pagos.html'"` : '';

                return `
                <div class="notif-item" style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 4px; ${pointerStyle}" ${clickAction}>
                    <p class="notif-item-texto" style="margin: 0; font-size: 13px; color: #334155; font-weight: 500;">${n.texto}</p>
                    <span class="notif-item-fecha" style="font-size: 11px; color: #94a3b8;">${n.fecha || ''}</span>
                </div>
                `;
            }).join('');
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
        if (!fechaStr) return '--/--/----';
        const [year, month, day] = fechaStr.split('-');
        return `${day}/${month}/${year}`;
    }

    // ── Inicializar vistas ────────────────────────────────────
    renderPagosPendientes();
    renderHistorial();
    
    // IMPORTANTE: Revisar y generar alertas tan pronto entramos a esta página
    setTimeout(revisarNotificacionesPagos, 100); 
});