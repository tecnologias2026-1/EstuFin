// js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const metodos = JSON.parse(localStorage.getItem('metodosPago')) || [];
    const totalDisplay = document.querySelector('.total-balance-amount'); // Ajusta segun tu clase de CSS
    const cardsContainer = document.getElementById('individual-cards-container');

    if (metodos.length === 0) {
        alert("No tienes métodos de pago. Volviendo a configuración.");
        window.location.href = 'bienvenida.html';
        return;
    }

    // 1. Calcular Saldo Total
    const saldoTotal = metodos.reduce((total, m) => total + m.saldo, 0);

    // 2. Mostrar Saldo Total (Formato COP como en tu Figma)
    if (totalDisplay) {
        totalDisplay.innerText = `$${saldoTotal.toLocaleString('es-CO')}`;
    }

    // 3. Mostrar tarjetas individuales en el Dashboard
    if (cardsContainer) {
        cardsContainer.innerHTML = metodos.map(m => `
            <div class="dashboard-card shadow-sm">
                <p class="text-muted small">${m.nombre}</p>
                <h4>$${m.saldo.toLocaleString('es-CO')}</h4>
            </div>
        `).join('');
    }
});