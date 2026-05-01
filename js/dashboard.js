document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'estuFin_Data';
    let myMethods = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
        { name: 'nequi', amount: 60000 },
        { name: 'bancolombia', amount: 320000 }
    ];

    const formatMoney = (val) => new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(val);

    const render = () => {
        const list = document.getElementById('methodsList');
        const totalDisp = document.getElementById('totalBalance');
        list.innerHTML = '';
        let total = 0;

        myMethods.forEach((m, index) => {
            total += m.amount;
            const card = document.createElement('div');
            card.className = 'method-card';
            card.innerHTML = `
                <div class="method-info">
                    <h4>${m.name}</h4>
                    <p>${formatMoney(m.amount)}</p>
                </div>
                <div class="method-actions">
                    <button class="btn-edit" onclick="editMethod(${index})">Editar</button>
                    <button class="btn-delete" onclick="deleteMethod(${index})">Eliminar</button>
                </div>
            `;
            list.appendChild(card);
        });

        totalDisp.innerText = formatMoney(total);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(myMethods));
    };

    // FUNCIÓN ELIMINAR CON PREGUNTA
    window.deleteMethod = (index) => {
        const confirmDelete = confirm(`¿En serio deseas eliminar "${myMethods[index].name}"? Esta acción no se puede deshacer.`);
        if (confirmDelete) {
            myMethods.splice(index, 1);
            render();
        }
    };

    // FUNCIÓN EDITAR
    window.editMethod = (index) => {
        const newAmount = prompt(`Nuevo saldo para ${myMethods[index].name}:`, myMethods[index].amount);
        if (newAmount !== null && !isNaN(newAmount)) {
            myMethods[index].amount = parseFloat(newAmount);
            render();
        }
    };

    // Lógica del Modal para agregar
    const modal = document.getElementById('addMethodModal');
    document.getElementById('openAddMethodModal').onclick = () => modal.classList.remove('hidden');
    document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');

    document.getElementById('modalPaymentForm').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('modalMethodName').value;
        const amount = parseFloat(document.getElementById('modalMethodAmount').value);
        
        myMethods.push({ name, amount });
        render();
        modal.classList.add('hidden');
        e.target.reset();
    };

    render();
});