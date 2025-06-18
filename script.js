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
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const marginLeft = 40;
    let y = 40;

    // Título
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("REPORTE DE COSTOS DE RECETA", marginLeft, y);
    y += 25;

    // Fecha actual
    const fecha = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha: ${fecha}`, marginLeft, y);
    y += 15;

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, 550, y);
    y += 20;

    // --- INGREDIENTES ---
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text("INGREDIENTES", marginLeft, y);
    y += 20;

    // Tabla encabezado ingredientes
    doc.setFontSize(11);
    const ingredientesHeader = ["Ingrediente", "Cantidad", "Masa (ml/g)", "Costo Unit", "Costo Total"];
    const colWidths = [180, 60, 70, 70, 70];
    let x = marginLeft;

    // Encabezados negrita
    ingredientesHeader.forEach((txt, i) => {
        doc.text(txt, x + 2, y);
        x += colWidths[i];
    });
    y += 15;
    doc.setLineWidth(0.3);
    doc.line(marginLeft, y - 8, marginLeft + colWidths.reduce((a,b) => a + b, 0), y - 8);

    doc.setFont(undefined, 'normal');

    // Datos ingredientes
    const regularRows = document.querySelectorAll('.ingredient-row');
    regularRows.forEach(row => {
        x = marginLeft;
        const nombre = row.children[0].value || "-";
        const cantidad = row.children[1].value || "0";
        const masa = row.children[2].value || "0";
        const costoUnit = row.children[3].value || "0";
        const costoTotal = row.querySelector('.cost-display').textContent || "$0.00";

        const values = [nombre, cantidad, masa, `$${parseFloat(costoUnit).toFixed(2)}`, costoTotal];
        values.forEach((txt, i) => {
            doc.text(String(txt), x + 2, y);
            x += colWidths[i];
        });
        y += 15;
    });

    y += 15;

    // --- INGREDIENTES ESPECIALES ---
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text("INGREDIENTES ESPECIALES", marginLeft, y);
    y += 20;

    // Tabla encabezado ingredientes especiales
    const specialHeader = ["Ingrediente", "Precio", "Contenido", "Usado", "Masa (ml/g)", "Costo Prop"];
    const specialColWidths = [140, 50, 60, 50, 70, 70];
    x = marginLeft;

    specialHeader.forEach((txt, i) => {
        doc.text(txt, x + 2, y);
        x += specialColWidths[i];
    });
    y += 15;
    doc.line(marginLeft, y - 8, marginLeft + specialColWidths.reduce((a,b) => a + b, 0), y - 8);

    doc.setFont(undefined, 'normal');

    // Datos especiales
    const specialRows = document.querySelectorAll('.special-ingredient-row');
    specialRows.forEach(row => {
        x = marginLeft;
        const nombre = row.children[0].value || "-";
        const precio = row.children[1].value || "0";
        const contenido = row.children[2].value || "0";
        const usado = row.children[3].value || "0";
        const masa = row.children[4].value || "0";
        const costoProp = row.querySelector('.special-cost-display').textContent || "$0.00";

        const values = [nombre, `$${parseFloat(precio).toFixed(2)}`, contenido, usado, masa, costoProp];
        values.forEach((txt, i) => {
            doc.text(String(txt), x + 2, y);
            x += specialColWidths[i];
        });
        y += 15;
    });

    y += 15;

    // --- CONFIGURACIÓN ---
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text("CONFIGURACIÓN", marginLeft, y);
    y += 20;
    doc.setFont(undefined, 'normal');
    const unidades = document.getElementById('unitsYield').value || "1";
    const añadido = document.getElementById('addedPercentage').value || "0";
    const ganancia = document.getElementById('profitPercentage').value || "0";
    doc.text(`Unidades a producir: ${unidades}`, marginLeft, y);
    y += 15;
    doc.text(`Porcentaje añadido: ${añadido}%`, marginLeft, y);
    y += 15;
    doc.text(`Porcentaje ganancia: ${ganancia}%`, marginLeft, y);
    y += 25;

    // --- ANÁLISIS DE COSTOS ---
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text("ANÁLISIS DE COSTOS", marginLeft, y);
    y += 20;
    doc.setFont(undefined, 'normal');

    const totalIng = document.getElementById('totalIngredientsCost').textContent || "$0.00";
    const montoAñadido = document.getElementById('addedAmount').textContent || "$0.00";
    const totalCostos = document.getElementById('totalCosts').textContent || "$0.00";

    doc.text(`Total ingredientes: ${totalIng}`, marginLeft, y);
    y += 15;
    doc.text(`Monto añadido: ${montoAñadido}`, marginLeft, y);
    y += 15;
    doc.text(`Total costos: ${totalCostos}`, marginLeft, y);
    y += 25;

    // --- PRECIO DE VENTA UNITARIO ---
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text("PRECIO DE VENTA UNITARIO", marginLeft, y);
    y += 20;
    doc.setFont(undefined, 'normal');

    const costoUnit = document.getElementById('unitCost').textContent || "$0.00";
    const gananciaUnidad = document.getElementById('profitPerUnit').textContent || "$0.00";
    const precioVenta = document.getElementById('sellingPrice').textContent || "$0.00";

    doc.text(`Costo unitario: ${costoUnit}`, marginLeft, y);
    y += 15;
    doc.text(`Ganancia por unidad: ${gananciaUnidad}`, marginLeft, y);
    y += 15;
    doc.text(`Precio de venta: ${precioVenta}`, marginLeft, y);
    y += 25;

    // Masa total
    const masaTotal = document.getElementById('totalMass').textContent || "0";
    doc.text(`Masa total: ${masaTotal} ml/g`, marginLeft, y);

    // Guardar PDF
    doc.save("reporte-costos.pdf");
}
