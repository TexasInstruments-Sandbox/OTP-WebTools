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
        const dropdowns = window.TI_AM62X_DROPDOWNS || {};
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
        updateConfigFromUI();
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
