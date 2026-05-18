/* ================================================
   js/mis-metas.js — Conectado al backend
   ================================================ */

const API_METAS = 'http://localhost:8080/back-estuFin/api/metas_financieras.php';

// Menú móvil
document.addEventListener('DOMContentLoaded', () => {
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
});

document.addEventListener('DOMContentLoaded', () => {

    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    const userEmail     = usuarioActual?.email || '';

    const btnNuevaMeta    = document.getElementById('btnNuevaMeta');
    const btnCrearPrimera = document.getElementById('btnCrearPrimera');
    const formInline      = document.getElementById('formInlineMeta');
    const btnCancelar     = document.getElementById('cancelInlineMeta');
    const btnGuardar      = document.getElementById('guardarInlineMeta');
    const fabMetas        = document.getElementById('fabMetas');
    const inputNombre     = document.getElementById('metaNombre');
    const inputMonto      = document.getElementById('metaMonto');
    const inputDias       = document.getElementById('metaDias');
    const emptyMetas      = document.getElementById('emptyMetas');
    const listaMetas      = document.getElementById('listaMetas');

    function abrirForm() {
        formInline.classList.remove('hidden');
        inputNombre.focus();
    }

    btnNuevaMeta.addEventListener('click', abrirForm);
    btnCrearPrimera.addEventListener('click', abrirForm);
    fabMetas.addEventListener('click', abrirForm);

    btnCancelar.addEventListener('click', () => {
        formInline.classList.add('hidden');
        limpiarForm();
    });

    btnGuardar.addEventListener('click', async () => {
        const nombre = inputNombre.value.trim();
        const monto  = parseFloat(inputMonto.value);
        const dias   = parseInt(inputDias.value);

        if (!nombre || !monto || !dias || monto <= 0 || dias <= 0) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }

        try {
            const res = await fetch(API_METAS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_email:  userEmail,
                    nombre_meta:    nombre,
                    monto_objetivo: monto,
                    monto_ahorrado: 0,
                    fecha_limite:   diasAFecha(dias)
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            formInline.classList.add('hidden');
            limpiarForm();
            await renderMetas();
        } catch (err) {
            alert('Error al crear meta: ' + err.message);
        }
    });

    async function renderMetas() {
        try {
            const res   = await fetch(`${API_METAS}?email=${encodeURIComponent(userEmail)}`);
            const metas = await res.json();
            listaMetas.innerHTML = '';
            if (metas.length === 0) {
                emptyMetas.classList.remove('hidden');
            } else {
                emptyMetas.classList.add('hidden');
                metas.forEach(meta => listaMetas.appendChild(crearTarjetaMeta(meta)));
            }
        } catch (err) {
            console.error('Error al cargar metas:', err);
        }
    }

    function crearTarjetaMeta(meta) {
        const diasRestantes = fechaADias(meta.fecha_limite);
        const porcentaje    = Math.min(100, Math.round((meta.monto_ahorrado / meta.monto_objetivo) * 100));
        const falta         = Math.max(0, meta.monto_objetivo - meta.monto_ahorrado);
        const ahorroDiario  = diasRestantes > 0 ? Math.ceil(falta / diasRestantes) : falta;

        const card = document.createElement('div');
        card.classList.add('meta-card');
        card.dataset.id = meta.id;
        card.innerHTML = `
            <div class="meta-card-header">
                <p class="meta-nombre">${meta.nombre_meta}</p>
                <button class="btn-eliminar-meta" title="Eliminar meta">🗑</button>
            </div>
            <p class="meta-monto-total">$${parseFloat(meta.monto_objetivo).toLocaleString('es-CO')}</p>
            <div class="meta-progreso-label">
                <span>Progreso</span><span>${porcentaje}%</span>
            </div>
            <div class="meta-progreso-bar">
                <div class="meta-progreso-fill" style="width: ${porcentaje}%"></div>
            </div>
            <div class="meta-stats">
                <div class="meta-stat-box">
                    <span class="meta-stat-label">Ahorrado</span>
                    <span class="meta-stat-valor">$${parseFloat(meta.monto_ahorrado).toLocaleString('es-CO')}</span>
                </div>
                <div class="meta-stat-box">
                    <span class="meta-stat-label">Falta</span>
                    <span class="meta-stat-valor">$${falta.toLocaleString('es-CO')}</span>
                </div>
            </div>
            <div class="meta-ahorro-diario">
                <span class="meta-ahorro-diario-label">Ahorro diario recomendado</span>
                <span class="meta-ahorro-diario-valor">$${ahorroDiario.toLocaleString('es-CO')}/día</span>
            </div>
            <button class="btn-agregar-ahorro">📈 Agregar Ahorro</button>
            <div class="ahorro-input-row hidden">
                <input type="number" placeholder="Monto" min="0" class="input-ahorro">
                <button class="btn-confirmar-ahorro" title="Confirmar">✓</button>
                <button class="btn-cancelar-ahorro"  title="Cancelar">✕</button>
            </div>
        `;

        card.querySelector('.btn-eliminar-meta').addEventListener('click', () => {
            if (confirm(`¿Eliminar la meta "${meta.nombre_meta}"?`)) eliminarMeta(meta.id);
        });

        const btnAhorro    = card.querySelector('.btn-agregar-ahorro');
        const inputRow     = card.querySelector('.ahorro-input-row');
        const inputAhorro  = card.querySelector('.input-ahorro');
        const btnConfirmar = card.querySelector('.btn-confirmar-ahorro');
        const btnCancelarA = card.querySelector('.btn-cancelar-ahorro');

        btnAhorro.addEventListener('click', () => {
            btnAhorro.classList.add('hidden');
            inputRow.classList.remove('hidden');
            inputAhorro.focus();
        });
        btnCancelarA.addEventListener('click', () => {
            inputRow.classList.add('hidden');
            btnAhorro.classList.remove('hidden');
            inputAhorro.value = '';
        });
        btnConfirmar.addEventListener('click', () => {
            const valor = parseFloat(inputAhorro.value);
            if (!valor || valor <= 0) { alert('Ingresa un monto válido.'); return; }
            agregarAhorro(meta, valor);
        });
        inputAhorro.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') btnConfirmar.click();
        });

        return card;
    }

    async function agregarAhorro(meta, valor) {
        const nuevoAhorrado = Math.min(
            parseFloat(meta.monto_objetivo),
            parseFloat(meta.monto_ahorrado) + valor
        );
        try {
            const res = await fetch(API_METAS, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id:             meta.id,
                    nombre_meta:    meta.nombre_meta,
                    monto_objetivo: meta.monto_objetivo,
                    monto_ahorrado: nuevoAhorrado,
                    fecha_limite:   meta.fecha_limite
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            await renderMetas();
        } catch (err) {
            alert('Error al agregar ahorro: ' + err.message);
        }
    }

    async function eliminarMeta(id) {
        try {
            const res  = await fetch(`${API_METAS}?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            await renderMetas();
        } catch (err) {
            alert('Error al eliminar meta: ' + err.message);
        }
    }

    // Convierte días desde hoy a fecha YYYY-MM-DD
    function diasAFecha(dias) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + parseInt(dias));
        return fecha.toISOString().split('T')[0];
    }

    // Convierte una fecha YYYY-MM-DD a días restantes
    function fechaADias(fechaStr) {
        if (!fechaStr) return 0;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const limite = new Date(fechaStr);
        return Math.max(0, Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24)));
    }

    function limpiarForm() {
        inputNombre.value = '';
        inputMonto.value  = '';
        inputDias.value   = '';
    }

    renderMetas();
});