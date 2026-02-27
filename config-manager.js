/**
 * config-manager.js
 * Handles save/load of power estimator configurations using localStorage.
 * Supports up to 6 named slots plus JSON export/import.
 */

const CONFIG_STORAGE_KEY = 'ti_pet_configs';
const MAX_SLOTS = 6;

// ---- Helpers ----

function getAllConfigs() {
    try {
        return JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveAllConfigs(configs) {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
}

/**
 * Capture every controlled input from the page into a plain object.
 */
function captureCurrentConfig() {
    const config = {};

    // All sliders, number inputs, selects in the sidebar
    document.querySelectorAll(
        '#temperature-input, #leakage-margin, #process-corner, #vdd-core-voltage, #vdd-sram-voltage, ' +
        '[id$="_slider"], [id$="_Util"], [id$="_Frequency"], [id$="_mode"], [id$="_modes"], ' +
        '[data-type="dropdown"]'
    ).forEach(el => {
        if (el.id) config[el.id] = el.value;
    });

    // Catch remaining form elements with IDs that we might have missed
    document.querySelectorAll('.config-sidebar input[id], .config-sidebar select[id]').forEach(el => {
        if (el.id && !(el.id in config)) config[el.id] = el.value;
    });

    return config;
}

/**
 * Apply a saved config back to the page and trigger recalculation.
 */
function applyConfig(config) {
    Object.entries(config).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = val;
        // Sync slider ↔ number pairs
        if (id.endsWith('_slider')) {
            const paired = document.getElementById(id.replace('_slider', ''));
            if (paired) paired.value = val;
        } else if (!id.endsWith('_slider')) {
            const slider = document.getElementById(id + '_slider');
            if (slider) slider.value = val;
        }
    });

    // Sync the temp label
    const tempEl = document.getElementById('temperature-input');
    const tempLabel = document.getElementById('temp-val');
    if (tempEl && tempLabel) tempLabel.textContent = tempEl.value;

    // Re-trigger power calculation after DOM settles.
    // Must call updateConfigFromUI (not just calculateAndUpdateUI) so that
    // appState.config is re-read from the freshly-set DOM values before calculating.
    setTimeout(() => {
        if (typeof window.updateConfigFromUI === 'function') {
            window.updateConfigFromUI();
        } else if (typeof window.calculateAndUpdateUI === 'function') {
            window.calculateAndUpdateUI();
        }
    }, 0);
}

// ---- Slot rendering ----

let activeSlotIndex = null;

let dragSrcIdx = null;

function renderSlots() {
    const container = document.getElementById('config-slots');
    if (!container) return;

    const configs = getAllConfigs();
    container.innerHTML = '';

    if (configs.length === 0) {
        container.innerHTML = '<span style="font-size:0.8rem;color:var(--text-muted);font-style:italic;">No saved configs</span>';
        return;
    }

    configs.forEach((cfg, idx) => {
        const chip = document.createElement('div');
        chip.className = 'config-slot' + (idx === activeSlotIndex ? ' active' : '');
        chip.title = `Load "${cfg.name}" · Drag to reorder`;
        chip.draggable = true;
        chip.dataset.idx = idx;

        const powerLabel = cfg.power != null ? `${Math.round(cfg.power)} mW` : '';

        chip.innerHTML = `
            <span class="slot-drag-handle" title="Drag to reorder">⠿</span>
            <span class="slot-name">${cfg.name}</span>
            ${powerLabel ? `<span class="slot-power">${powerLabel}</span>` : ''}
            <button class="config-slot-delete" title="Delete this config" data-idx="${idx}">✕</button>
        `;

        // Load on click (not on handle/delete)
        chip.addEventListener('click', (e) => {
            if (e.target.classList.contains('config-slot-delete')) return;
            if (e.target.classList.contains('slot-drag-handle')) return;
            activeSlotIndex = idx;
            applyConfig(cfg.values);
            renderSlots();
        });

        // Delete
        chip.querySelector('.config-slot-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSlot(idx);
        });

        // ---- Drag-and-drop ----
        chip.addEventListener('dragstart', (e) => {
            dragSrcIdx = idx;
            chip.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        chip.addEventListener('dragend', () => {
            chip.classList.remove('dragging');
            container.querySelectorAll('.config-slot').forEach(c => c.classList.remove('drag-over'));
        });

        chip.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            container.querySelectorAll('.config-slot').forEach(c => c.classList.remove('drag-over'));
            if (idx !== dragSrcIdx) chip.classList.add('drag-over');
        });

        chip.addEventListener('drop', (e) => {
            e.preventDefault();
            if (dragSrcIdx === null || dragSrcIdx === idx) return;

            const cfgs = getAllConfigs();
            const [moved] = cfgs.splice(dragSrcIdx, 1);
            cfgs.splice(idx, 0, moved);

            // Update activeSlotIndex to follow the moved config
            if (activeSlotIndex === dragSrcIdx) {
                activeSlotIndex = idx;
            } else {
                // Adjust for the shift
                const lo = Math.min(dragSrcIdx, idx);
                const hi = Math.max(dragSrcIdx, idx);
                if (activeSlotIndex >= lo && activeSlotIndex <= hi) {
                    activeSlotIndex += dragSrcIdx < idx ? -1 : 1;
                }
            }

            saveAllConfigs(cfgs);
            dragSrcIdx = null;
            renderSlots();
        });

        container.appendChild(chip);
    });
}

function deleteSlot(idx) {
    const configs = getAllConfigs();
    configs.splice(idx, 1);
    saveAllConfigs(configs);
    if (activeSlotIndex === idx) activeSlotIndex = null;
    else if (activeSlotIndex > idx) activeSlotIndex--;
    renderSlots();
}

// ---- Save ----

function saveCurrentConfig() {
    const configs = getAllConfigs();

    // Prompt for a name
    let defaultName = activeSlotIndex !== null && configs[activeSlotIndex]
        ? configs[activeSlotIndex].name
        : `Config ${configs.length + 1}`;
    const name = prompt('Name this configuration:', defaultName);
    if (name === null) return; // cancelled
    const trimmed = name.trim() || defaultName;

    // Safe parse: strip locale commas (e.g. "1,234") before parsing
    const parsePow = (el) => {
        if (!el) return null;
        const n = parseFloat(el.textContent.replace(/,/g, ''));
        return isNaN(n) ? null : n;
    };
    const powerSpan = document.getElementById('total-power-val');
    const staticSpan = document.getElementById('leakage-power-val');
    const dynSpan = document.getElementById('dynamic-power-val');
    const power = parsePow(powerSpan);
    const staticPower = parsePow(staticSpan);
    const dynamicPower = parsePow(dynSpan);

    const currentValues = captureCurrentConfig();
    const results = window.calculatePower ? window.calculatePower(currentValues) : { total: power, static: staticPower, dynamic: dynamicPower, rails: [] };

    const configData = {
        name: trimmed,
        power: results.total,
        static_mw: results.static,
        dynamic_mw: results.dynamic,
        rails: results.rails || [],
        values: currentValues
    };

    // Check if a config with this name already exists -- if so, overwrite it
    const existingIdx = configs.findIndex(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existingIdx !== -1) {
        configs[existingIdx] = configData;
        saveAllConfigs(configs);
        activeSlotIndex = existingIdx;
        renderSlots();
        return;
    }

    // Otherwise enforce slot limit
    if (configs.length >= MAX_SLOTS) {
        alert(`You already have ${MAX_SLOTS} saved configs. Please delete one first, or save with an existing name to overwrite it.`);
        return;
    }

    configs.push(configData);
    saveAllConfigs(configs);
    activeSlotIndex = configs.length - 1;
    renderSlots();
}

// ---- Export ----

function exportConfig() {
    const currentValues = captureCurrentConfig();
    const powerSpan = document.getElementById('total-power-val');
    const power = powerSpan ? parseFloat(powerSpan.textContent) : null;

    // Try to attach the active config name — but only if the current settings
    // match the saved slot (i.e. the user hasn't modified it since loading).
    let configName = null;
    const configs = getAllConfigs();
    if (activeSlotIndex !== null && configs[activeSlotIndex]) {
        const saved = configs[activeSlotIndex];
        const savedKeys = Object.keys(saved.values || {});
        const isUnmodified = savedKeys.every(k => String(currentValues[k]) === String(saved.values[k]));
        if (isUnmodified) configName = saved.name;
    }

    const results = window.calculatePower ? window.calculatePower(currentValues) : { total: power, static: null, dynamic: null, rails: [] };

    const data = {
        tool: 'TI AM62x Power Estimator',
        exported: new Date().toISOString(),
        ...(configName ? { name: configName } : {}),
        power_mw: results.total,
        static_mw: results.static,
        dynamic_mw: results.dynamic,
        rails: results.rails || [],
        config: currentValues
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Use config name in filename if available, otherwise fall back to date
    const safeName = configName
        ? configName.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase()
        : new Date().toISOString().slice(0, 10);
    a.download = `pet_${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ---- Import ----

function importConfig(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            const values = data.config || data; // support bare config objects too
            const configs = getAllConfigs();

            if (configs.length >= MAX_SLOTS) {
                alert(`You already have ${MAX_SLOTS} saved configs. Please delete one first.`);
                return;
            }

            const name = prompt('Name for imported config:', file.name.replace('.json', ''));
            if (name === null) return;

            configs.push({ name: name.trim() || file.name, power: data.power_mw || null, values });
            saveAllConfigs(configs);
            activeSlotIndex = configs.length - 1;
            applyConfig(values);
            renderSlots();
        } catch (err) {
            alert('Failed to parse JSON config file: ' + err.message);
        }
    };
    reader.readAsText(file);
}

// ---- Compare Panel ----

let compareChartInstance = null;

// Track which configs are checked for comparison (by index)
let compareChecked = new Set();

let compareChartType = 'grouped'; // 'grouped' | 'sidebyside' | 'stacked'

// Per-config palette for side-by-side mode (each config gets a distinct color)
const CFG_COLORS = [
    'rgba(204,0,0,VAL)',
    'rgba(52,152,219,VAL)',
    'rgba(39,174,96,VAL)',
    'rgba(155,89,182,VAL)',
    'rgba(230,126,34,VAL)',
    'rgba(26,188,156,VAL)',
];
function cfgColor(i, alpha) { return CFG_COLORS[i % CFG_COLORS.length].replace('VAL', alpha); }

function buildCompareChart(configs, selectedIndices, chartType) {
    const ctx = document.getElementById('compare-bar-chart');
    if (!ctx) return;

    if (compareChartInstance) { compareChartInstance.destroy(); compareChartInstance = null; }

    const selected = selectedIndices.map(i => configs[i]);
    if (selected.length === 0) return;

    const isStacked = chartType === 'stacked';
    const isSideBySide = chartType === 'sidebyside';
    const showRails = document.getElementById('compare-show-rails')?.checked;

    let labels, datasets;

    if (showRails) {
        // Rail-level comparison
        // Collect all unique rail names across selected configs
        const allRailNames = new Set();
        selected.forEach(cfg => {
            if (cfg.rails) cfg.rails.forEach(r => allRailNames.add(r.name));
        });
        const railLabels = Array.from(allRailNames);

        if (isSideBySide) {
            labels = railLabels;
            datasets = selected.map((cfg, i) => {
                const origIdx = selectedIndices[i];
                const α = origIdx === activeSlotIndex ? '0.88' : '0.58';
                return {
                    label: cfg.name,
                    data: railLabels.map(name => {
                        const r = cfg.rails?.find(r => r.name === name);
                        return r ? r.power : 0;
                    }),
                    backgroundColor: cfgColor(i, α),
                    borderColor: cfgColor(i, '1'),
                    borderWidth: 1,
                    borderRadius: 4
                };
            });
        } else {
            labels = selected.map(c => c.name);
            datasets = railLabels.map((name, i) => {
                const hue = (i * 360 / railLabels.length);
                const color = `hsl(${hue}, 70%, 50%)`;
                return {
                    label: name,
                    data: selected.map(cfg => {
                        const r = cfg.rails?.find(r => r.name === name);
                        return r ? r.power : 0;
                    }),
                    backgroundColor: color,
                    borderColor: color,
                    borderWidth: 1,
                    stack: isStacked ? 'p' : undefined,
                    borderRadius: isStacked ? 0 : 4
                };
            });
            if (isStacked && datasets.length > 0) datasets[datasets.length - 1].borderRadius = 4;
        }
    } else if (isSideBySide) {
        // Transposed: X = [Total, Static, Dynamic], one dataset per config
        labels = ['Total Power', 'Static (Leakage)', 'Dynamic'];
        datasets = selected.map((cfg, i) => {
            const origIdx = selectedIndices[i];
            const alpha = origIdx === activeSlotIndex ? '0.88' : '0.58';
            const bg = cfgColor(i, alpha);
            const border = cfgColor(i, '1');
            return {
                label: cfg.name,
                data: [cfg.power ?? 0, cfg.static_mw ?? 0, cfg.dynamic_mw ?? 0],
                backgroundColor: bg,
                borderColor: border,
                borderWidth: 1,
                borderRadius: 4
            };
        });
    } else {
        // Grouped or Stacked: X = config names
        labels = selected.map(c => c.name);
        const totalData = selected.map(c => c.power ?? 0);
        const staticData = selected.map(c => c.static_mw ?? 0);
        const dynData = selected.map(c => c.dynamic_mw ?? 0);

        const α = (i) => selectedIndices[i] === activeSlotIndex ? '0.90' : '0.55';
        const tc = selected.map((_, i) => `rgba(204,0,0,${α(i)})`);
        const sc = selected.map((_, i) => `rgba(230,126,34,${α(i)})`);
        const dc = selected.map((_, i) => `rgba(52,152,219,${α(i)})`);

        datasets = isStacked
            ? [
                { label: 'Static (Leakage)', data: staticData, backgroundColor: sc, borderColor: sc.map(c => c.replace(/[\d.]+\)$/, '1)')), borderWidth: 1, borderRadius: 0, stack: 'p' },
                { label: 'Dynamic', data: dynData, backgroundColor: dc, borderColor: dc.map(c => c.replace(/[\d.]+\)$/, '1)')), borderWidth: 1, borderRadius: 4, stack: 'p' }
            ]
            : [
                { label: 'Total Power', data: totalData, backgroundColor: tc, borderColor: tc.map(c => c.replace(/[\d.]+\)$/, '1)')), borderWidth: 1, borderRadius: 4 },
                { label: 'Static (Leakage)', data: staticData, backgroundColor: sc, borderColor: sc.map(c => c.replace(/[\d.]+\)$/, '1)')), borderWidth: 1, borderRadius: 4 },
                { label: 'Dynamic', data: dynData, backgroundColor: dc, borderColor: dc.map(c => c.replace(/[\d.]+\)$/, '1)')), borderWidth: 1, borderRadius: 4 }
            ];
    }

    compareChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { font: { family: "'Inter',sans-serif", size: 10 }, boxWidth: 10 } },
                tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.parsed.y.toFixed(1)} mW` } }
            },
            scales: {
                x: { stacked: isStacked, grid: { display: false } },
                y: {
                    stacked: isStacked,
                    title: { display: true, text: 'Power (mW)', font: { family: "'Inter',sans-serif" } },
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.06)' }
                }
            }
        }
    });
}

function openCompareModal() {
    const configs = getAllConfigs();
    const panel = document.getElementById('compare-panel');
    if (!panel) return;

    // Toggle closed
    if (panel.style.display !== 'none') {
        closeComparePanel();
        return;
    }

    if (configs.length < 1) {
        alert('Save at least one config to compare.');
        return;
    }

    // Default: all configs checked
    compareChecked = new Set(configs.map((_, i) => i));

    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Ensure toggle is wired up
    const showRailsToggle = document.getElementById('compare-show-rails');
    if (showRailsToggle) {
        showRailsToggle.onchange = () => {
            renderCompareTable();
            buildCompareChart(configs, [...compareChecked].sort((a, b) => a - b), compareChartType);
        };
    }

    // ---- Render table ----
    function renderCompareTable() {
        const tbody = document.getElementById('compare-table-body');
        const thead = document.querySelector('.cmp-table thead tr');
        if (!tbody || !thead) return;

        const showRails = document.getElementById('compare-show-rails')?.checked;

        // Determine all unique rail names
        const allRailNames = new Set();
        configs.forEach(cfg => {
            if (cfg.rails) cfg.rails.forEach(r => allRailNames.add(r.name));
        });
        const railLabels = Array.from(allRailNames).sort();

        // Update header
        let headerHtml = `
            <th class="cmp-drag-handle-col"></th>
            <th class="cmp-check-col"><input type="checkbox" id="cmp-select-all" ${compareChecked.size === configs.length ? 'checked' : ''}></th>
            <th class="cmp-name-cell">Configuration</th>
            <th class="cmp-val">Total</th>
            <th class="cmp-val">Static</th>
            <th class="cmp-val">Dynamic</th>
        `;
        if (showRails) {
            railLabels.forEach(name => headerHtml += `<th class="cmp-val">${name}</th>`);
        }
        headerHtml += `<th class="cmp-actions-col">Actions</th>`;
        thead.innerHTML = headerHtml;

        // Select All listener
        const selAll = document.getElementById('cmp-select-all');
        if (selAll) selAll.onclick = () => {
            if (selAll.checked) compareChecked = new Set(configs.map((_, i) => i));
            else compareChecked.clear();
            renderCompareTable();
            buildCompareChart(configs, [...compareChecked].sort((a, b) => a - b), compareChartType);
        };

        const selArr = [...compareChecked].sort((a, b) => a - b);
        const baseIdx = compareChecked.has(activeSlotIndex) ? activeSlotIndex : (selArr[0] ?? null);
        const base = baseIdx !== null ? configs[baseIdx] : null;

        function fmtDelta(val, bVal) {
            if (val == null || bVal == null) return '';
            const d = val - bVal;
            if (Math.abs(d) < 0.05) return '';
            const cls = d > 0 ? 'cmp-up' : 'cmp-down';
            return ` <span class="cmp-delta ${cls}">${d > 0 ? '+' : ''}${d.toFixed(1)}</span>`;
        }

        let cmpDragSrc = null;

        tbody.innerHTML = configs.map((cfg, idx) => {
            const isActive = idx === activeSlotIndex;
            const isBase = idx === baseIdx;
            const checked = compareChecked.has(idx);
            const total = cfg.power != null ? cfg.power.toFixed(1) : '--';
            const stat = cfg.static_mw != null ? cfg.static_mw.toFixed(1) : '--';
            const dyn = cfg.dynamic_mw != null ? cfg.dynamic_mw.toFixed(1) : '--';
            const dT = (base && !isBase) ? fmtDelta(cfg.power, base.power) : '';
            const dS = (base && !isBase) ? fmtDelta(cfg.static_mw, base.static_mw) : '';
            const dD = (base && !isBase) ? fmtDelta(cfg.dynamic_mw, base.dynamic_mw) : '';

            let railCells = '';
            if (showRails) {
                railLabels.forEach(name => {
                    const r = cfg.rails?.find(rail => rail.name === name);
                    const rb = base?.rails?.find(rail => rail.name === name);
                    const val = r ? r.power.toFixed(1) : '--';
                    const delta = (base && !isBase && r && rb) ? fmtDelta(r.power, rb.power) : '';
                    railCells += `<td class="cmp-val">${val}<span class="cmp-unit"> mW</span>${delta}</td>`;
                });
            }

            return `<tr class="cmp-draggable-row ${isActive ? 'cmp-active-row' : ''} ${!checked ? 'cmp-unchecked-row' : ''}" data-idx="${idx}" draggable="true">
                <td class="cmp-drag-handle-col"><span class="cmp-drag-handle" title="Drag to reorder">⠿</span></td>
                <td class="cmp-check-col"><input type="checkbox" class="cmp-row-check" data-idx="${idx}" ${checked ? 'checked' : ''}></td>
                <td class="cmp-name-cell">
                    <span class="cmp-name">${cfg.name}</span>
                    ${isActive ? '<span class="cmp-active-badge">active</span>' : ''}
                    ${(isBase && !isActive) ? '<span class="cmp-base-badge">baseline</span>' : ''}
                </td>
                <td class="cmp-val">${total}<span class="cmp-unit"> mW</span>${dT}</td>
                <td class="cmp-val">${stat}<span class="cmp-unit"> mW</span>${dS}</td>
                <td class="cmp-val">${dyn}<span class="cmp-unit"> mW</span>${dD}</td>
                ${railCells}
                <td class="cmp-actions-col">
                    <button class="cmp-load-btn" data-idx="${idx}">${isActive ? '✓ Active' : 'Load'}</button>
                </td>
            </tr>`;
        }).join('');

        // ---- Drag-and-drop row reorder ----
        tbody.querySelectorAll('.cmp-draggable-row').forEach(row => {
            row.addEventListener('dragstart', (e) => {
                cmpDragSrc = parseInt(row.dataset.idx);
                row.classList.add('cmp-row-dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            row.addEventListener('dragend', () => {
                row.classList.remove('cmp-row-dragging');
                tbody.querySelectorAll('.cmp-draggable-row').forEach(r => r.classList.remove('cmp-row-drag-over'));
            });
            row.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                tbody.querySelectorAll('.cmp-draggable-row').forEach(r => r.classList.remove('cmp-row-drag-over'));
                if (parseInt(row.dataset.idx) !== cmpDragSrc) row.classList.add('cmp-row-drag-over');
            });
            row.addEventListener('drop', (e) => {
                e.preventDefault();
                const dropIdx = parseInt(row.dataset.idx);
                if (cmpDragSrc === null || cmpDragSrc === dropIdx) return;

                // Reorder configs
                const [moved] = configs.splice(cmpDragSrc, 1);
                configs.splice(dropIdx, 0, moved);
                saveAllConfigs(configs);

                // Adjust activeSlotIndex
                if (activeSlotIndex === cmpDragSrc) {
                    activeSlotIndex = dropIdx;
                } else {
                    const lo = Math.min(cmpDragSrc, dropIdx);
                    const hi = Math.max(cmpDragSrc, dropIdx);
                    if (activeSlotIndex >= lo && activeSlotIndex <= hi)
                        activeSlotIndex += cmpDragSrc < dropIdx ? -1 : 1;
                }

                // Rebuild compareChecked for new indices
                const newChecked = new Set();
                configs.forEach((_, newI) => {
                    // find old index this config came from
                    const oldI = (() => {
                        if (newI === dropIdx) return cmpDragSrc;
                        if (cmpDragSrc < dropIdx) {
                            if (newI >= cmpDragSrc && newI < dropIdx) return newI + 1;
                        } else {
                            if (newI > dropIdx && newI <= cmpDragSrc) return newI - 1;
                        }
                        return newI;
                    })();
                    if (compareChecked.has(oldI)) newChecked.add(newI);
                });
                compareChecked = newChecked;

                cmpDragSrc = null;
                renderSlots();
                renderCompareTable();
                buildCompareChart(configs, [...compareChecked].sort((a, b) => a - b), compareChartType);
            });
        });

        // Checkbox listeners
        tbody.querySelectorAll('.cmp-row-check').forEach(cb => {
            cb.addEventListener('change', () => {
                const i = parseInt(cb.dataset.idx);
                if (cb.checked) compareChecked.add(i); else compareChecked.delete(i);
                const allChk = document.getElementById('cmp-select-all');
                if (allChk) allChk.checked = compareChecked.size === configs.length;
                renderCompareTable();
                buildCompareChart(configs, [...compareChecked].sort((a, b) => a - b), compareChartType);
            });
        });

        // Load button listeners
        tbody.querySelectorAll('.cmp-load-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx);
                activeSlotIndex = idx;
                applyConfig(configs[idx].values);
                renderSlots();
                renderCompareTable();
                buildCompareChart(configs, [...compareChecked].sort((a, b) => a - b), compareChartType);
            });
        });
    }

    // ---- Chart type toggle (Grouped / Side-by-side / Stacked) ----
    function refreshChart() {
        buildCompareChart(configs, [...compareChecked].sort((a, b) => a - b), compareChartType);
    }

    const btnGrouped = document.getElementById('cmp-type-grouped');
    const btnSideBySide = document.getElementById('cmp-type-sidebyside');
    const btnStacked = document.getElementById('cmp-type-stacked');
    const allTypeBtns = [btnGrouped, btnSideBySide, btnStacked].filter(Boolean);

    function setChartType(type) {
        compareChartType = type;
        allTypeBtns.forEach(b => b.classList.remove('active'));
        const target = document.getElementById(`cmp-type-${type}`);
        if (target) target.classList.add('active');
        refreshChart();
    }

    // Set initial active state
    allTypeBtns.forEach(b => b.classList.remove('active'));
    document.getElementById(`cmp-type-${compareChartType}`)?.classList.add('active');

    if (btnGrouped) btnGrouped.onclick = () => setChartType('grouped');
    if (btnSideBySide) btnSideBySide.onclick = () => setChartType('sidebyside');
    if (btnStacked) btnStacked.onclick = () => setChartType('stacked');

    renderCompareTable();
    refreshChart();
}

function closeComparePanel() {
    const panel = document.getElementById('compare-panel');
    if (panel) panel.style.display = 'none';
    if (compareChartInstance) { compareChartInstance.destroy(); compareChartInstance = null; }
}


// ---- Wire up ----

document.addEventListener('DOMContentLoaded', () => {
    renderSlots();

    document.getElementById('btn-save-config')?.addEventListener('click', saveCurrentConfig);
    document.getElementById('btn-export-config')?.addEventListener('click', exportConfig);
    document.getElementById('btn-compare-configs')?.addEventListener('click', openCompareModal);
    document.getElementById('compare-panel-close')?.addEventListener('click', closeComparePanel);

    document.getElementById('import-config-input')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            importConfig(file);
            e.target.value = '';
        }
    });
});

// Expose so power-estimator.js can update the slot power after recalculation
window.PET_ConfigManager = { renderSlots, activeSlotIndex: () => activeSlotIndex };
