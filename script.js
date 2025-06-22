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
            const pdf = new jsPDF();
            
            // Get current date
            const currentDate = new Date().toLocaleDateString('es-ES');
            
            // Header
            pdf.setFontSize(20);
            pdf.setFont("helvetica", "bold");
            pdf.text('REPORTE DE COSTOS DE RECETA', 20, 25);
            
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Fecha: ${currentDate}`, 20, 35);
            
            // Line separator
            pdf.line(20, 45, 190, 45);
            
            // Ingredients section
            let yPosition = 55;
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text('INGREDIENTES', 20, yPosition);
            
            yPosition += 10;
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.text('Ingrediente', 20, yPosition);
            pdf.text('Cantidad', 80, yPosition);
            pdf.text('Masa (ml/g)', 110, yPosition);
            pdf.text('Costo Unit.', 140, yPosition);
            pdf.text('Costo Total', 170, yPosition);
            
            // Draw line under headers
            pdf.line(20, yPosition + 2, 190, yPosition + 2);
            
            yPosition += 8;
            pdf.setFont("helvetica", "normal");
            
            // Get regular ingredients data
            const rows = document.querySelectorAll('.ingredient-row');
            rows.forEach(row => {
                const name = row.children[0].value || 'Sin nombre';
                const quantity = row.children[1].value || '0';
                const mass = row.children[2].value || '0';
                const unitCost = row.children[3].value || '0';
                const totalCost = row.querySelector('.cost-display').textContent;
                
                // Check if we need a new page
                if (yPosition > 270) {
                    pdf.addPage();
                    yPosition = 25;
                }
                
                pdf.text(name.substring(0, 25), 20, yPosition);
                pdf.text(quantity, 80, yPosition);
                pdf.text(mass, 110, yPosition);
                pdf.text(`$${unitCost}`, 140, yPosition);
                pdf.text(totalCost, 170, yPosition);
                yPosition += 8;
            });

            // Special ingredients section
            const specialRows = document.querySelectorAll('.special-ingredient-row');
            if (specialRows.length > 0) {
                yPosition += 10;
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(14);
                pdf.text('INGREDIENTES ESPECIALES', 20, yPosition);
                
                yPosition += 10;
                pdf.setFontSize(10);
                pdf.text('Ingrediente', 20, yPosition);
                pdf.text('Precio Paq.', 80, yPosition);
                pdf.text('Contenido', 110, yPosition);
                pdf.text('Usado', 140, yPosition);
                pdf.text('Costo Total', 170, yPosition);
                
                // Draw line under headers
                pdf.line(20, yPosition + 2, 190, yPosition + 2);
                
                yPosition += 8;
                pdf.setFont("helvetica", "normal");
                
                specialRows.forEach(row => {
                    const name = row.children[0].value || 'Sin nombre';
                    const packagePrice = row.children[1].value || '0';
                    const packageContent = row.children[2].value || '0';
                    const usedQuantity = row.children[3].value || '0';
                    const totalCost = row.querySelector('.special-cost-display').textContent;
                    
                    // Check if we need a new page
                    if (yPosition > 270) {
                        pdf.addPage();
                        yPosition = 25;
                    }
                    
                    pdf.text(name.substring(0, 25), 20, yPosition);
                    pdf.text(`$${packagePrice}`, 80, yPosition);
                    pdf.text(packageContent, 110, yPosition);
                    pdf.text(usedQuantity, 140, yPosition);
                    pdf.text(totalCost, 170, yPosition);
                    yPosition += 8;
                });
            }
            
            // Configuration section
            yPosition += 10;
            pdf.line(20, yPosition, 190, yPosition);
            yPosition += 10;
            
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.text('CONFIGURACIÓN', 20, yPosition);
            
            yPosition += 10;
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            
            const units = document.getElementById('unitsYield').value;
            const addedPercent = document.getElementById('addedPercentage').value;
            const profitPercent = document.getElementById('profitPercentage').value;
            
            pdf.text(`Unidades que rinde: ${units}`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Porcentaje añadido: ${addedPercent}%`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Beneficio esperado: ${profitPercent}%`, 20, yPosition);
            
            // Results section
            yPosition += 15;
            pdf.line(20, yPosition, 190, yPosition);
            yPosition += 10;
            
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.text('ANÁLISIS DE COSTOS', 20, yPosition);
            
            yPosition += 10;
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            
            // Get calculated values
            const totalIngredientsCost = document.getElementById('totalIngredientsCost').textContent;
            const addedAmount = document.getElementById('addedAmount').textContent;
            const totalCosts = document.getElementById('totalCosts').textContent;
            const unitCost = document.getElementById('unitCost').textContent;
            const profitPerUnit = document.getElementById('profitPerUnit').textContent;
            const sellingPrice = document.getElementById('sellingPrice').textContent;
            const totalMass = document.getElementById('totalMass').textContent;
            
            pdf.text(`Total costos ingredientes: ${totalIngredientsCost}`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Monto añadido: ${addedAmount}`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Total costos: ${totalCosts}`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Costo unitario: ${unitCost}`, 20, yPosition);
            yPosition += 6;
            pdf.text(`Ganancia por unidad: ${profitPerUnit}`, 20, yPosition);
            yPosition += 10;
            
            // Highlight selling price
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(`PRECIO DE VENTA UNITARIO: ${sellingPrice}`, 20, yPosition);
            
            yPosition += 10;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text(`Masa total: ${totalMass} ml/g`, 20, yPosition);
            
            // Footer
            yPosition += 20;
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "italic");
            pdf.text('Generado por Calculadora de Costos de Recetas', 20, yPosition);
            
            // Save the PDF
            pdf.save(`costos-receta-${currentDate}.pdf`);
        }

function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
}

window.toggleDarkMode = toggleDarkMode;
