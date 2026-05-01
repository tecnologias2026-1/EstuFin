document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'estuFinPaymentMethods';
    
    // --- LÓGICA DE DATOS ---
    const getMethods = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const saveMethods = (methods) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
        renderAll();
    };

    const formatCOP = (num) => new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(num);

    // --- RENDERIZADO ---
    const renderAll = () => {
        const methods = getMethods();
        const listContainer = document.getElementById('methodsList');
        const totalDisplay = document.getElementById('totalBalance');
        
        // Limpiar lista
        listContainer.innerHTML = '';
        
        let total = 0;
        methods.forEach((m, index) => {
            total += m.amount;
            const card = document.createElement('div');
            card.className = 'method-list-item-card';
            card.innerHTML = `
                <div class="m-info">
                    <p class="m-name">${m.name}</p>
                    <p class="m-amount">${formatCOP(m.amount)}</p>
                </div>
                <button class="btn-edit-item" onclick="manageMethod(${index})">Gestionar</button>
            `;
            listContainer.appendChild(card);
        });

        totalDisplay.textContent = formatCOP(total);
    };

    // --- PUNTO 1: GESTIONAR (EDITAR / ELIMINAR) ---
    window.manageMethod = (index) => {
        const methods = getMethods();
        const m = methods[index];

        const action = prompt(
            `MÉTODO: ${m.name.toUpperCase()}\n\n` +
            `• Para cambiar el saldo, escribe el nuevo valor.\n` +
            `• Para borrarlo, escribe la palabra: ELIMINAR`, 
            m.amount
        );

        if (action === null) return;

        if (action.trim().toUpperCase() === 'ELIMINAR') {
            if (confirm(`¿Seguro que quieres borrar "${m.name}"?`)) {
                methods.splice(index, 1);
                saveMethods(methods);
            }
        } else {
            const newVal = parseFloat(action);
            if (!isNaN(newVal) && newVal >= 0) {
                methods[index].amount = newVal;
                saveMethods(methods);
            } else {
                alert("Monto no válido.");
            }
        }
    };

    // --- MANEJO DEL MODAL ---
    const modal = document.getElementById('addMethodModal');
    document.getElementById('openAddMethodModal').onclick = () => modal.classList.remove('hidden');
    document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
    document.getElementById('cancelModal').onclick = () => modal.classList.add('hidden');

    document.getElementById('modalPaymentForm').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('modalMethodName').value.trim();
        const amount = parseFloat(document.getElementById('modalMethodAmount').value) || 0;
        
        if (!name) return alert("Ponle un nombre al método");

        const methods = getMethods();
        // Validación Punto 3 anterior: No duplicados
        if (methods.some(m => m.name.toLowerCase() === name.toLowerCase())) {
            return alert("Este método ya existe.");
        }

        methods.push({ name, amount });
        saveMethods(methods);
        modal.classList.add('hidden');
        e.target.reset();
    };

    // --- PUNTO 2: MENÚ HAMBURGUESA ---
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    const toggleMenu = () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    };

    toggle.onclick = toggleMenu;
    overlay.onclick = toggleMenu;

    // Inicializar
    renderAll();
});