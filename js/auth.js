document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // --- LÓGICA DE REGISTRO ---
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (name.length < 3) return mostrarError(registerForm, 'El nombre es muy corto.');
            if (password.length < 6) return mostrarError(registerForm, 'La contraseña debe tener 6+ caracteres.');

            const usuarios = JSON.parse(localStorage.getItem('estuFinUsers')) || [];
            if (usuarios.find(u => u.email === email)) {
                return mostrarError(registerForm, 'El correo ya está registrado.');
            }

            usuarios.push({ name, email, password: btoa(password) });
            localStorage.setItem('estuFinUsers', JSON.stringify(usuarios));
            localStorage.setItem('estuFinCurrentUser', JSON.stringify({ name, email }));
            
            window.location.href = 'bienvenida.html';
        });
    }

    // --- LÓGICA DE LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            const usuarios = JSON.parse(localStorage.getItem('estuFinUsers')) || [];
            const usuario = usuarios.find(u => u.email === email && u.password === btoa(password));

            if (!usuario) {
                return mostrarError(loginForm, 'Credenciales incorrectas.');
            }

            localStorage.setItem('estuFinCurrentUser', JSON.stringify({ name: usuario.name, email: usuario.email }));
            window.location.href = 'dashboard.html'; // O bienvenida si prefieres
        });
    }

    // --- FUNCIONES COMPARTIDAS ---
    function mostrarError(formulario, mensaje) {
        const existing = formulario.querySelector('.error-message');
        if (existing) existing.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = mensaje;
        formulario.insertBefore(errorDiv, formulario.querySelector('.btn-full'));

        setTimeout(() => errorDiv.remove(), 4000);
    }

    // Toggle Password para cualquier formulario
    const btnToggle = document.getElementById('togglePass');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            const input = document.getElementById('password');
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            btnToggle.textContent = isPass ? '🙈' : '👁️';
        });
    }
});