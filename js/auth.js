document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm    = document.getElementById('loginForm');

    // ── REGISTRO ──────────────────────────────────────────────
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre   = document.getElementById('name').value.trim();
            const email    = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            if (nombre.length < 3) return mostrarError(registerForm, 'El nombre es muy corto.');
            if (password.length < 6) return mostrarError(registerForm, 'La contraseña debe tener 6+ caracteres.');

            try {
                const res  = await fetch(`${API_URL}/api/usuarios/registro`, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ nombre, email, password })
                });
                const data = await res.json();

                if (data.error) return mostrarError(registerForm, data.error);

                // Guardar sesión y redirigir
                localStorage.setItem('usuarioActual', JSON.stringify({ nombre, email }));
                window.location.href = 'dashboard.html';

            } catch (err) {
                mostrarError(registerForm, 'Error de conexión con el servidor.');
            }
        });
    }

    // ── LOGIN ─────────────────────────────────────────────────
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email    = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            try {
                const res  = await fetch(`${API_URL}/api/usuarios/registro`, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (data.error) return mostrarError(loginForm, data.error);

                // Guardar sesión y redirigir
                localStorage.setItem('usuarioActual', JSON.stringify({
                    nombre: data.usuario.nombre,
                    email:  data.usuario.email
                }));
                window.location.href = 'dashboard.html';

            } catch (err) {
                mostrarError(loginForm, 'Error de conexión con el servidor.');
            }
        });
    }

    // ── TOGGLE CONTRASEÑA ─────────────────────────────────────
    const btnToggle = document.getElementById('togglePass');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            const input = document.getElementById('password');
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            btnToggle.textContent = isPass ? '🙈' : '👁️';
        });
    }

    function mostrarError(formulario, mensaje) {
        const existing = formulario.querySelector('.error-message');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.className = 'error-message';
        div.style.cssText = 'color:red;font-size:.85rem;margin-top:8px;text-align:center';
        div.textContent = mensaje;
        formulario.insertBefore(div, formulario.querySelector('.btn-full'));
        setTimeout(() => div.remove(), 4000);
    }
});