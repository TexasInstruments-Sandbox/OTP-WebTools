/**
 * power-estimator.js
 * 
 * Core logic for the Power Estimation Tool UI.
 * Handles parsing the DOM inputs (which mirror the Excel CSV layout)
 * and triggering calculations from the exact mapped equations.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- State Management ---
    const appState = {
        activeSoc: null,
        config: {} // populated dynamically by scanning DOM
    };

    // --- DOM Elements ---
    const elements = {
        socSelect: document.getElementById('soc-select'),

        // Results
        valTotal: document.getElementById('total-power-val'),
        valStatic: document.getElementById('leakage-power-val'),
        valDynamic: document.getElementById('dynamic-power-val')
    };

    // --- Initialization ---
    function init() {
        populateSocDropdown();
        populateControlPanelDropdowns();

        // Select first SoC by default
        if (Object.keys(window.TI_SOC_DATA || {}).length > 0) {
            const firstSocId = Object.keys(window.TI_SOC_DATA)[0];
            if (elements.socSelect) elements.socSelect.value = firstSocId;
            loadSoc(firstSocId);
        }

        bindEvents();
    }

    function populateSocDropdown() {
        if (!elements.socSelect) return;
        elements.socSelect.innerHTML = '';
        if (!window.TI_SOC_DATA || Object.keys(window.TI_SOC_DATA).length === 0) {
            elements.socSelect.innerHTML = '<option value="">No SoCs Loaded</option>';
            return;
        }
        for (const [id, data] of Object.entries(window.TI_SOC_DATA)) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = data.name;
            elements.socSelect.appendChild(option);
        }
    }

    function populateControlPanelDropdowns() {
        // Get device-specific dropdowns based on active SoC
        let dropdowns = {};
        if (appState.activeSoc) {
            const socId = appState.activeSoc.id;
            if (socId === 'am62x') {
                dropdowns = window.TI_AM62X_DROPDOWNS || {};
            } else if (socId === 'am62p') {
                dropdowns = window.TI_AM62P_DROPDOWNS || {};
            }
        } else {
            // Fallback to AM62X dropdowns if no SoC is loaded
            dropdowns = window.TI_AM62X_DROPDOWNS || {};
        }
        const availableLists = Object.keys(dropdowns);

        // Find all UI selects that represent IP Modes
        const selects = document.querySelectorAll('select[data-type="dropdown"]');
        selects.forEach(select => {
            const sid = select.id.toLowerCase();
            let matchedKey = null;

            if (dropdowns[select.id]) {
                matchedKey = select.id;
            } else {
                // Heuristic match since IDs now match Excel Named Ranges
                if (sid.includes('uart')) matchedKey = 'uart_modes';
                else if (sid.includes('spi')) matchedKey = 'spi_modes';
                else if (sid.includes('fssul') || sid.includes('ospi')) matchedKey = 'fssul_modes';
                else if (sid.includes('gpmc')) matchedKey = 'gpmc_modes';
                else if (sid.includes('vout') || sid.includes('oldi') || sid.includes('dpi')) matchedKey = 'dpi_modes';
                else if (sid.includes('cpsw') || sid.includes('ethernet')) matchedKey = 'ethernet_modes';
                else if (sid.includes('mcasp')) matchedKey = 'mcasp_modes';
                else if (sid.includes('icssm') || sid.includes('pru_ss')) matchedKey = 'icssm_modes';
                else if (sid.includes('ddr')) matchedKey = 'lpddr4_1600_16';
                else if (sid.includes('usb')) matchedKey = 'serdes_10g_lane_modes';
                else if (sid.includes('mmc') || sid.includes('sd')) matchedKey = 'sdio_modes';
                else if (sid.includes('csi')) matchedKey = 'dphy_rx_modes';
            }

            const dropdownData = dropdowns[matchedKey];
            if (dropdownData) {
                select.innerHTML = dropdownData.map(opt => `<option value="${opt.id}" title="${opt.description || ''}">${opt.label}</option>`).join('');

                // If a default is specified in the HTML, select it
                const def = select.getAttribute('data-default');
                if (def && dropdownData.some(opt => opt.id === def)) {
                    select.value = def;
                }
            } else {
                select.innerHTML = `<option value="">Default</option>`;
            }
        });
    }

    // --- Core Logic ---
    function loadSoc(socId) {
        const socData = window.TI_SOC_DATA[socId];
        if (!socData) return;

        appState.activeSoc = socData;
        window.calculatePower = socData.calculatePower; // Expose globally for config-manager.js

        // Populate processor inputs dynamically based on SoCDB
        populateProcessorInputs(socId);

        // Repopulate dropdowns with device-specific options
        populateControlPanelDropdowns();

        updateConfigFromUI();
    }

    function populateProcessorInputs(socId) {
        // Get SoCDB for this device
        let socdb = null;
        if (socId === 'am62x' && window.TI_AM62X_SOCDB) {
            socdb = window.TI_AM62X_SOCDB;
        } else if (socId === 'am62p' && window.TI_AM62P_SOCDB) {
            socdb = window.TI_AM62P_SOCDB;
        }

        if (!socdb) return;

        // Extract processor components from SoCDB
        const processors = [];
        for (const [key, component] of Object.entries(socdb)) {
            if (component.function && (
                component.function.includes('ARM_MPU') ||
                component.function.includes('ARM_MCU') ||
                component.function === 'GPU' ||
                component.function === 'DSP'
            )) {
                processors.push({
                    key: key,
                    name: component.physical_name || key,
                    instance: component.instance_name || '',
                    function: component.function,
                    type: component.type
                });
            }
        }

        // Sort processors: ARM_MPU first, then ARM_MCU, then GPU, then others
        processors.sort((a, b) => {
            const order = { 'ARM_MPU': 0, 'ARM_MCU': 1, 'GPU': 2, 'DSP': 3 };
            const aOrder = order[a.function] !== undefined ? order[a.function] : 4;
            const bOrder = order[b.function] !== undefined ? order[b.function] : 4;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return a.key.localeCompare(b.key);
        });

        // Populate frequency container
        const freqContainer = document.getElementById('processor-frequency-container');
        if (freqContainer) {
            freqContainer.innerHTML = '';

            // Group A53 cores together - they share the same frequency
            const a53Cores = processors.filter(p => p.function === 'ARM_MPU');
            const nonA53Procs = processors.filter(p => p.function !== 'ARM_MPU');

            // Add single A53 frequency dropdown if A53 cores exist
            if (a53Cores.length > 0) {
                const freqOptions = getFrequencyOptions(a53Cores[0], socId);
                const row = document.createElement('div');
                row.className = 'dense-row two-col';
                row.innerHTML = `
                    <span class="dense-label">A53 MPU (All Cores)</span>
                    <select id="MPU_A53_Frequency" class="dense-input form-select dynamic-opp" data-default="${freqOptions.default}">
                        ${freqOptions.options.map(opt => `<option value="${opt}" ${opt === freqOptions.default ? 'selected' : ''}>${opt} MHz</option>`).join('')}
                    </select>
                `;
                freqContainer.appendChild(row);
            }

            // Add other processor frequencies (MCU, GPU, DSP, etc)
            nonA53Procs.forEach(proc => {
                const label = formatProcessorLabel(proc);
                const freqOptions = getFrequencyOptions(proc, socId);

                const row = document.createElement('div');
                row.className = 'dense-row two-col';
                row.innerHTML = `
                    <span class="dense-label">${label}</span>
                    <select id="${proc.key}_Frequency" class="dense-input form-select dynamic-opp" data-default="${freqOptions.default}">
                        ${freqOptions.options.map(opt => `<option value="${opt}" ${opt === freqOptions.default ? 'selected' : ''}>${opt} MHz</option>`).join('')}
                    </select>
                `;
                freqContainer.appendChild(row);
            });
        }

        // Populate utilization container
        const utilContainer = document.getElementById('processor-utilization-container');
        if (utilContainer) {
            utilContainer.innerHTML = '';

            // Track ARM_MPU core index for sequential labeling
            let mpuCoreIndex = 0;

            processors.forEach(proc => {
                const label = formatProcessorLabel(proc, mpuCoreIndex);

                // Increment counter for ARM_MPU cores
                if (proc.function === 'ARM_MPU') {
                    mpuCoreIndex++;
                }

                const defaultUtil = proc.function === 'ARM_MPU' && mpuCoreIndex === 1 ? 100 : 1;

                const row = document.createElement('div');
                row.className = 'dense-row two-col';
                row.innerHTML = `
                    <span class="dense-label">${label}</span>
                    <div style="display:flex; align-items:center; gap: 4px; width: 100%;">
                        <input type="range" id="${proc.key}_Util_slider" min="0" max="100" value="${defaultUtil}"
                            class="dense-slider" style="flex:1; width:50px;">
                        <input type="number" id="${proc.key}_Util" class="dense-input form-number" value="${defaultUtil}"
                            style="width: 55px; padding: 0.1rem; text-align: right;">
                    </div>
                `;
                utilContainer.appendChild(row);
            });
        }

        // Rebind events for the new inputs
        bindSliderEvents();
    }

    function formatProcessorLabel(proc, mpuCoreIndex) {
        // Format processor label for display
        if (proc.function === 'ARM_MPU') {
            // A53 cores: use sequential index to avoid duplicates
            // mpuCoreIndex is passed in and incremented for each ARM_MPU
            if (mpuCoreIndex !== undefined) {
                return `A53-${mpuCoreIndex}`;
            }
            // Fallback to instance name if index not provided
            const coreNum = proc.instance.replace('_', '');
            return `A53-${coreNum}`;
        } else if (proc.function === 'ARM_MCU') {
            // MCU cores: show physical name
            if (proc.name.includes('m4')) {
                return 'MCU M4F';
            } else if (proc.name.includes('pulsar')) {
                return 'R5F';
            } else if (proc.name.includes('dm')) {
                return 'Domain Manager';
            }
            return 'MCU';
        } else if (proc.function === 'GPU') {
            return 'GPU';
        } else if (proc.function === 'DSP') {
            return 'DSP';
        }
        return proc.name;
    }

    function getFrequencyOptions(proc, socId) {
        // Define frequency options for each processor type
        // These should ideally come from the Excel OPP data, but for now use reasonable defaults

        if (proc.function === 'ARM_MPU') {
            // A53 cores
            if (socId === 'am62x') {
                return { options: [1400, 1250, 1000, 800, 250, 0], default: 1250 };
            } else if (socId === 'am62p') {
                return { options: [1400, 1250, 1000, 800, 250, 0], default: 1250 };
            }
        } else if (proc.function === 'ARM_MCU') {
            // MCU cores (M4F, Pulsar, DM)
            return { options: [800, 400, 0], default: 400 };
        } else if (proc.function === 'GPU') {
            return { options: [800, 500, 250, 0], default: 0 };
        } else if (proc.function === 'DSP') {
            return { options: [1000, 750, 500, 0], default: 500 };
        }

        return { options: [400, 200, 0], default: 400 };
    }

    function bindSliderEvents() {
        // Bind slider-to-input sync events
        const sliders = document.querySelectorAll('.dense-slider');
        sliders.forEach(slider => {
            const inputId = slider.id.replace('_slider', '');
            const input = document.getElementById(inputId);

            if (input) {
                slider.addEventListener('input', (e) => {
                    input.value = e.target.value;
                    updateConfigFromUI();
                });

                input.addEventListener('input', (e) => {
                    slider.value = e.target.value;
                    updateConfigFromUI();
                });
            }
        });
    }

    function updateConfigFromUI() {
        appState.config = {}; // reset

        // Scan ALL inputs and selects across the entire grid (sidebar + main)
        const inputs = document.querySelectorAll('.power-app-grid input, .power-app-grid select');
        inputs.forEach(el => {
            if (el.id) {
                if (el.type === 'number' || el.type === 'range') {
                    appState.config[el.id] = parseFloat(el.value);
                } else if (el.type === 'checkbox') {
                    appState.config[el.id] = el.checked;
                } else {
                    appState.config[el.id] = el.value;
                }
            }
        });

        calculateAndUpdateUI();
    }

    // Global chart instances
    let breakdownChart = null;
    let staticDynamicChart = null;
    let categoryBarChart = null;

    function calculateAndUpdateUI() {
        if (!appState.activeSoc || !appState.activeSoc.calculatePower) return;

        const results = appState.activeSoc.calculatePower(appState.config);

        // Update Stat Cards if they exist
        if (elements.valTotal) elements.valTotal.textContent = results.total.toLocaleString();
        if (elements.valStatic) elements.valStatic.textContent = results.static.toLocaleString();
        if (elements.valDynamic) elements.valDynamic.textContent = results.dynamic.toLocaleString();

        // Update Power Supply Table
        const railBody = document.getElementById('rail-summary-body');
        if (railBody && results.rails) {
            railBody.innerHTML = results.rails.map(rail => `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 0.5rem; font-weight: 600;">${rail.name}</td>
                    <td style="padding: 0.5rem;">${rail.voltage.toFixed(2)} V</td>
                    <td style="padding: 0.5rem; text-align: right;">${rail.power.toFixed(1)}</td>
                </tr>
            `).join('');
        }

        // Update Chart.js Visualizations
        const showRails = document.getElementById('main-show-rails')?.checked;

        let chartLabels;
        let chartDataVals;
        let chartColors;
        let breakdownChartTitle = 'Category Breakdown';
        let categoryBarChartTitle = 'Power by Category (mW)';

        if (showRails && results.rails && results.rails.length > 0) {
            chartLabels = results.rails.map(item => item.name);
            chartDataVals = results.rails.map(item => item.power);
            chartColors = results.rails.map((_, i) => `hsl(${(i * 360 / results.rails.length)}, 70%, 50%)`);
            breakdownChartTitle = 'Power by Rail';
            categoryBarChartTitle = 'Power by Rail (mW)';
        } else if (results.breakdown && results.breakdown.length > 0) {
            chartLabels = results.breakdown.map(item => item.label);
            chartDataVals = results.breakdown.map(item => item.value);
            chartColors = [
                '#cc0000', // Core Static
                '#ff6b6b', // IO Static
                '#4dabf7', // CPU Dynamic
                '#38d9a9', // GPU Dynamic
                '#ffd43b', // IO Dynamic
                '#adb5bd'  // Other Dynamic
            ];
        }

        const tooltipConfig = {
            callbacks: {
                label: function (context) {
                    let label = context.dataset.label || context.label || '';
                    if (label) label += ': ';
                    if (context.parsed !== null) {
                        label += new Intl.NumberFormat().format(context.parsed.x !== undefined ? context.parsed.x : context.parsed) + ' mW';
                    }
                    return label;
                }
            }
        };

        // 1. Breakdown Doughnut Chart
        const ctxDoughnut = document.getElementById('power-breakdown-chart');
        if (ctxDoughnut) {
            if (breakdownChart) {
                breakdownChart.data.labels = chartLabels;
                breakdownChart.data.datasets[0].data = chartDataVals;
                breakdownChart.data.datasets[0].backgroundColor = chartColors;
                breakdownChart.options.plugins.title.text = breakdownChartTitle;
                breakdownChart.update();
            } else {
                breakdownChart = new Chart(ctxDoughnut, {
                    type: 'doughnut',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            data: chartDataVals,
                            backgroundColor: chartColors,
                            hoverOffset: 4,
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: { display: true, text: breakdownChartTitle, font: { family: "'Inter', sans-serif" } },
                            legend: { display: false },
                            tooltip: tooltipConfig
                        },
                        cutout: '70%'
                    }
                });
            }
        }

        // 2. Static vs Dynamic Pie Chart
        const ctxPie = document.getElementById('static-dynamic-chart');
        if (ctxPie) {
            const sdData = [results.static, results.dynamic];
            const sdColors = ['#ff6b6b', '#4dabf7'];

            if (staticDynamicChart) {
                staticDynamicChart.data.datasets[0].data = sdData;
                staticDynamicChart.update();
            } else {
                staticDynamicChart = new Chart(ctxPie, {
                    type: 'pie',
                    data: {
                        labels: ['Static Power', 'Dynamic Power'],
                        datasets: [{
                            data: sdData,
                            backgroundColor: sdColors,
                            hoverOffset: 4,
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: { display: true, text: 'Static vs Dynamic', font: { family: "'Inter', sans-serif" } },
                            legend: { display: true, position: 'bottom', labels: { font: { family: "'Inter', sans-serif", size: 10 } } },
                            tooltip: tooltipConfig
                        }
                    }
                });
            }
        }

        // 3. Category Horizontal Bar Chart
        const ctxBar = document.getElementById('category-bar-chart');
        if (ctxBar) {
            if (categoryBarChart) {
                categoryBarChart.data.labels = chartLabels;
                categoryBarChart.data.datasets[0].data = chartDataVals;
                categoryBarChart.data.datasets[0].backgroundColor = chartColors;
                categoryBarChart.options.plugins.title.text = categoryBarChartTitle;
                categoryBarChart.update();
            } else {
                categoryBarChart = new Chart(ctxBar, {
                    type: 'bar',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: 'Power (mW)',
                            data: chartDataVals,
                            backgroundColor: chartColors,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { beginAtZero: true, grid: { display: false } },
                            y: { grid: { display: false } }
                        },
                        plugins: {
                            title: { display: true, text: categoryBarChartTitle, font: { family: "'Inter', sans-serif" } },
                            legend: { display: false },
                            tooltip: tooltipConfig
                        }
                    }
                });
            }
        }

        // Notify config manager to refresh active slot's power badge
        if (window.PET_ConfigManager) {
            const activeIdx = window.PET_ConfigManager.activeSlotIndex();
            if (activeIdx !== null) {
                try {
                    const configs = JSON.parse(localStorage.getItem('ti_pet_configs') || '[]');
                    if (configs[activeIdx]) {
                        configs[activeIdx].power = results.total;
                        localStorage.setItem('ti_pet_configs', JSON.stringify(configs));
                        window.PET_ConfigManager.renderSlots();
                    }
                } catch (_) { }
            }
        }
    }

    // --- Event Listeners ---
    function bindEvents() {
        if (elements.socSelect) {
            elements.socSelect.addEventListener('change', (e) => {
                loadSoc(e.target.value);
            });
        }

        const tempRange = document.getElementById('temperature-input');
        const tempNum = document.getElementById('temp-num');
        const tempVal = document.getElementById('temp-val');

        if (tempRange && tempNum && tempVal) {
            tempRange.addEventListener('input', (e) => {
                tempNum.value = e.target.value;
                tempVal.textContent = e.target.value;
            });
            tempNum.addEventListener('input', (e) => {
                tempRange.value = e.target.value;
                tempVal.textContent = e.target.value;
            });
        }

        const showRailsToggle = document.getElementById('main-show-rails');
        if (showRailsToggle) {
            showRailsToggle.addEventListener('change', () => {
                calculateAndUpdateUI();
            });
        }

        // We use event delegation for any change in the grid
        const grid = document.querySelector('.power-app-grid');
        if (grid) {
            grid.addEventListener('change', (e) => {
                syncSliders(e.target);
                updateConfigFromUI();
            });
            grid.addEventListener('input', (e) => {
                syncSliders(e.target);
                updateConfigFromUI();
            }); // catches slider/number fast typing
        }
    }

    function syncSliders(target) {
        if (!target.id) return;
        if (target.id.endsWith('_slider')) {
            const baseId = target.id.replace('_slider', '');
            const numInput = document.getElementById(baseId);
            if (numInput) numInput.value = target.value;
        } else if (target.type === 'number') {
            const sliderInput = document.getElementById(target.id + '_slider');
            if (sliderInput) sliderInput.value = target.value;
        }
    }

    // Boot the app
    init();

    // Expose globally so config-manager.js can invoke a full re-scan + recalculation
    window.calculateAndUpdateUI = calculateAndUpdateUI;
    window.updateConfigFromUI = updateConfigFromUI;
});
