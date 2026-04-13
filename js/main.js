// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Limpiar errores previos
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();

        if (!email || !password) {
            mostrarError('Por favor, completa todos los campos.');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            mostrarError('Ingresa un correo electrónico válido.');
            return;
        }

        // Obtener usuarios guardados
        const usuarios = JSON.parse(localStorage.getItem('estuFinUsers')) || [];

        // Buscar usuario por email y contraseña (simulada)
        const usuario = usuarios.find(u => u.email === email && btoa(password) === u.password);

        if (!usuario) {
            mostrarError('Correo o contraseña incorrectos.');
            return;
        }

        // Guardar sesión actual
        localStorage.setItem('estuFinCurrentUser', JSON.stringify({
            name: usuario.name,
            email: usuario.email
        }));
        localStorage.setItem('usuarioActual', JSON.stringify({ nombre: usuario.name, email: usuario.email }));

        // Redirigir a bienvenida
        window.location.href = 'bienvenida.html';
    });

    function mostrarError(mensaje) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '0.85rem';
        errorDiv.style.marginTop = '10px';
        errorDiv.style.textAlign = 'center';
        errorDiv.textContent = mensaje;
        loginForm.appendChild(errorDiv);
        setTimeout(() => {
            if (errorDiv) errorDiv.remove();
        }, 3000);
    }

    // Mostrar/ocultar contraseña
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
});