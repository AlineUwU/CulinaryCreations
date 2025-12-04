// script.js - Edición Definitiva KAITO (Excel + PDF Full + Diseño) 💙

// --- 1. Inicialización y Estado ---
document.addEventListener('DOMContentLoaded', () => {
    // Detectar modo oscuro del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        document.documentElement.classList.toggle('dark', event.matches);
    });

    initializeEventListeners();
    
    // Si la lista está vacía al iniciar, cargamos unos ejemplos
    if(document.getElementById('ingredientsList') && document.getElementById('ingredientsList').children.length === 0) {
        addIngredientRow('Harina', 1, 1000, 15);
    }
    
    calculateAll();
});

function initializeEventListeners() {
    // Botones principales
    const addBtn = document.getElementById('addIngredientBtn');
    if(addBtn) addBtn.addEventListener('click', () => addIngredientRow());
    
    const addSpecialBtn = document.getElementById('addSpecialIngredientBtn');
    if(addSpecialBtn) addSpecialBtn.addEventListener('click', () => addSpecialIngredientRow());

    // Inputs de configuración
    const ids = ['unitsYield', 'addedPercentage', 'profitPercentage'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', calculateAll);
    });
    
    // Botón PDF (por si acaso el HTML no usa onclick)
    const pdfBtn = document.getElementById('exportPdfBtn');
    if(pdfBtn) pdfBtn.addEventListener('click', exportToPDF);

    attachRowListeners();
}

function attachRowListeners() {
    document.querySelectorAll('input').forEach(input => {
        input.removeEventListener('input', calculateAll); 
        input.addEventListener('input', calculateAll);
    });
}

// --- 2. Gestión de Filas ---

function addIngredientRow(name = '', qty = '', mass = '', cost = '') {
    const container = document.getElementById('ingredientsList');
    if(!container) return;
    
    const row = document.createElement('div');
    row.className = 'ingredient-row grid grid-cols-12 gap-2 items-center py-2 bg-white dark:bg-gray-700 px-2 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm mb-2';
    
    row.innerHTML = `
        <input type="text" class="col-span-4 px-2 py-1 border rounded bg-transparent dark:text-white dark:border-gray-500 text-sm w-full" placeholder="Nombre" value="${name}">
        <input type="number" class="col-span-2 px-2 py-1 border rounded bg-transparent dark:text-white dark:border-gray-500 text-sm w-full" placeholder="Cant" value="${qty}" min="0" step="0.01">
        <input type="number" class="col-span-2 px-2 py-1 border rounded bg-transparent dark:text-white dark:border-gray-500 text-sm w-full" placeholder="Masa" value="${mass}" min="0" step="0.01">
        <input type="number" class="col-span-2 px-2 py-1 border rounded bg-transparent dark:text-white dark:border-gray-500 text-sm w-full" placeholder="$" value="${cost}" min="0" step="0.01">
        <span class="col-span-1 text-xs font-bold text-gray-700 dark:text-gray-300 text-right row-total cost-display">$0.00</span>
        <button class="col-span-1 text-red-500 hover:text-red-700 font-bold remove-ingredient">✕</button>
    `;
    
    container.appendChild(row);
    
    row.querySelector('.remove-ingredient').addEventListener('click', () => {
        row.remove();
        calculateAll();
    });
    
    attachRowListeners();
    calculateAll();
}

function addSpecialIngredientRow(name = '', pkgPrice = '', pkgContent = '', used = '', mass = '') {
    const container = document.getElementById('specialIngredientsList');
    if(!container) return;

    const row = document.createElement('div');
    row.className = 'special-ingredient-row grid grid-cols-1 md:grid-cols-12 gap-2 items-center py-3 md:py-2 bg-orange-50 dark:bg-gray-700 px-2 rounded-lg border border-orange-100 dark:border-gray-600 shadow-sm mb-2';
    
    // Nota: Usamos divs contenedores para el diseño responsive, pero buscaremos los inputs dentro
    row.innerHTML = `
        <div class="col-span-1 md:col-span-3 flex flex-col"><label class="md:hidden text-xs text-gray-500">Nombre</label><input type="text" class="px-2 py-1 border rounded bg-transparent dark:text-white dark:border-gray-500 text-sm w-full" placeholder="Nombre" value="${name}"></div>
        <div class="col-span-1 md:col-span-2 flex flex-col"><label class="md:hidden text-xs text-gray-500">Precio Paq.</label><input type="number" class="px-2 py-1 border rounded bg-transparent dark:text-white dark:border-gray-500 text-sm w-full" placeholder="$" value="${pkgPrice}" min="0" step="0.01"></div>
        <div class="col-span-1 md:col-span-2 flex flex-col"><label class="md:hidden text-xs text-gray-500">Cont. Paq</label><input type="number" class="px-2 py-1 border rounded bg-transparent dark:text-white dark:border-gray-500 text-sm w-full" placeholder="Cont." value="${pkgContent}" min="0" step="0.01"></div>
        <div class="col-span-1 md:col-span-2 flex flex-col"><label class="md:hidden text-xs text-gray-500">Cant. Usada</label><input type="number" class="px-2 py-1 border rounded bg-transparent dark:text-white dark:border-gray-500 text-sm w-full" placeholder="Usado" value="${used}" min="0" step="0.01"></div>
        <div class="col-span-1 md:col-span-2 flex justify-between items-center md:justify-end"><label class="md:hidden text-xs text-gray-500 font-bold">Costo:</label><span class="text-xs font-bold text-orange-700 dark:text-orange-300 row-total special-cost-display">$0.00</span></div>
        <button class="col-span-1 md:col-span-1 text-red-500 hover:text-red-700 font-bold text-center remove-special-ingredient">✕</button>
    `;
    
    container.appendChild(row);
    
    row.querySelector('.remove-special-ingredient').addEventListener('click', () => {
        row.remove();
        calculateAll();
    });

    attachRowListeners();
    calculateAll();
}

// --- 3. Lógica de Cálculo ---
function calculateAll() {
    let totalIngredientsCost = 0;
    
    // Regulares
    document.querySelectorAll('.ingredient-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        if(inputs.length >= 4) {
            const qty = parseFloat(inputs[1].value) || 0;
            const cost = parseFloat(inputs[3].value) || 0;
            const total = qty * cost;
            
            const display = row.querySelector('.cost-display');
            if(display) display.textContent = '$' + total.toFixed(2);
            
            totalIngredientsCost += total;
        }
    });

    // Especiales
    document.querySelectorAll('.special-ingredient-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        if(inputs.length >= 4) {
            const pkgPrice = parseFloat(inputs[1].value) || 0;
            const pkgContent = parseFloat(inputs[2].value) || 1;
            const used = parseFloat(inputs[3].value) || 0;
            
            let total = 0;
            if(pkgContent > 0) total = (pkgPrice / pkgContent) * used;

            const display = row.querySelector('.special-cost-display');
            if(display) display.textContent = '$' + total.toFixed(2);
            
            totalIngredientsCost += total;
        }
    });

    // Totales Generales
    updateText('totalIngredientsCost', '$' + totalIngredientsCost.toFixed(2));

    const units = parseFloat(getValueOrZero('unitsYield')) || 1;
    const addedPercent = parseFloat(getValueOrZero('addedPercentage'));
    const profitPercent = parseFloat(getValueOrZero('profitPercentage'));

    const addedAmount = totalIngredientsCost * (addedPercent / 100);
    const totalCosts = totalIngredientsCost + addedAmount;
    const costPerUnit = totalCosts / units;
    
    const sellingPrice = costPerUnit * (1 + (profitPercent / 100));
    const profitPerUnit = sellingPrice - costPerUnit;

    updateText('addedAmount', '$' + addedAmount.toFixed(2));
    updateText('totalCosts', '$' + totalCosts.toFixed(2));
    updateText('unitCost', '$' + costPerUnit.toFixed(2));
    updateText('profitPerUnit', '$' + profitPerUnit.toFixed(2));
    updateText('sellingPrice', '$' + sellingPrice.toFixed(2));
}

// Helpers pequeños
function getValueOrZero(id) {
    const el = document.getElementById(id);
    return el ? (el.value || 0) : 0;
}
function updateText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
}

// --- 4. EXCEL (SheetJS) ---
function exportToExcel() {
    if(typeof XLSX === 'undefined') { alert("Error: Librería SheetJS no cargada."); return; }

    const wb = XLSX.utils.book_new();
    const recipeName = document.getElementById('recipeName') ? document.getElementById('recipeName').value : 'Mi Receta';
    
    const configData = [
        ["Receta", recipeName],
        ["Unidades que rinde", getValueOrZero('unitsYield')],
        ["% Margen Error", getValueOrZero('addedPercentage')],
        ["% Beneficio", getValueOrZero('profitPercentage')],
        ["Fecha", new Date().toLocaleDateString()]
    ];

    const regData = [["--- INGREDIENTES REGULARES ---", "", "", ""]];
    regData.push(["Ingrediente", "Cantidad", "Masa (g/ml)", "Costo Unitario"]);
    document.querySelectorAll('.ingredient-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        if(inputs.length >= 4) regData.push([inputs[0].value, inputs[1].value, inputs[2].value, inputs[3].value]);
    });

    const specData = [["--- INGREDIENTES ESPECIALES ---", "", "", "", ""]];
    specData.push(["Ingrediente", "Precio Paquete", "Contenido Paq.", "Cantidad Usada"]);
    document.querySelectorAll('.special-ingredient-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        if(inputs.length >= 4) specData.push([inputs[0].value, inputs[1].value, inputs[2].value, inputs[3].value]);
    });

    const finalSheetData = [...configData, [], ...regData, [], ...specData];
    const ws = XLSX.utils.aoa_to_sheet(finalSheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Costos");
    XLSX.writeFile(wb, `${recipeName.replace(/ /g, "_")}_Costos.xlsx`);
}

function importFromExcel(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, {header: 1});

        const listReg = document.getElementById('ingredientsList');
        const listSpec = document.getElementById('specialIngredientsList');
        if(listReg) listReg.innerHTML = '';
        if(listSpec) listSpec.innerHTML = '';

        let section = 'config';
        json.forEach(row => {
            if(row.length === 0) return;
            const firstCell = row[0]?.toString() || "";
            
            if(firstCell.includes("INGREDIENTES REGULARES")) { section = 'regular'; return; }
            if(firstCell.includes("INGREDIENTES ESPECIALES")) { section = 'special'; return; }
            if(firstCell === "Ingrediente") return;

            if(section === 'config') {
                const val = row[1];
                if(firstCell === "Receta" && document.getElementById('recipeName')) document.getElementById('recipeName').value = val;
                if(firstCell === "Unidades que rinde") document.getElementById('unitsYield').value = val;
                if(firstCell === "% Margen Error") document.getElementById('addedPercentage').value = val;
                if(firstCell === "% Beneficio") document.getElementById('profitPercentage').value = val;
            }
            else if(section === 'regular') {
                if(row[0]) addIngredientRow(row[0], row[1], row[2], row[3]);
            }
            else if(section === 'special') {
                if(row[0]) addSpecialIngredientRow(row[0], row[1], row[2], row[3]);
            }
        });
        calculateAll();
        alert("¡Receta cargada con éxito! 💙");
        inputElement.value = '';
    };
    reader.readAsArrayBuffer(file);
}

// --- 5. PDF (Restaurado y Adaptado para el nuevo HTML) ---
function exportToPDF() {
    if(typeof window.jspdf === 'undefined') { alert("Librería jsPDF no cargada."); return; }
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const currentDate = new Date().toLocaleDateString('es-ES');
    const recipeName = document.getElementById('recipeName') ? document.getElementById('recipeName').value : 'Sin Nombre';

    // Header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text('REPORTE DE COSTOS DE RECETA', 20, 25);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Receta: ${recipeName}`, 20, 35);
    pdf.text(`Fecha: ${currentDate}`, 20, 45);
    pdf.line(20, 50, 190, 50);

    let yPosition = 60;

    // Ingredientes Regulares
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text('INGREDIENTES', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.text('Ingrediente', 20, yPosition);
    pdf.text('Cant', 80, yPosition);
    pdf.text('Masa', 110, yPosition);
    pdf.text('Unit.', 140, yPosition);
    pdf.text('Total', 170, yPosition);
    pdf.line(20, yPosition + 2, 190, yPosition + 2);
    yPosition += 8;
    
    pdf.setFont("helvetica", "normal");
    
    // IMPORTANTE: Usamos querySelectorAll('input') para ser compatibles con el nuevo HTML
    document.querySelectorAll('.ingredient-row').forEach(row => {
        const inputs = row.querySelectorAll('input');
        if(inputs.length >= 4) {
            const name = inputs[0].value || 'Sin nombre';
            const qty = inputs[1].value || '0';
            const mass = inputs[2].value || '0';
            const unit = inputs[3].value || '0';
            const total = row.querySelector('.cost-display').textContent;

            if (yPosition > 270) { pdf.addPage(); yPosition = 25; }
            
            pdf.text(name.substring(0, 25), 20, yPosition);
            pdf.text(qty, 80, yPosition);
            pdf.text(mass, 110, yPosition);
            pdf.text(`$${unit}`, 140, yPosition);
            pdf.text(total, 170, yPosition);
            yPosition += 8;
        }
    });

    // Ingredientes Especiales
    const specRows = document.querySelectorAll('.special-ingredient-row');
    if(specRows.length > 0) {
        yPosition += 10;
        if (yPosition > 270) { pdf.addPage(); yPosition = 25; }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.text('INGREDIENTES ESPECIALES', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.text('Ingrediente', 20, yPosition);
        pdf.text('Precio Paq.', 70, yPosition); // Ajusté un poco las posiciones
        pdf.text('Cont.', 100, yPosition);
        pdf.text('Usado', 130, yPosition);
        pdf.text('Total', 170, yPosition);
        pdf.line(20, yPosition + 2, 190, yPosition + 2);
        yPosition += 8;
        
        pdf.setFont("helvetica", "normal");
        
        specRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if(inputs.length >= 4) {
                const name = inputs[0].value || 'Sin nombre';
                const pkgPrice = inputs[1].value || '0';
                const pkgCont = inputs[2].value || '0';
                const used = inputs[3].value || '0';
                const total = row.querySelector('.special-cost-display').textContent;

                if (yPosition > 270) { pdf.addPage(); yPosition = 25; }
                
                pdf.text(name.substring(0, 20), 20, yPosition);
                pdf.text(`$${pkgPrice}`, 70, yPosition);
                pdf.text(pkgCont, 100, yPosition);
                pdf.text(used, 130, yPosition);
                pdf.text(total, 170, yPosition);
                yPosition += 8;
            }
        });
    }

    // Totales
    yPosition += 10;
    if (yPosition > 250) { pdf.addPage(); yPosition = 25; }
    pdf.line(20, yPosition, 190, yPosition);
    yPosition += 10;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text('ANÁLISIS FINANCIERO', 20, yPosition);
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");

    const getData = (id) => document.getElementById(id) ? document.getElementById(id).textContent : '$0.00';
    
    pdf.text(`Costo Ingredientes: ${getData('totalIngredientsCost')}`, 20, yPosition); yPosition += 6;
    pdf.text(`Margen Error: ${getData('addedAmount')}`, 20, yPosition); yPosition += 6;
    pdf.text(`Costo Total: ${getData('totalCosts')}`, 20, yPosition); yPosition += 6;
    pdf.text(`Costo Unitario: ${getData('unitCost')}`, 20, yPosition); yPosition += 6;
    pdf.text(`Ganancia Unitaria: ${getData('profitPerUnit')}`, 20, yPosition); yPosition += 10;
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(93, 92, 222); // Color primary (tipo morado/azul)
    pdf.text(`PRECIO VENTA: ${getData('sellingPrice')}`, 20, yPosition);
    
    pdf.save(`Resumen_${recipeName.replace(/ /g, "_")}.pdf`);
}

// Globales
window.toggleDarkMode = toggleDarkMode;
window.exportToExcel = exportToExcel;
window.importFromExcel = importFromExcel;
window.addIngredientRow = addIngredientRow;
window.addSpecialIngredientRow = addSpecialIngredientRow;
window.exportToPDF = exportToPDF;
