/* ================================================
   js/proximos-pagos.js — Conectado al backend
   ================================================ */

document.addEventListener('DOMContentLoaded', async () => {

    const usuarioActual  = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    if (!usuarioActual) {
    window.location.href = 'login.html';
    return;
}
    const userEmail      = usuarioActual?.email || '';

    const API_PAGOS   = `${API_BASE}/proximos_pagos.php`;
    const API_METODOS = `${API_BASE}/metodos_pago.php`;

    // Referencias DOM
    const btnAbrirForm    = document.getElementById('btnAbrirForm');
    const btnCancelar     = document.getElementById('cancelInlinePago');
    const btnGuardar      = document.getElementById('guardarInlinePago');
    const fabPago         = document.getElementById('fabPago');
    const formInline      = document.getElementById('formInlinePago');
    const selectMetodo    = document.getElementById('pagoMetodo');
    const inputNombre     = document.getElementById('pagoNombre');
    const inputMonto      = document.getElementById('pagoMonto');
    const inputFecha      = document.getElementById('pagoFecha');
    const listaPendientes = document.getElementById('listaPagosPendientes');
    const emptyPagos      = document.getElementById('emptyPagos');
    const listaHistorial  = document.getElementById('listaHistorial');
    const emptyHistorial  = document.getElementById('emptyHistorial');

    // Menú móvil
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('sidebarToggle');
    function isMobile() { return window.innerWidth <= 900; }
    if (sidebar && menuBtn) {
        menuBtn.addEventListener('click', () => {
            if (isMobile()) sidebar.classList.toggle('active');
        });
        document.addEventListener('click', (e) => {
            if (isMobile() && sidebar.classList.contains('active') &&
                !sidebar.contains(e.target) && e.target !== menuBtn) {
                sidebar.classList.remove('active');
            }
        });
    }

    // Abrir / cerrar formulario
    function abrirFormulario() {
        formInline.classList.remove('hidden');
        inputNombre.focus();
    }

    if (btnAbrirForm) btnAbrirForm.addEventListener('click', abrirFormulario);
    if (fabPago)      fabPago.addEventListener('click', abrirFormulario);
    if (btnCancelar)  btnCancelar.addEventListener('click', () => {
        formInline.classList.add('hidden');
        limpiarForm();
    });

    // Cargar métodos de pago
    async function cargarMetodos() {
        try {
            const res     = await fetch(`${API_METODOS}?email=${encodeURIComponent(userEmail)}`);
            const metodos = await res.json();
            selectMetodo.innerHTML = '<option value="" disabled selected>Selecciona un método...</option>';
            if (metodos.length === 0) {
                const opt = document.createElement('option');
                opt.textContent = 'No hay métodos (regístralos en el Dashboard)';
                opt.disabled = true;
                selectMetodo.appendChild(opt);
            } else {
                metodos.forEach(m => {
                    const opt       = document.createElement('option');
                    opt.value       = m.nombre_metodo;
                    opt.textContent = m.nombre_metodo;
                    selectMetodo.appendChild(opt);
                });
            }
        } catch (err) {
            console.error('Error al cargar métodos:', err);
        }
    }

    // Guardar pago — con protección anti-doble-click
    if (btnGuardar) {
        btnGuardar.addEventListener('click', async () => {

            if (btnGuardar.disabled) return; // protección extra

            const nombre = inputNombre.value.trim();
            const monto  = parseFloat(inputMonto.value);
            const fecha  = inputFecha.value;
            const metodo = selectMetodo.value;

            if (!nombre || !monto || !fecha || !metodo) {
                alert('Por favor, completa todos los campos.');
                return;
            }

            btnGuardar.disabled = true; // bloquear mientras guarda

            try {
                const res = await fetch(API_PAGOS, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuario_email:     userEmail,
                        nombre_pago:       nombre,
                        monto:             monto,
                        fecha_vencimiento: fecha,
                        estado:            'pendiente',
                        es_recurrente:     false,
                        metodo_pago:       metodo
                    })
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                formInline.classList.add('hidden');
                limpiarForm();
                await renderTodo();
            } catch (err) {
                alert('Error al guardar pago: ' + err.message);
            } finally {
                btnGuardar.disabled = false; // desbloquear siempre
            }
        });
    }

    // Renderizar pagos pendientes
    async function renderPagosPendientes(pagos) {
        const pendientes = pagos.filter(p => p.estado === 'pendiente');
        listaPendientes.querySelectorAll('.pago-item').forEach(i => i.remove());

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
                        <span class="pago-nombre">${pago.nombre_pago}</span>
                        <span class="pago-fecha">Vence: ${formatearFecha(pago.fecha_vencimiento)}</span>
                    </div>
                    <div class="pago-item-right">
                        <span class="pago-monto">$${parseFloat(pago.monto).toLocaleString('es-CO')}</span>
                        <button class="btn-pagar" data-id="${pago.id}" data-monto="${pago.monto}" data-metodo="${pago.metodo_pago}">
                            Marcar pagado
                        </button>
                        <button class="btn-eliminar-pago" data-id="${pago.id}" title="Eliminar">🗑</button>
                    </div>
                `;
                listaPendientes.appendChild(item);
            });

            // Evento marcar pagado
            listaPendientes.querySelectorAll('.btn-pagar').forEach(btn => {
                btn.addEventListener('click', () => marcarPagado(
                    btn.dataset.id,
                    parseFloat(btn.dataset.monto),
                    btn.dataset.metodo
                ));
            });

            // Evento eliminar
            listaPendientes.querySelectorAll('.btn-eliminar-pago').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('¿Eliminar este pago?')) return;
                    await fetch(`${API_PAGOS}?id=${btn.dataset.id}`, { method: 'DELETE' });
                    await renderTodo();
                });
            });
        }
    }

    // Marcar como pagado
    async function marcarPagado(id, monto, nombreMetodo) {
    try {
        // 1. Marcar como pagado
        await fetch(`${API_PAGOS}?action=pagar`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id })
        });

        // 2. Crear movimiento en gastos e ingresos ← NUEVO
        await fetch(`${API_BASE}/movimientos.php`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_email: userEmail,
                tipo:          'gasto',
                monto:         monto,
                categoria:     'Próximos Pagos',
                fecha:         new Date().toISOString().split('T')[0],
                metodo_pago:   nombreMetodo || 'Sin método',
                descripcion:   'Pago registrado desde Próximos Pagos'
            })
        });

            // Descontar saldo del método
            const resMetodos = await fetch(`${API_METODOS}?email=${encodeURIComponent(userEmail)}`);
            const metodos    = await resMetodos.json();
            const metodo     = metodos.find(m => m.nombre_metodo === nombreMetodo);

            if (metodo) {
                await fetch(API_METODOS, {
                    method:  'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        id:    metodo.id,
                        saldo: Math.max(0, parseFloat(metodo.saldo) - monto)
                    })
                });
            }
            await renderTodo();
        } catch (err) {
            alert('Error al marcar como pagado: ' + err.message);
        }
    }

    // Renderizar historial
    function renderHistorial(pagos) {
        const pagados = pagos.filter(p => p.estado === 'pagado');
        listaHistorial.querySelectorAll('.historial-item').forEach(i => i.remove());

        if (pagados.length === 0) {
            emptyHistorial.classList.remove('hidden');
        } else {
            emptyHistorial.classList.add('hidden');
            pagados.forEach(pago => {
                const item = document.createElement('div');
                item.classList.add('historial-item');
                item.innerHTML = `
                    <span class="h-nombre">${pago.nombre_pago}</span>
                    <span class="h-monto">$${parseFloat(pago.monto).toLocaleString('es-CO')}</span>
                `;
                listaHistorial.appendChild(item);
            });
        }
    }

    // Cargar todo
    async function renderTodo() {
        try {
            const res   = await fetch(`${API_PAGOS}?email=${encodeURIComponent(userEmail)}`);
            const pagos = await res.json();
            await renderPagosPendientes(pagos);
            renderHistorial(pagos);
        } catch (err) {
            console.error('Error al cargar pagos:', err);
        }
    }

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

    // Inicializar
    await cargarMetodos();
    await renderTodo();
}); 