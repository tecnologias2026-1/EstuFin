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
            // ESTADO VACÍO
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
            // ESTADO CON DATOS
            methodsList.innerHTML = misMetodos.map(m => `
                <div class="method-card-item" style="display:flex; justify-content:space-between; background:#f4f7fe; padding:15px; border-radius:12px; margin-bottom:10px; border-left:5px solid #2563EB;">
                    <div>
                        <span style="font-size:10px; background:#2563EB; color:white; padding:2px 6px; border-radius:4px; text-transform:uppercase;">${m.tipo}</span>
                        <p style="margin:5px 0 0 0; font-weight:bold; color:#1e293b;">${m.nombre}</p>
                    </div>
                    <strong style="align-self:center; color:#1e293b;">$${Number(m.saldo).toLocaleString('es-CO')}</strong>
                </div>
            `).join('');

            // CAMBIO DE BOTÓN
            btnContinue.disabled = false;
            btnContinue.innerText = "Continuar"; // Cambiamos el texto como pediste
            btnContinue.style.opacity = "1";
            btnContinue.style.cursor = "pointer";
            btnContinue.classList.remove('btn-secondary');
            btnContinue.classList.add('btn-primary'); // Para que se vea azul y activo
        }
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