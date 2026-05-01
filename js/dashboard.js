document.addEventListener('DOMContentLoaded', () => {
    // 1. VARIABLES Y ESTADO INICIAL
    const STORAGE_KEY = 'estuFinPaymentMethods';
    const USER_STORAGE_KEY = 'usuarioActual'; // La llave que usas en auth.js

    let paymentMethods = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
       
    ];

   
    // 3. UTILIDADES (Formato de moneda)
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency', 
            currency: 'COP', 
            maximumFractionDigits: 0
        }).format(value);
    };

    // 4. RENDERIZADO DEL DASHBOARD
    const renderDashboard = () => {
        const listContainer = document.getElementById('methodsList');
        const totalDisplay = document.getElementById('totalBalance');
        
        if (!listContainer || !totalDisplay) return; // Evita errores si no existen los IDs

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
                    <button class="btn-edit" onclick="handleEdit(${index})">Editar</button>
                    <button class="btn-delete" onclick="handleDelete(${index})">Eliminar</button>
                </div>
            `;
            listContainer.appendChild(card);
        });

        totalDisplay.innerText = formatCurrency(currentTotal);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(paymentMethods));
    };

    // 5. FUNCIONES GLOBALES (Edit y Delete)
    window.handleDelete = (index) => {
        if (confirm(`¿Deseas eliminar "${paymentMethods[index].name}"?`)) {
            paymentMethods.splice(index, 1);
            renderDashboard();
        }
    };

    window.handleEdit = (index) => {
        const newAmount = prompt(`Nuevo saldo para ${paymentMethods[index].name}:`, paymentMethods[index].amount);
        if (newAmount !== null && !isNaN(newAmount) && newAmount.trim() !== "") {
            paymentMethods[index].amount = parseFloat(newAmount);
            renderDashboard();
        }
    };

    // 6. LÓGICA DEL MODAL
    const modal = document.getElementById('addMethodModal');
    const errorMsg = document.getElementById('errorMessage');
    const openBtn = document.getElementById('openAddModal');
    const closeBtn = document.getElementById('closeModal');
    const addForm = document.getElementById('addMethodForm');

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
            const nameInput = document.getElementById('newMethodName').value.trim();
            const amountInput = parseFloat(document.getElementById('newMethodAmount').value);
            
            const exists = paymentMethods.some(m => m.name.toLowerCase() === nameInput.toLowerCase());

            if (exists) {
                errorMsg.classList.remove('hidden');
                return;
            }

            paymentMethods.push({ name: nameInput, amount: amountInput });
            renderDashboard();
            modal.classList.add('hidden');
            e.target.reset();
        };
    }

    // 7. EJECUCIÓN INICIAL
    renderDashboard();
});