// js/setup-saldos.js

const modal = document.getElementById('modal-method');
const btnAdd = document.getElementById('btn-add-method');
const btnCancel = document.getElementById('btn-cancel');
const formMethod = document.getElementById('form-method');
const methodsList = document.getElementById('methods-list');
const btnContinue = document.getElementById('btn-continue');

let misMetodos = [];

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
                <span>${m.nombre}</span>
                <strong>$${m.saldo.toLocaleString()}</strong>
            </div>
        `).join('');
        
        // Habilitar botón de continuar
        btnContinue.disabled = false;
        btnContinue.innerText = "Continuar al Dashboard";
        btnContinue.classList.add('active');
    }
}

// Navegación al Dashboard
btnContinue.onclick = () => {
    // Guardamos en LocalStorage para que el dashboard lo use
    localStorage.setItem('metodosPago', JSON.stringify(misMetodos));
    window.location.href = 'dashboard.html'; // O index.html según tu estructura
};