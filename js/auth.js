// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Obtener valores
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Limpiar mensajes de error previos
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();

        // Validaciones
        if (!name || !email || !password) {
            mostrarError('Por favor, completa todos los campos.');
            return;
        }

        if (name.length < 3) {
            mostrarError('El nombre debe tener al menos 3 caracteres.');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            mostrarError('Ingresa un correo electrónico válido.');
            return;
        }

        if (password.length < 6) {
            mostrarError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        // Verificar si el usuario ya existe (por email)
        const usuarios = JSON.parse(localStorage.getItem('estuFinUsers')) || [];
        const usuarioExistente = usuarios.find(u => u.email === email);
        if (usuarioExistente) {
            mostrarError('Ya existe una cuenta con ese correo. Inicia sesión.');
            return;
        }

        // Guardar nuevo usuario
        const nuevoUsuario = {
            name: name,
            email: email,
            // NUNCA guardes contraseñas reales en localStorage en producción.
            // Aquí solo es para simular la demo.
            password: btoa(password) // simulación simple (base64)
        };
        usuarios.push(nuevoUsuario);
        localStorage.setItem('estuFinUsers', JSON.stringify(usuarios));

        // Marcar sesión iniciada
        localStorage.setItem('estuFinCurrentUser', JSON.stringify({ name, email }));

        // Redirigir a bienvenida
        window.location.href = 'bienvenida.html';
    });

    // Función para mostrar mensajes de error
    function mostrarError(mensaje) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '0.85rem';
        errorDiv.style.marginTop = '10px';
        errorDiv.style.textAlign = 'center';
        errorDiv.textContent = mensaje;
        registerForm.appendChild(errorDiv);

        // Eliminar después de 3 segundos
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