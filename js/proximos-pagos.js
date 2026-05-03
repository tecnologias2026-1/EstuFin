/* ================================================
   js/proximos-pagos.js
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── 0. Identificar al usuario actual (Camino Profesional) ──
    // Asumimos que al iniciar sesión guardas un objeto con el email del usuario
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    
    // Creamos un sufijo único. Si el correo es juan@gmail.com, el sufijo será "_juan@gmail.com"
    const sufijoUsuario = (usuarioActual && usuarioActual.email) ? '_' + usuarioActual.email : '';

    // Claves dinámicas exclusivas para este usuario
    const KEY_METODOS = 'metodosPago' + sufijoUsuario;
    const KEY_PAGOS   = 'pagosPendientes' + sufijoUsuario;
    const KEY_NOTIF   = 'notificaciones' + sufijoUsuario;


    // ── Referencias DOM ──────────────────────────────────────
    const btnAbrirForm      = document.getElementById('btnAbrirForm');
    const formInline        = document.getElementById('formInlinePago');
    const btnCancelar       = document.getElementById('cancelInlinePago');
    const btnGuardar        = document.getElementById('guardarInlinePago');
    const fabPago           = document.getElementById('fabPago'); // Botón redondo

    const inputNombre       = document.getElementById('pagoNombre');
    const inputMonto        = document.getElementById('pagoMonto');
    const inputFecha        = document.getElementById('pagoFecha');
    const selectMetodo      = document.getElementById('pagoMetodo');

    const listaPendientes   = document.getElementById('listaPagosPendientes');
    const emptyPagos        = document.getElementById('emptyPagos');
    const listaHistorial    = document.getElementById('listaHistorial');
    const emptyHistorial    = document.getElementById('emptyHistorial');

    // ── Cargar métodos de pago del usuario desde localStorage ──
    let methods = JSON.parse(localStorage.getItem(KEY_METODOS) || '[]');

    // Si el usuario no tiene métodos, le damos unos por defecto (guardados en SU perfil)
    if (methods.length === 0) {
        methods = [
            { nombre: 'Efectivo', tipo: 'Físico' },
            { nombre: 'Nequi / Daviplata', tipo: 'Billetera Digital' },
            { nombre: 'Tarjeta de Débito', tipo: 'Bancario' },
            { nombre: 'Tarjeta de Crédito', tipo: 'Bancario' },
            { nombre: 'Transferencia', tipo: 'Bancario' }
        ];
        localStorage.setItem(KEY_METODOS, JSON.stringify(methods));
    }

    // LIMPIAMOS el select primero para evitar que queden opciones "basura" del HTML
    selectMetodo.innerHTML = '<option value="" disabled selected>Selecciona un método...</option>';

    // Llenamos con los métodos del usuario
    methods.forEach((method, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${method.nombre}${method.banco ? ' — ' + method.banco : ''} (${method.tipo})`;
        selectMetodo.appendChild(option);
    });
    
    selectMetodo.disabled = false;

    // ── Función para abrir el formulario  ────────────
    function abrirFormulario() {
        formInline.classList.remove('hidden');
        inputNombre.focus();
    }

    // Tanto el botón rectangular (PC) como el redondo (Móvil) usan la misma función
    if (btnAbrirForm) btnAbrirForm.addEventListener('click', abrirFormulario);
    if (fabPago) fabPago.addEventListener('click', abrirFormulario);

    // ── Cancelar → oculta formulario ─────────────────────────
    btnCancelar.addEventListener('click', () => {
        formInline.classList.add('hidden');
        limpiarForm();
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

        // Usamos la clave dinámica KEY_PAGOS
        const pagosPendientes = JSON.parse(localStorage.getItem(KEY_PAGOS) || '[]');
        pagosPendientes.push(nuevoPago);
        localStorage.setItem(KEY_PAGOS, JSON.stringify(pagosPendientes));

        formInline.classList.add('hidden');
        limpiarForm();

        renderPagosPendientes();
        revisarNotificacionesPagos(); 
    });

    // ── Render Pagos Pendientes ───────────────────────────────
    function renderPagosPendientes() {
        // Usamos la clave dinámica KEY_PAGOS
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

            listaPendientes.querySelectorAll('.btn-pagar').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    marcarPagado(parseInt(e.target.dataset.id));
                });
            });
        }
    }

    // ── Render Historial ──────────────────────────────────────
    function renderHistorial() {
        // Usamos la clave dinámica KEY_PAGOS
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

    // ── Marcar como pagado ────────────────────────────────────
    function marcarPagado(id) {
        // Usamos la clave dinámica KEY_PAGOS
        const pagos = JSON.parse(localStorage.getItem(KEY_PAGOS) || '[]');
        const index = pagos.findIndex(p => p.id === id);
        if (index !== -1) {
            pagos[index].estado = 'pagado';
            localStorage.setItem(KEY_PAGOS, JSON.stringify(pagos));
            renderPagosPendientes();
            renderHistorial();
            revisarNotificacionesPagos();
        }
    }

    // ── Lógica de Notificaciones de Vencimiento ───────────────
    function revisarNotificacionesPagos() {
        // Usamos las claves dinámicas KEY_PAGOS y KEY_NOTIF
        const pagos = JSON.parse(localStorage.getItem(KEY_PAGOS) || '[]');
        let notificaciones = JSON.parse(localStorage.getItem(KEY_NOTIF) || '[]');

        notificaciones = notificaciones.filter(n => !n.isAutoPago);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); 

        pagos.forEach(pago => {
            if (pago.estado === 'pendiente') {
                const fechaPago = new Date(pago.fecha + 'T00:00:00'); 
                const diferenciaTiempo = fechaPago.getTime() - hoy.getTime();
                const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

                if (diferenciaDias <= 5 && diferenciaDias >= 0) {
                    notificaciones.push({
                        id: 'auto_' + pago.id,
                        texto: `⏳ El pago "${pago.descripcion}" vence en ${diferenciaDias} día(s).`,
                        fecha: new Date().toLocaleDateString('es-CO'),
                        isAutoPago: true
                    });
                } 
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

        localStorage.setItem(KEY_NOTIF, JSON.stringify(notificaciones));
        actualizarCampanaDOM(notificaciones);
    }

    function actualizarCampanaDOM(notifs) {
        const badge = document.getElementById('bellBadge');
        const body  = document.getElementById('notifBody');

        if (!badge || !body) return; 

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
    
    setTimeout(revisarNotificacionesPagos, 100); 
});