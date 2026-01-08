// Main App logic
// Assumes storage.js is loaded previously and functions are global

// Datos de ejemplo por defecto
const defaultExample = {
    cv: {
        name: "Nombre Apellido",
        location: "País",
        email: "correo@ejemplo.com",
        phone: "+XXX XXX XXXX",
        website: "",
        sections: {
            "Perfil profesional": [
                { type: 'text', text: "Resumen profesional o objetivo: 2-4 líneas que destaquen tu perfil." }
            ],
            "Experiencia": [
                { type: 'experience', company: "Empresa Ejemplo", position: "Cargo", start_date: "2023", end_date: "Presente", location: "Ciudad", highlights: ["Logro importante 1", "Responsabilidad clave"] }
            ],
            "Educación": [
                { type: 'education', institution: "Universidad", area: "Carrera", degree: "Grado", start_date: "2018", end_date: "2022", location: "Ciudad", highlights: ["Promedio destacado"] }
            ],
            "Habilidades": [
                { type: 'skill', label: "Técnicas", details: "Herramienta A, Herramienta B" }
            ]
        }
    }
};

let currentData = JSON.parse(JSON.stringify(defaultExample));

function initApp() {
    // Intentar cargar datos guardados
    // Functions from storage.js are expected to be global now
    if (typeof loadFromLocal === 'function') {
        const saved = loadFromLocal();
        if (saved) {
            currentData = saved;
        }
    }

    render();
    setupListeners();

    // Auto-save on input events with debounce
    const cvEl = document.getElementById('cv');
    if (cvEl) cvEl.addEventListener('input', debounce(handleInput, 1000));
}

function handleInput() {
    const data = collectDataFromDOM();
    currentData = data; // Update in-memory
    if (typeof saveToLocal === 'function') saveToLocal(data);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function clearChildren(el) { while (el.firstChild) el.removeChild(el.firstChild); }

function render() {
    const data = currentData.cv;
    document.getElementById('name').innerText = data.name || '';
    document.getElementById('location').innerText = data.location || '';
    document.getElementById('email').innerText = data.email || '';
    document.getElementById('phone').innerText = data.phone || '';
    document.getElementById('website').innerText = data.website || '';

    const sectionsEl = document.getElementById('sections');
    clearChildren(sectionsEl);

    for (const [sectionTitle, items] of Object.entries(data.sections)) {
        const sectionDiv = document.createElement('section');
        const h2 = document.createElement('h2');
        h2.innerText = sectionTitle;
        h2.contentEditable = true;
        sectionDiv.appendChild(h2);

        const desc = document.createElement('div');
        desc.className = 'section-desc';
        desc.contentEditable = true;
        desc.innerText = getPlaceholderForSection(sectionTitle);
        sectionDiv.appendChild(desc);

        const list = document.createElement('div');

        if (Array.isArray(items)) {
            items.forEach(item => {
                list.appendChild(createEntryFromData(item));
            });
        } else if (items.entries) {
            // Legacy format support
            items.entries.forEach(e => {
                list.appendChild(createEntryFromData({ type: 'text', text: e.content }));
            });
        }

        sectionDiv.appendChild(list);

        // Botón añadir al final de sección
        const addBtn = document.createElement('button');
        addBtn.className = 'action-btn small';
        addBtn.innerText = '+ Añadir entrada';
        addBtn.style.marginTop = '10px';
        addBtn.onclick = () => {
            let type = 'text';
            if (sectionTitle.toLowerCase().includes('educa')) type = 'education';
            if (sectionTitle.toLowerCase().includes('experie')) type = 'experience';
            if (sectionTitle.toLowerCase().includes('proyect')) type = 'project';
            if (sectionTitle.toLowerCase().includes('habilid')) type = 'skill';

            const newEntry = createEntryElement(type);
            list.appendChild(newEntry);
        };
        sectionDiv.appendChild(addBtn);

        sectionsEl.appendChild(sectionDiv);
    }
}

function createEntryFromData(item) {
    const itemEl = document.createElement('div');
    itemEl.className = 'entry';
    itemEl.dataset.type = item.type || 'text';

    // Build internal HTML based on type
    if (item.type === 'text') {
        const p = document.createElement('p');
        p.innerText = item.text || '';
        p.contentEditable = true;
        itemEl.appendChild(p);
    } else if (item.type === 'education') {
        const title = document.createElement('div');
        title.contentEditable = true;
        title.innerHTML = `<strong>${item.institution || 'Institución'}</strong> — <em>${item.degree || 'Título'}</em>`;
        itemEl.appendChild(title);
        const meta = document.createElement('div');
        meta.contentEditable = true;
        meta.innerHTML = `${item.location || 'Lugar'} · ${item.start_date || 'Inicio'} — ${item.end_date || 'Fin'}`;
        itemEl.appendChild(meta);
        if (item.highlights) {
            const ul = document.createElement('ul');
            item.highlights.forEach(h => { const li = document.createElement('li'); li.contentEditable = true; li.innerText = h; ul.appendChild(li); });
            itemEl.appendChild(ul);
        }
    } else if (item.type === 'experience' || item.type === 'project') {
        const title = document.createElement('div');
        title.contentEditable = true;
        title.innerHTML = item.position ? `<strong>${item.position}</strong> — <em>${item.company}</em>` : `<strong>${item.name}</strong>`;
        itemEl.appendChild(title);
        const meta = document.createElement('div');
        meta.contentEditable = true;
        meta.innerText = `${item.location || ''} · ${item.start_date || ''} — ${item.end_date || ''}`;
        itemEl.appendChild(meta);
        if (item.summary) { const s = document.createElement('div'); s.contentEditable = true; s.innerText = item.summary; itemEl.appendChild(s); }
        if (item.highlights) {
            const ul = document.createElement('ul');
            item.highlights.forEach(h => { const li = document.createElement('li'); li.contentEditable = true; li.innerText = h; ul.appendChild(li); });
            itemEl.appendChild(ul);
        }
    } else if (item.type === 'skill') {
        const s = document.createElement('div');
        s.contentEditable = true;
        s.innerHTML = `<strong>${item.label}:</strong> ${item.details}`;
        itemEl.appendChild(s);
    } else {
        const p = document.createElement('div');
        p.contentEditable = true;
        p.innerText = JSON.stringify(item);
        itemEl.appendChild(p);
    }

    appendControls(itemEl);
    return itemEl;
}

function createEntryElement(type) {
    const itemEl = document.createElement('div');
    itemEl.className = 'entry';
    itemEl.dataset.type = type;

    if (type === 'education') {
        itemEl.innerHTML = `<div contenteditable="true"><strong>Institución</strong> — <em>Título</em></div><div contenteditable="true">Ciudad · Inicio — Fin</div><ul><li contenteditable="true">Logro destacado</li></ul>`;
    } else if (type === 'experience') {
        itemEl.innerHTML = `<div contenteditable="true"><strong>Cargo</strong> — <em>Empresa</em></div><div contenteditable="true">Ciudad · Inicio — Fin</div><ul><li contenteditable="true">Responsabilidad o logro</li></ul>`;
    } else if (type === 'skill') {
        itemEl.innerHTML = `<div contenteditable="true"><strong>Categoría:</strong> Lista de habilidades</div>`;
    } else {
        itemEl.innerHTML = `<p contenteditable="true">Nuevo elemento de texto</p>`;
    }

    appendControls(itemEl);
    return itemEl;
}

function appendControls(itemEl) {
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'entry-controls';
    controlsDiv.style.marginTop = '4px';

    const delBtn = document.createElement('button');
    delBtn.className = 'action-btn small';
    delBtn.innerText = 'Eliminar';
    delBtn.onclick = () => { itemEl.remove(); handleInput(); };

    controlsDiv.appendChild(delBtn);
    itemEl.appendChild(controlsDiv);
}

function collectDataFromDOM() {
    const out = { cv: { name: '', location: '', email: '', phone: '', website: '', sections: {} } };
    const nameEl = document.getElementById('name');
    if (nameEl) out.cv.name = nameEl.innerText.trim();
    const locEl = document.getElementById('location');
    if (locEl) out.cv.location = locEl.innerText.trim();
    const emailEl = document.getElementById('email');
    if (emailEl) out.cv.email = emailEl.innerText.trim();
    const phoneEl = document.getElementById('phone');
    if (phoneEl) out.cv.phone = phoneEl.innerText.trim();
    const webEl = document.getElementById('website');
    if (webEl) out.cv.website = webEl.innerText.trim();

    const sectionsEl = document.getElementById('sections');
    if (sectionsEl) {
        for (const sectionDiv of sectionsEl.children) {
            const titleEl = sectionDiv.querySelector('h2');
            if (!titleEl) continue;
            const title = titleEl.innerText.trim();

            const entries = [];
            sectionDiv.querySelectorAll('.entry').forEach(e => {
                const type = e.dataset.type;
                let entryObj = { type };
                if (type == 'text') entryObj.text = e.innerText.replace('Eliminar', '').trim();
                else {
                    if (type === 'skill') {
                        const t = e.innerText.replace('Eliminar', '').trim();
                        let [label, details] = t.split(':');
                        entryObj.label = label ? label.trim() : '';
                        entryObj.details = details ? details.trim() : '';
                    } else {
                        entryObj.text = e.innerText.replace('Eliminar', '').trim();
                    }
                }
                entries.push(entryObj);
            });

            out.cv.sections[title] = entries;
        }
    }
    return out;
}

function getPlaceholderForSection(title) {
    return "Descripción de la sección...";
}

function setupListeners() {
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) resetBtn.onclick = () => {
        if (confirm("¿Borrar todo y volver al ejemplo?")) {
            currentData = JSON.parse(JSON.stringify(defaultExample));
            render();
            if (typeof saveToLocal === 'function') saveToLocal(currentData);
        }
    };

    const printBtn = document.getElementById('printBtn');
    if (printBtn) printBtn.onclick = hideControlsAndPrint;

    const exportBtn = document.getElementById('exportYamlBtn');
    if (exportBtn) exportBtn.onclick = downloadYAML;

    const importBtn = document.getElementById('importYamlBtn');
    const importInput = document.getElementById('importYamlInput');
    if (importBtn && importInput) {
        importBtn.onclick = () => importInput.click();
        importInput.onchange = (e) => {
            const f = e.target.files && e.target.files[0];
            if (f) importYAMLFile(f);
            importInput.value = '';
        };
    }
}

function hideControlsAndPrint() {
    const controls = document.getElementById('controls');
    if (controls) controls.style.display = 'none';
    setTimeout(() => {
        window.print();
        if (controls) controls.style.display = '';
    }, 50);
}

// ----- YAML Utils -----
function toYAML(obj, indent = 0) {
    const pad = '  '.repeat(indent);
    if (obj === null) return 'null';
    if (typeof obj === 'string') {
        if (/[:\-\n\r"']/.test(obj)) return '"' + obj.replace(/"/g, '\\"') + '"';
        return obj === '' ? '""' : obj;
    }
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        return obj.map(i => pad + '- ' + (typeof i === 'object' ? '\n' + toYAML(i, indent + 1) : toYAML(i, 0))).join('\n');
    }
    const lines = [];
    for (const [k, v] of Object.entries(obj)) {
        if (v === null) { lines.push(pad + k + ': null'); continue; }
        if (typeof v === 'object' && !Array.isArray(v)) {
            lines.push(pad + k + ':');
            lines.push(toYAML(v, indent + 1));
        } else if (Array.isArray(v)) {
            if (v.length === 0) { lines.push(pad + k + ': []'); }
            else {
                lines.push(pad + k + ':');
                v.forEach(item => {
                    if (typeof item === 'object') {
                        const yamlItem = toYAML(item, indent + 2);
                        lines.push(pad + '  -');
                        yamlItem.split('\n').forEach(l => lines.push(pad + '    ' + l));
                    } else {
                        lines.push(pad + '  - ' + toYAML(item, 0));
                    }
                });
            }
        } else {
            lines.push(pad + k + ': ' + toYAML(v, 0));
        }
    }
    return lines.join('\n');
}

async function downloadYAML() {
    const data = currentData;
    const yaml = toYAML(data);

    if (window.showSaveFilePicker) {
        try {
            const opts = {
                suggestedName: (data.cv.name ? data.cv.name.replace(/\s+/g, '_') : 'cv') + '.yaml',
                types: [{ description: 'YAML file', accept: { 'text/yaml': ['.yaml', '.yml'] } }]
            };
            const handle = await window.showSaveFilePicker(opts);
            if (!handle) return;
            const writable = await handle.createWritable();
            await writable.write(yaml);
            await writable.close();
            return;
        } catch (err) {
            console.warn('Fallback to blob download logic');
        }
    }

    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (data.cv.name ? data.cv.name.replace(/\s+/g, '_') : 'cv') + '.yaml';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function importYAMLFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const text = reader.result;
            const parser = window.jsyaml || window.JS_YAML;
            if (!parser) throw new Error('Librería YAML no cargada');

            const parsed = parser.load(text);
            if (parsed) {
                const data = parsed.cv ? parsed : { cv: parsed };
                currentData = data;
                if (typeof saveToLocal === 'function') saveToLocal(currentData);
                render();
                alert('CV importado. Nota: El tema no se guarda en YAML, solo los datos.');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };
    reader.readAsText(file, 'utf-8');
}
