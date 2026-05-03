/* ================================================
   js/dashboard.js
   Lógica del Dashboard y Métodos de Pago
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // 1. VARIABLES Y ESTADO INICIAL
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
    const sufijoUsuario = (usuarioActual && usuarioActual.email) ? '_' + usuarioActual.email : '';
    const STORAGE_KEY = 'metodosPago' + sufijoUsuario; // Misma clave que en proximos-pagos

    let paymentMethods = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // 2. UTILIDADES
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency', 
            currency: 'COP', 
            maximumFractionDigits: 0
        }).format(value);
    };

    // 3. RENDERIZADO DEL DASHBOARD
    const renderDashboard = () => {
        const listContainer = document.getElementById('methodsList');
        const totalDisplay = document.getElementById('totalBalance');
        
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
                    <button class="btn-edit" onclick="handleEdit(${index})">Editar</button>
                    <button class="btn-delete" onclick="handleDelete(${index})">Eliminar</button>
                </div>
            `;
            listContainer.appendChild(card);
        });

        totalDisplay.innerText = formatCurrency(currentTotal);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(paymentMethods));
    };

    // 4. FUNCIONES GLOBALES (Editar y Eliminar)
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

    // 5. LÓGICA DEL MODAL Y GUARDADO EN SUPABASE
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

    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');

    if (addForm) {
        // Le agregamos 'async' para poder comunicarnos con Supabase
        addForm.onsubmit = async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('newMethodName').value.trim();
            const amountInput = parseFloat(document.getElementById('newMethodAmount').value);
            
            const exists = paymentMethods.some(m => m.name.toLowerCase() === nameInput.toLowerCase());

            if (exists) {
                errorMsg.classList.remove('hidden');
                return;
            }

            // --- 🚀 INICIO CÓDIGO SUPABASE ---
            // Obtenemos el email del usuario logueado
            const emailGuardar = usuarioActual ? usuarioActual.email : 'sin_correo@test.com';

            const { data, error } = await db
                .from('metodos_pago')
                .insert([
                    { 
                        usuario_email: emailGuardar, 
                        nombre_metodo: nameInput, 
                        saldo_metodo: amountInput 
                    }
                ]);

            if (error) {
                console.error("Error guardando en Supabase:", error);
                alert("Hubo un error al guardar en la nube. Revisa la consola para más detalles.");
                return; // Detenemos la función si hubo error
            }
            // --- 🚀 FIN CÓDIGO SUPABASE ---

            // Si todo salió bien en la nube, actualizamos la vista localmente
            paymentMethods.push({ name: nameInput, amount: amountInput });
            renderDashboard();
            modal.classList.add('hidden');
            e.target.reset();
        };
    }

    // Inicializar la vista al cargar la página
    renderDashboard();
});