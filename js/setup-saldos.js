document.addEventListener('DOMContentLoaded', () => {
    // 1. REFERENCIAS A ELEMENTOS DEL DOM
    const modal = document.getElementById('modal-method');
    const btnOpenModal = document.getElementById('btn-add-method'); // Asegúrate que este ID exista en tu HTML
    const btnCloseX = document.getElementById('close-modal');
    const btnCancel = document.getElementById('btn-cancel');
    const formMethod = document.getElementById('form-method');
    const methodsList = document.getElementById('methods-list');
    const btnContinue = document.getElementById('btn-continue');
    
    // Elementos nuevos para la lógica del banco
    const methodType = document.getElementById('method-type');
    const bankNameGroup = document.getElementById('bank-name-group');
    const bankInput = document.getElementById('method-bank');

    // 2. ESTADO DE LA APLICACIÓN
    // Recuperamos lo que haya en memoria o empezamos con lista vacía
    let misMetodos = JSON.parse(localStorage.getItem('metodosPago')) || [];

    // 3. FUNCIONES DE INTERFAZ
    const toggleModal = () => {
        modal.classList.toggle('hidden');
        if (!modal.classList.contains('hidden')) {
            updateBankFieldVisibility();
        }
    };

    // Función para mostrar/ocultar el campo de banco según el tipo de método
    function updateBankFieldVisibility() {
        if (!methodType || !bankNameGroup) return;
        const showBankField = methodType.value === 'tarjeta_deb' || methodType.value === 'tarjeta_cre';
        bankNameGroup.classList.toggle('hidden', !showBankField);
        if (bankInput) {
            bankInput.required = showBankField;
            if (!showBankField) bankInput.value = '';
        }
    }

    function actualizarInterfaz() {
        if (misMetodos.length === 0) {
            // ESTADO VACÍO
            methodsList.innerHTML = `
                <div class="empty-state" style="text-align:center; padding:20px;">
                    <p>No has agregado ningún método de pago</p>
                </div>
            `;
            btnContinue.disabled = true;
            btnContinue.innerText = "Agrega al menos un método para continuar";
            btnContinue.style.opacity = "0.5";
            btnContinue.style.cursor = "not-allowed";
        } else {
            // ESTADO CON DATOS
            methodsList.innerHTML = misMetodos.map(m => `
                <div class="method-card-item" style="display:flex; justify-content:space-between; background:#f4f7fe; padding:15px; border-radius:12px; margin-bottom:10px; border-left:5px solid #F24E05;">
                    <div>
                        <span style="font-size:10px; background:#F24E05; color:white; padding:2px 6px; border-radius:4px; text-transform:uppercase;">${m.tipo.replace('_', ' ')}</span>
                        <p style="margin:5px 0 0 0; font-weight:bold; color:#1e293b;">${m.nombre} ${m.banco ? ' — ' + m.banco : ''}</p>
                    </div>
                    <strong style="align-self:center; color:#1e293b;">$${Number(m.saldo).toLocaleString('es-CO')}</strong>
                </div>
            `).join('');

            // Habilitar botón continuar
            btnContinue.disabled = false;
            btnContinue.innerText = "Continuar al Dashboard"; 
            btnContinue.style.opacity = "1";
            btnContinue.style.cursor = "pointer";
            btnContinue.className = "btn-primary"; 
        }
    }

    // 4. EVENTOS
    if (methodType) {
        methodType.onchange = updateBankFieldVisibility;
    }

    if (btnOpenModal) btnOpenModal.onclick = toggleModal;
    if (btnCloseX) btnCloseX.onclick = toggleModal;
    if (btnCancel) btnCancel.onclick = toggleModal;

    formMethod.onsubmit = (e) => {
        e.preventDefault();
        
        const nuevoMetodo = {
            id: Date.now(),
            tipo: document.getElementById('method-type').value,
            nombre: document.getElementById('method-name').value,
            banco: bankInput ? bankInput.value.trim() : '',
            saldo: parseFloat(document.getElementById('method-balance').value)
        };

        misMetodos.push(nuevoMetodo);
        
        // Guardar en LocalStorage
        localStorage.setItem('metodosPago', JSON.stringify(misMetodos)); 

        actualizarInterfaz();
        toggleModal();
        formMethod.reset();
    };

    btnContinue.onclick = () => {
        window.location.href = 'dashboard.html';
    };

    // Al cargar la página, inicializamos la vista
    actualizarInterfaz();
});
