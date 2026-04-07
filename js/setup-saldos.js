// js/setup-saldos.js

const modal = document.getElementById('modal-method');
const btnAdd = document.getElementById('btn-add-method');
const btnCancel = document.getElementById('btn-cancel');
const formMethod = document.getElementById('form-method');
const methodsList = document.getElementById('methods-list');
const btnContinue = document.getElementById('btn-continue');
const methodType = document.getElementById('method-type');
const bankNameGroup = document.getElementById('bank-name-group');
const bankInput = document.getElementById('method-bank');

let misMetodos = [];

function updateBankFieldVisibility() {
    const showBankField = methodType.value === 'tarjeta_deb' || methodType.value === 'tarjeta_cre';
    bankNameGroup.classList.toggle('hidden', !showBankField);
    bankInput.required = showBankField;
    if (!showBankField) {
        bankInput.value = '';
    }
}

methodType.onchange = updateBankFieldVisibility;

btnAdd.onclick = () => {
    modal.classList.remove('hidden');
    updateBankFieldVisibility();
};
btnCancel.onclick = () => modal.classList.add('hidden');

formMethod.onsubmit = (e) => {
    e.preventDefault();

    const nuevoMetodo = {
        id: Date.now(),
        tipo: methodType.value,
        nombre: document.getElementById('method-name').value,
        banco: bankInput.value.trim(),
        saldo: parseFloat(document.getElementById('method-balance').value)
    };

    misMetodos.push(nuevoMetodo);
    actualizarVistaMetodos();
    modal.classList.add('hidden');
    formMethod.reset();
    updateBankFieldVisibility();
};

// Abrir/Cerrar Modal
btnAdd.onclick = () => modal.classList.remove('hidden');
btnCancel.onclick = () => modal.classList.add('hidden');

// Guardar Método
formMethod.onsubmit = (e) => {
    e.preventDefault();

    const nuevoMetodo = {
        id: Date.now(),
        tipo: document.getElementById('method-type').value,
        nombre: document.getElementById('method-name').value,
        saldo: parseFloat(document.getElementById('method-balance').value)
    };

    misMetodos.push(nuevoMetodo);
    actualizarVistaMetodos();
    modal.classList.add('hidden');
    formMethod.reset();
};

function actualizarVistaMetodos() {
    if (misMetodos.length > 0) {
        methodsList.innerHTML = misMetodos.map(m => `
            <div class="method-card">
                <span>${m.nombre}${m.banco ? ' — ' + m.banco : ''}</span>
                <strong>$${m.saldo.toLocaleString()}</strong>
            </div>
        `).join('');
        
        // Habilitar botón de continuar
        btnContinue.disabled = false;
        btnContinue.innerText = "Continuar al Dashboard";
        btnContinue.classList.add('active');
    }

    // Eventos de botones
    btnOpenModal.onclick = toggleModal;
    btnCloseX.onclick = toggleModal;
    btnCancel.onclick = toggleModal;

    formMethod.onsubmit = (e) => {
        e.preventDefault();
        
        const nuevoMetodo = {
            tipo: document.getElementById('method-type').value,
            nombre: document.getElementById('method-name').value,
            saldo: parseFloat(document.getElementById('method-balance').value)
        };

        misMetodos.push(nuevoMetodo);
        localStorage.setItem('metodosPago', JSON.stringify(misMetodos)); // Guardamos en memoria

        actualizarInterfaz();
        toggleModal();
        formMethod.reset();
    };

    btnContinue.onclick = () => {
        window.location.href = 'dashboard.html'; // Nos vamos al dashboard real
    };

    // Al cargar la página, verificamos si ya había algo
    actualizarInterfaz();
});