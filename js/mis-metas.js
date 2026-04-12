document.addEventListener('DOMContentLoaded', () => {

    // ── Referencias DOM ──────────────────────────────────────
    const btnNuevaMeta      = document.getElementById('btnNuevaMeta');
    const btnCrearPrimera   = document.getElementById('btnCrearPrimera');
    const formInline        = document.getElementById('formInlineMeta');
    const btnCancelar       = document.getElementById('cancelInlineMeta');
    const btnGuardar        = document.getElementById('guardarInlineMeta');
    const fabMetas          = document.getElementById('fabMetas');

    const inputNombre       = document.getElementById('metaNombre');
    const inputMonto        = document.getElementById('metaMonto');
    const inputDias         = document.getElementById('metaDias');

    const emptyMetas        = document.getElementById('emptyMetas');
    const listaMetas        = document.getElementById('listaMetas');

    // ── FAB → Registrar Movimiento ───────────────────────────
    fabMetas.addEventListener('click', () => {
        window.location.href = 'movimiento.html';
    });

    // ── Abrir formulario ─────────────────────────────────────
    btnNuevaMeta.addEventListener('click', abrirForm);
    btnCrearPrimera.addEventListener('click', abrirForm);

    function abrirForm() {
        formInline.classList.remove('hidden');
        inputNombre.focus();
    }

    // ── Cancelar formulario ──────────────────────────────────
    btnCancelar.addEventListener('click', () => {
        formInline.classList.add('hidden');
        limpiarForm();
    });

    // ── Guardar nueva meta ───────────────────────────────────
    btnGuardar.addEventListener('click', () => {
        const nombre = inputNombre.value.trim();
        const monto  = parseFloat(inputMonto.value);
        const dias   = parseInt(inputDias.value);

        if (!nombre || !monto || !dias || monto <= 0 || dias <= 0) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }

        const nuevaMeta = {
            id:        Date.now(),
            nombre,
            monto,
            dias,
            ahorrado:  0
        };

        const metas = getMetas();
        metas.push(nuevaMeta);
        saveMetas(metas);

        formInline.classList.add('hidden');
        limpiarForm();
        renderMetas();
    });

    // ── Render de todas las metas ────────────────────────────
    function renderMetas() {
        const metas = getMetas();
        listaMetas.innerHTML = '';

        if (metas.length === 0) {
            emptyMetas.classList.remove('hidden');
        } else {
            emptyMetas.classList.add('hidden');
            metas.forEach(meta => listaMetas.appendChild(crearTarjetaMeta(meta)));
        }
    }

    // ── Crear tarjeta de meta ────────────────────────────────
    function crearTarjetaMeta(meta) {
        const porcentaje = Math.min(100, Math.round((meta.ahorrado / meta.monto) * 100));
        const falta      = Math.max(0, meta.monto - meta.ahorrado);
        const ahorroDiario = Math.ceil(falta / meta.dias);

        const card = document.createElement('div');
        card.classList.add('meta-card');
        card.dataset.id = meta.id;

        card.innerHTML = `
            <div class="meta-card-header">
                <p class="meta-nombre">${meta.nombre}</p>
                <button class="btn-eliminar-meta" title="Eliminar meta">🗑</button>
            </div>
            <p class="meta-monto-total">$${meta.monto.toLocaleString('es-CO')}</p>

            <div class="meta-progreso-label">
                <span>Progreso</span>
                <span>${porcentaje}%</span>
            </div>
            <div class="meta-progreso-bar">
                <div class="meta-progreso-fill" style="width: ${porcentaje}%"></div>
            </div>

            <div class="meta-stats">
                <div class="meta-stat-box">
                    <span class="meta-stat-label">Ahorrado</span>
                    <span class="meta-stat-valor">$${meta.ahorrado.toLocaleString('es-CO')}</span>
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

            <button class="btn-agregar-ahorro">
                📈 Agregar Ahorro
            </button>

            <div class="ahorro-input-row hidden">
                <input type="number" placeholder="Monto" min="0" class="input-ahorro">
                <button class="btn-confirmar-ahorro" title="Confirmar">✓</button>
                <button class="btn-cancelar-ahorro" title="Cancelar">✕</button>
            </div>
        `;

        // Botón eliminar
        card.querySelector('.btn-eliminar-meta').addEventListener('click', () => {
            if (confirm(`¿Eliminar la meta "${meta.nombre}"?`)) {
                eliminarMeta(meta.id);
            }
        });

        // Botón agregar ahorro → muestra input
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
            if (!valor || valor <= 0) {
                alert('Ingresa un monto válido.');
                return;
            }
            agregarAhorro(meta.id, valor);
        });

        // También confirmar con Enter
        inputAhorro.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') btnConfirmar.click();
        });

        return card;
    }

    // ── Agregar ahorro a una meta ────────────────────────────
    function agregarAhorro(id, valor) {
        const metas = getMetas();
        const index = metas.findIndex(m => m.id === id);
        if (index !== -1) {
            metas[index].ahorrado = Math.min(
                metas[index].monto,
                metas[index].ahorrado + valor
            );
            saveMetas(metas);
            renderMetas();
        }
    }

    // ── Eliminar meta ────────────────────────────────────────
    function eliminarMeta(id) {
        const metas = getMetas().filter(m => m.id !== id);
        saveMetas(metas);
        renderMetas();
    }

    // ── localStorage helpers ─────────────────────────────────
    function getMetas() {
        return JSON.parse(localStorage.getItem('misMetas') || '[]');
    }

    function saveMetas(metas) {
        localStorage.setItem('misMetas', JSON.stringify(metas));
    }

    function limpiarForm() {
        inputNombre.value = '';
        inputMonto.value  = '';
        inputDias.value   = '';
    }

    // ── Inicializar ──────────────────────────────────────────
    renderMetas();
});
