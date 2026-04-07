document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal-agregar-pago');
    const btnAgregar = document.querySelector('.btn-agregar-pago');
    const btnCerrar = document.getElementById('close-modal');
    const btnCancelar = document.getElementById('btn-cancelar-pago');
    const formPago = document.getElementById('form-agregar-pago');
    const metodoSelect = document.getElementById('pago-metodo');

    // Cargar métodos de pago desde localStorage
    const methods = JSON.parse(localStorage.getItem('metodosPago') || '[]');

    if (methods.length > 0) {
        methods.forEach((method, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${method.nombre}${method.banco ? ' — ' + method.banco : ''} (${method.tipo})`;
            metodoSelect.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No hay métodos de pago configurados';
        metodoSelect.appendChild(option);
        metodoSelect.disabled = true;
    }

    // Abrir modal
    btnAgregar.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    // Cerrar modal
    btnCerrar.addEventListener('click', () => {
        modal.classList.add('hidden');
        formPago.reset();
    });

    btnCancelar.addEventListener('click', () => {
        modal.classList.add('hidden');
        formPago.reset();
    });

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            formPago.reset();
        }
    });

    // Guardar pago
    formPago.addEventListener('submit', (e) => {
        e.preventDefault();

        const descripcion = document.getElementById('pago-descripcion').value.trim();
        const monto = parseFloat(document.getElementById('pago-monto').value);
        const fecha = document.getElementById('pago-fecha').value;
        const metodoIndex = metodoSelect.value;

        if (!descripcion || !monto || !fecha || metodoIndex === '') {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const selectedMethod = methods[parseInt(metodoIndex)];
        const nuevoPago = {
            id: Date.now(),
            descripcion,
            monto,
            fecha,
            metodo: selectedMethod,
            estado: 'pendiente'
        };

        // Guardar en localStorage (puedes cambiar a array si hay múltiples)
        const pagosPendientes = JSON.parse(localStorage.getItem('pagosPendientes') || '[]');
        pagosPendientes.push(nuevoPago);
        localStorage.setItem('pagosPendientes', JSON.stringify(pagosPendientes));

        alert('Pago agregado exitosamente!');
        modal.classList.add('hidden');
        formPago.reset();

        // Aquí podrías actualizar la vista de pagos pendientes
        // actualizarVistaPagos();
    });
});