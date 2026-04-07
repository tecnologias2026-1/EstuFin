document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!name || !email || !password) {
            return;
        }

        const userData = {
            name,
            email
        };

        localStorage.setItem('estuFinUser', JSON.stringify(userData));
        window.location.href = 'bienvenida.html';
    });
});
