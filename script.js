// script.js

// Dark mode detection
document.addEventListener('DOMContentLoaded', () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        document.documentElement.classList.toggle('dark', event.matches);
    });

    initializeEventListeners();
    calculateAll();
});

function initializeEventListeners() {
    document.getElementById('addIngredientBtn').addEventListener('click', addIngredient);
    document.getElementById('addSpecialIngredientBtn').addEventListener('click', addSpecialIngredient);
    document.getElementById('unitsYield').addEventListener('input', calculateAll);
    document.getElementById('addedPercentage').addEventListener('input', calculateAll);
    document.getElementById('profitPercentage').addEventListener('input', calculateAll);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);

    document.querySelectorAll('.ingredient-row input[type="number"]').forEach(input => {
        input.addEventListener('input', calculateAll);
    });
    document.querySelectorAll('.special-ingredient-row input[type="number"]').forEach(input => {
        input.addEventListener('input', calculateAll);
    });
    document.querySelectorAll('.remove-ingredient').forEach(btn => {
        btn.addEventListener('click', e => {
            e.target.closest('.ingredient-row').remove();
            calculateAll();
        });
    });
    document.querySelectorAll('.remove-special-ingredient').forEach(btn => {
        btn.addEventListener('click', e => {
            e.target.closest('.special-ingredient-row').remove();
            calculateAll();
        });
    });
}

function addIngredient() {
    const container = document.getElementById('ingredientsList');
    const row = document.createElement('div');
    row.className = 'ingredient-row grid grid-cols-12 gap-2 items-center py-2 rounded-lg';
    row.innerHTML = `
        <input type="text" class="col-span-4 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" placeholder="Nombre del ingrediente">
        <input type="number" class="col-span-2 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" placeholder="Cant." min="0" step="0.1">
        <input type="number" class="col-span-2 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" placeholder="ml/g" min="0" step="0.1">
        <input type="number" class="col-span-2 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" placeholder="$0.00" min="0" step="0.01">
        <span class="col-span-1 cost-display">$0.00</span>
        <button class="col-span-1 text-red-500 hover:text-red-700 remove-ingredient">✕</button>
    `;
    container.appendChild(row);
    row.querySelectorAll('input[type="number"]').forEach(input => input.addEventListener('input', calculateAll));
    row.querySelector('.remove-ingredient').addEventListener('click', () => {
        row.remove();
        calculateAll();
    });
}

function addSpecialIngredient() {
    const container = document.getElementById('specialIngredientsList');
    const row = document.createElement('div');
    row.className = 'special-ingredient-row grid grid-cols-16 gap-2 items-center py-2 rounded-lg';
    row.innerHTML = `
        <input type="text" class="col-span-4 px-3 py-2 border border-orange-300 dark:border-orange-600 rounded-lg bg-white dark:bg-gray-700" placeholder="Nombre del ingrediente">
        <input type="number" class="col-span-2 px-3 py-2 border border-orange-300 dark:border-orange-600 rounded-lg bg-white dark:bg-gray-700" placeholder="$0.00" min="0" step="0.01">
        <input type="number" class="col-span-2 px-3 py-2 border border-orange-300 dark:border-orange-600 rounded-lg bg-white dark:bg-gray-700" placeholder="250g" min="0" step="0.1">
        <input type="number" class="col-span-2 px-3 py-2 border border-orange-300 dark:border-orange-600 rounded-lg bg-white dark:bg-gray-700" placeholder="Usado" min="0" step="0.1">
        <input type="number" class="col-span-2 px-3 py-2 border border-orange-300 dark:border-orange-600 rounded-lg bg-white dark:bg-gray-700" placeholder="ml/g" min="0" step="0.1">
        <span class="col-span-2 proportional-cost">$0.00</span>
        <span class="col-span-1 special-cost-display">$0.00</span>
        <button class="col-span-1 text-red-500 hover:text-red-700 remove-special-ingredient">✕</button>
    `;
    container.appendChild(row);
    row.querySelectorAll('input[type="number"]').forEach(input => input.addEventListener('input', calculateAll));
    row.querySelector('.remove-special-ingredient').addEventListener('click', () => {
        row.remove();
        calculateAll();
    });
}

function calculateAll() {
    const regularRows = document.querySelectorAll('.ingredient-row');
    const specialRows = document.querySelectorAll('.special-ingredient-row');
    let totalIngredientsCost = 0;
    let totalMass = 0;

    regularRows.forEach(row => {
        const qty = parseFloat(row.children[1].value) || 0;
        const mass = parseFloat(row.children[2].value) || 0;
        const unitCost = parseFloat(row.children[3].value) || 0;
        const totalCost = qty * unitCost;
        row.querySelector('.cost-display').textContent = `$${totalCost.toFixed(2)}`;
        totalIngredientsCost += totalCost;
        totalMass += qty * mass;
    });

    specialRows.forEach(row => {
        const price = parseFloat(row.children[1].value) || 0;
        const content = parseFloat(row.children[2].value) || 1;
        const used = parseFloat(row.children[3].value) || 0;
        const mass = parseFloat(row.children[4].value) || 0;
        const proportional = (price * used) / content;
        row.querySelector('.proportional-cost').textContent = `$${proportional.toFixed(2)}`;
        row.querySelector('.special-cost-display').textContent = `$${proportional.toFixed(2)}`;
        totalIngredientsCost += proportional;
        totalMass += mass;
    });

    const units = parseFloat(document.getElementById('unitsYield').value) || 1;
    const added = parseFloat(document.getElementById('addedPercentage').value) || 0;
    const profit = parseFloat(document.getElementById('profitPercentage').value) || 0;

    const addedAmount = totalIngredientsCost * added / 100;
    const totalCosts = totalIngredientsCost + addedAmount;
    const unitCost = totalCosts / units;
    const gain = unitCost * profit / 100;
    const price = unitCost + gain;

    document.getElementById('totalIngredientsCost').textContent = `$${totalIngredientsCost.toFixed(2)}`;
    document.getElementById('addedAmount').textContent = `$${addedAmount.toFixed(2)}`;
    document.getElementById('totalCosts').textContent = `$${totalCosts.toFixed(2)}`;
    document.getElementById('unitCost').textContent = `$${unitCost.toFixed(2)}`;
    document.getElementById('profitPerUnit').textContent = `$${gain.toFixed(2)}`;
    document.getElementById('sellingPrice').textContent = `$${price.toFixed(2)}`;
    document.getElementById('totalMass').textContent = totalMass.toFixed(0);
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;

    doc.setFontSize(16);
    doc.text("Reporte de Costos de Receta", 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.text("Costos Totales:", 20, y);
    y += 8;
    doc.text(`- Ingredientes: ${document.getElementById('totalIngredientsCost').textContent}`, 20, y);
    y += 6;
    doc.text(`- Añadido (%): ${document.getElementById('addedAmount').textContent}`, 20, y);
    y += 6;
    doc.text(`- Total: ${document.getElementById('totalCosts').textContent}`, 20, y);
    y += 10;

    doc.text("Cálculos Unitarios:", 20, y);
    y += 8;
    doc.text(`- Costo Unitario: ${document.getElementById('unitCost').textContent}`, 20, y);
    y += 6;
    doc.text(`- Ganancia x Unidad: ${document.getElementById('profitPerUnit').textContent}`, 20, y);
    y += 6;
    doc.text(`- Precio Venta: ${document.getElementById('sellingPrice').textContent}`, 20, y);
    y += 10;

    doc.text(`Total de masa (ml/g): ${document.getElementById('totalMass').textContent}`, 20, y);

    doc.save('reporte.pdf');
}
