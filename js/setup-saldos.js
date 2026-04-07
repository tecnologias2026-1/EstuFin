// js/setup-saldos.js
<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal-method');
    const btnOpenModal = document.getElementById('btn-add-method');
    const btnCloseX = document.getElementById('close-modal');
    const btnCancel = document.getElementById('btn-cancel');
    const formMethod = document.getElementById('form-method');
    const methodsList = document.getElementById('methods-list');
    const btnContinue = document.getElementById('btn-continue');

    // Recuperamos lo que haya en memoria o empezamos con lista vacía
    let misMetodos = JSON.parse(localStorage.getItem('metodosPago')) || [];

    const toggleModal = () => modal.classList.toggle('hidden');

    function actualizarInterfaz() {
        if (misMetodos.length === 0) {
            // ESTADO VACÍO: Botón bloqueado y texto de advertencia
            methodsList.innerHTML = `
                <div class="empty-state">
                    <img src="assets/wallet-icon.png" alt="Wallet" class="welcome-icon">
                    <p>No has agregado ningún método de pago</p>
                </div>
            `;
            btnContinue.disabled = true;
            btnContinue.innerText = "Agrega al menos un método para continuar";
            btnContinue.style.opacity = "0.5";
        } else {
            // ESTADO CON DATOS: Mostramos los métodos agregados
            methodsList.innerHTML = misMetodos.map(m => `
                <div class="method-card-item" style="display:flex; justify-content:space-between; background:#f4f7fe; padding:15px; border-radius:12px; margin-bottom:10px; border-left:5px solid #2563EB;">
                    <div>
                        <span style="font-size:10px; background:#2563EB; color:white; padding:2px 6px; border-radius:4px; text-transform:uppercase;">${m.tipo}</span>
                        <p style="margin:5px 0 0 0; font-weight:bold; color:#1e293b;">${m.nombre}</p>
                    </div>
                    <strong style="align-self:center; color:#1e293b;">$${Number(m.saldo).toLocaleString('es-CO')}</strong>
                </div>
            `).join('');

            // CAMBIO DE BOTÓN: Ahora ya es útil
            btnContinue.disabled = false;
            btnContinue.innerText = "Continuar"; 
            btnContinue.style.opacity = "1";
            btnContinue.style.cursor = "pointer";
            // Aseguramos que tenga clase de botón principal si usas style.css
            btnContinue.className = "btn-primary"; 
        }
    }

    // Eventos de interacción
=======

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
>>>>>>> 00094f5c82acdfa53aa858b181015c5ae06d60d2
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
<<<<<<< HEAD
        localStorage.setItem('metodosPago', JSON.stringify(misMetodos)); 
=======
        localStorage.setItem('metodosPago', JSON.stringify(misMetodos)); // Guardamos en memoria
>>>>>>> 00094f5c82acdfa53aa858b181015c5ae06d60d2

        actualizarInterfaz();
        toggleModal();
        formMethod.reset();
    };

    btnContinue.onclick = () => {
<<<<<<< HEAD
        window.location.href = 'dashboard.html';
    };

=======
        window.location.href = 'dashboard.html'; // Nos vamos al dashboard real
    };

    // Al cargar la página, verificamos si ya había algo
>>>>>>> 00094f5c82acdfa53aa858b181015c5ae06d60d2
    actualizarInterfaz();
});