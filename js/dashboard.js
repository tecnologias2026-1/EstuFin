/* ================================================
   js/dashboard.js
   Lógica del Dashboard y Métodos de Pago
   Solo localStorage — sin Supabase
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. USUARIO Y CLAVES ──────────────────────────────────
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    const sufijoUsuario = (usuarioActual && usuarioActual.email) ? '_' + usuarioActual.email : '';

    // Clave unificada — usada también en gastos-fijos y gastos-rapidos
    const STORAGE_KEY = 'metodosPago' + sufijoUsuario;

    let paymentMethods = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // ── 2. FORMATO DE MONEDA ─────────────────────────────────
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(value);
    };

    // ── 3. RENDERIZAR DASHBOARD ──────────────────────────────
    const renderDashboard = () => {
        const listContainer = document.getElementById('methodsList');
        const totalDisplay  = document.getElementById('totalBalance');

        if (!listContainer || !totalDisplay) return;

        listContainer.innerHTML = '';
        let currentTotal = 0;

        paymentMethods.forEach((method, index) => {
            currentTotal += method.amount;
            const card = document.createElement('div');
            card.className = 'method-card';
            card.innerHTML = `
                <div class="method-info">
                    <h4>${method.name}</h4>
                    <p>${formatCurrency(method.amount)}</p>
                </div>
                <div class="method-actions">
                    <button class="btn-edit"   onclick="handleEdit(${index})">Editar</button>
                    <button class="btn-delete" onclick="handleDelete(${index})">Eliminar</button>
                </div>
            `;
            listContainer.appendChild(card);
        });

        totalDisplay.innerText = formatCurrency(currentTotal);

        // Guardar siempre que se re-renderiza
        localStorage.setItem(STORAGE_KEY, JSON.stringify(paymentMethods));
    };

    // ── 4. EDITAR Y ELIMINAR (globales para onclick inline) ──
    window.handleDelete = (index) => {
        if (confirm(`¿Deseas eliminar "${paymentMethods[index].name}"?`)) {
            paymentMethods.splice(index, 1);
            renderDashboard();
        }
    };

    window.handleEdit = (index) => {
        const newAmount = prompt(
            `Nuevo saldo para ${paymentMethods[index].name}:`,
            paymentMethods[index].amount
        );
        if (newAmount !== null && !isNaN(newAmount) && newAmount.trim() !== '') {
            paymentMethods[index].amount = parseFloat(newAmount);
            renderDashboard();
        }
    };

    // ── 5. MODAL AGREGAR MÉTODO ──────────────────────────────
    const modal    = document.getElementById('addMethodModal');
    const errorMsg = document.getElementById('errorMessage');
    const openBtn  = document.getElementById('openAddModal');
    const closeBtn = document.getElementById('closeModal');
    const addForm  = document.getElementById('addMethodForm');

    if (openBtn) {
        openBtn.onclick = () => {
            modal.classList.remove('hidden');
            errorMsg.classList.add('hidden');
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.add('hidden');
    }

    if (addForm) {
        addForm.onsubmit = (e) => {
            e.preventDefault();

            const nameInput   = document.getElementById('newMethodName').value.trim();
            const amountInput = parseFloat(document.getElementById('newMethodAmount').value);

            // Validar nombre duplicado
            const exists = paymentMethods.some(
                m => m.name.toLowerCase() === nameInput.toLowerCase()
            );

            if (exists) {
                errorMsg.classList.remove('hidden');
                return;
            }

            // Guardar solo en localStorage
            paymentMethods.push({ name: nameInput, amount: amountInput });
            renderDashboard();

            modal.classList.add('hidden');
            e.target.reset();
        };
    }

    // ── 6. INICIALIZAR ───────────────────────────────────────
    renderDashboard();
});