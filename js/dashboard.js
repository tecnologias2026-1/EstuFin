// js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Intentar obtener los métodos desde el LocalStorage
    const metodos = JSON.parse(localStorage.getItem('metodosPago')) || [];
    
    // 2. Referencias a los elementos reales de tu dashboard.html
    const displaySaldoPrincipal = document.querySelector('.amount'); // El $0 grande
    const displayBadgeTotal = document.querySelector('.balance-badge'); // El badge de abajo
    
    // 3. Si no hay métodos, redirigir a bienvenida para que el usuario los cree
    if (metodos.length === 0) {
        window.location.href = 'bienvenida.html';
        return;
    }

    // 4. Calcular el Saldo Total sumando todos los métodos
    const saldoTotal = metodos.reduce((total, m) => total + m.saldo, 0);

    // 5. Actualizar el saldo principal (Número grande)
    if (displaySaldoPrincipal) {
        displaySaldoPrincipal.innerText = `$${saldoTotal.toLocaleString('es-CO')}`;
    }

    // 6. Actualizar el desglose en el badge (Ej: Efectivo: $10.000 | Banco: $50.000)
    if (displayBadgeTotal) {
        const resumenMetodos = metodos
            .map(m => `${m.nombre}: $${m.saldo.toLocaleString('es-CO')}`)
            .join(' | ');
        
        displayBadgeTotal.innerHTML = `💵 Total: ${resumenMetodos}`;
    }
});