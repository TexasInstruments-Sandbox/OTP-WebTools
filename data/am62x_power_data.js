/**
 * data/am62x_power_data.js
 * 
 * Simplified JSON representation of the AM62x Power Estimation Tool.
 * In a production scenario, this file would be generated from the Excel spreadsheet
 * or contain the WASM/JS ported formulas.
 * 
 * For this UI scaffold, we provide mock structural data and a simplified
 * estimation function.
 */

const AM62x_DATA = {
    id: "am62x",
    name: "AM62x",
    description: "Multi-core Arm Cortex-A53 processor with 3D graphics",

    // Valid input ranges
    inputs: {
        temperature: {
            min: -40,
            max: 125,
            default: 25,
            step: 1
        },
        processCorners: [
            { id: "nominal", label: "Nominal" },
            { id: "strong", label: "Strong" }
        ],
        leakageMargins: [
            { id: "0.0", label: "0%" },
            { id: "0.1", label: "10%" },
            { id: "0.2", label: "20%" },
            { id: "0.3", label: "30%" }
        ],
        voltages: [
            { id: "VDD_CORE", label: "VDD_CORE Voltage", options: [{ val: 0.75, lbl: "0.75V" }, { val: 0.85, lbl: "0.85V" }, { val: 0.88, lbl: "0.88V (OD)" }, { val: 1.15, lbl: "1.15V" }] },
            { id: "VDD_CORE_SRAM", label: "VDD_CORE_SRAM Voltage", options: [{ val: 0.85, lbl: "0.85V" }, { val: 0.88, lbl: "0.88V (OD)" }, { val: 1.15, lbl: "1.15V" }] }
        ]
    },

    // Fixed voltage rails (simplified representation of what's in the Excel)
    fixedVoltages: [
        { id: "VDD_CANUART", label: "VDD_CANUART", nom: 0.85 },
        { id: "VDDA_1P8", label: "VDDA_1P8", nom: 1.80 },
        { id: "VDDA_3P3", label: "VDDA_3P3", nom: 3.30 }
    ],

    /**
     * MOCK CALCULATION FUNCTION
     * -------------------------
     * This function simulates the complex macro calculations in the Excel sheet.
     * It uses a baseline power for each use case and scales it linearly with
     * temperature and process corner to demonstrate UI responsiveness.
     * 
     * @param {Object} config - The current UI configuration
     * @returns {Object} { total, static, dynamic, breakdown }
     */
    calculatePower: function (config) {
        const temp = parseFloat(config['temperature-input'] || 25);
        const isStrong = config['process-corner'] === 'strong';
        const leakageMargin = parseFloat(config['leakage-margin'] || 0.0) / 100.0;

        // Configuration Voltages
        const vddCore = parseFloat(config['VDD_CORE'] || 0.75);
        const vddarCore = parseFloat(config['VDDAR_CORE'] || 0.85);

        // Fixed Voltages per CSV
        const vdda1p8 = 1.80;
        const vddsDdr = 1.10; // LPDDR4
        const dvdd1p8 = 1.80;
        const dvdd3p3 = 3.30;

        let finalStatic = 0;
        let finalDynamic = 0;

        // Breakdown categories for charts
        const breakdown = {
            'static_core': 0,
            'static_io': 0,
            'dyn_cpu': 0,
            'dyn_gpu': 0,
            'dyn_io': 0,
            'dyn_other': 0
        };

        // Per-rail power tracking aligned with CSV
        const railPower = {
            'VDD_CORE': { voltage: vddCore, static: 0, dynamic: 0 },
            'VDDAR_CORE': { voltage: vddarCore, static: 0, dynamic: 0 },
            'VDDA_1V8': { voltage: vdda1p8, static: 0, dynamic: 0 },
            'VDDS_DDR': { voltage: vddsDdr, static: 0, dynamic: 0 },
            'SOC_DVDD1V8': { voltage: dvdd1p8, static: 0, dynamic: 0 },
            'SOC_DVDD3V3': { voltage: dvdd3p3, static: 0, dynamic: 0 }
        };

        const normTemp = (temp + 40) / 165;
        const tempStaticFactor = 1 + (Math.pow(normTemp, 2) * 2.5);
        const tempDynamicFactor = 1 + (normTemp * 0.1);
        const cornerStaticFactor = isStrong ? 1.4 : 1.0;
        const marginFactor = 1 + leakageMargin;

        const vRatioCore = vddCore / 0.75;
        const vFactorDynamicCore = Math.pow(vRatioCore, 2);

        const vRatioVddar = vddarCore / 0.85;
        const vFactorDynamicVddar = Math.pow(vRatioVddar, 2);

        const socdb = window.TI_AM62X_SOCDB || {};
        const mapping = window.TI_AM62X_PET_MAPPING || {};

        for (const [key, chip] of Object.entries(socdb)) {
            let usage = 0.0;
            let proxyScale = 1.0;

            const mapData = mapping[key];
            if (mapData) {
                if (mapData.utilization_ref) {
                    if (config[mapData.utilization_ref] !== undefined) {
                        usage = parseFloat(config[mapData.utilization_ref]);
                    } else if (mapData.utilization_ref.includes('Summary!')) {
                        usage = 100.0;
                    }
                }

                if (mapData.mode_ref && config[mapData.mode_ref]) {
                    const modeVal = config[mapData.mode_ref];
                    let f = parseFloat(modeVal);
                    if (isNaN(f)) {
                        const match = String(modeVal).match(/(\d+)/g);
                        if (match) f = parseInt(match[match.length - 1]);
                    }
                    if (f && f > 0) {
                        proxyScale = Math.min(Math.max((f / 1000), 0.5), 1.5);
                    }
                }
            }

            const utilRatio = (isNaN(usage) ? 0 : usage / 100.0) * proxyScale;

            // 1. Static Power (Leakage)
            // Attributes base leakage to VDD_CORE, and vdda/vddr to their respective rails
            const chipBaseStatic = chip.base_lkg_mw * chip.qty * tempStaticFactor * cornerStaticFactor * marginFactor;
            const chipVddaStatic = chip.vdda_lkg_mw * chip.qty * tempStaticFactor * cornerStaticFactor * marginFactor;
            const chipVddrStatic = chip.vddr_lkg_mw * chip.qty * tempStaticFactor * cornerStaticFactor * marginFactor;

            // 2. Dynamic Power
            // Attributes base specific power to VDD_CORE (or VDDAR_CORE if core subchip)
            const isCoreSubchip = chip.vdd_domain === "VDD_CORE" || chip.vdd_domain === "VDD_Core";
            const vFactorCore = isCoreSubchip ? vFactorDynamicCore : 1.0;
            const chipBaseDynamic = chip.base_dyn_mw * chip.qty * utilRatio * tempDynamicFactor * vFactorCore;

            // vdda dynamic often scales with VDDAR_CORE if it's a core-related analog block
            const vFactorVddar = isCoreSubchip ? vFactorDynamicVddar : 1.0;
            const chipVddaDynamic = chip.vdda_dyn_mw * chip.qty * utilRatio * tempDynamicFactor * vFactorVddar;

            finalStatic += (chipBaseStatic + chipVddaStatic + chipVddrStatic);
            finalDynamic += (chipBaseDynamic + chipVddaDynamic);

            // Per-rail aggregation
            railPower['VDD_CORE'].static += chipBaseStatic;
            railPower['VDD_CORE'].dynamic += chipBaseDynamic;

            railPower['VDDA_1V8'].static += chipVddaStatic; // All subchip vdda leakage contributes to VDDA_1V8

            if (isCoreSubchip) {
                // VDDAR_CORE scales with core voltage and handles core-related analog dynamic
                railPower['VDDAR_CORE'].dynamic += chipVddaDynamic;
            } else {
                // All other analog dynamic power goes to the fixed VDDA_1V8 rail
                railPower['VDDA_1V8'].dynamic += chipVddaDynamic;
            }

            railPower['VDDS_DDR'].static += chipVddrStatic;

            // Distribution for Small IO (Simplified for the six CSV rails)
            if (chip.type.includes('IO') || chip.function.includes('LVCMOS')) {
                railPower['SOC_DVDD3V3'].dynamic += chipBaseDynamic * 0.1; // Estimate
                railPower['SOC_DVDD1V8'].dynamic += chipBaseDynamic * 0.05;
            }

            // Categorize for breakdown visualization
            if (isCoreSubchip) {
                breakdown['static_core'] += chipBaseStatic;
            } else {
                breakdown['static_io'] += chipBaseStatic + chipVddaStatic + chipVddrStatic;
            }

            if (chip.type.includes('MPU') || chip.type.includes('CPU') || chip.function.includes('CPU')) {
                breakdown['dyn_cpu'] += chipBaseDynamic;
            } else if (chip.type.includes('GPU') || key.toLowerCase().includes('gpu')) {
                breakdown['dyn_gpu'] += chipBaseDynamic;
            } else if (chip.type.includes('IO') || chip.function.includes('IO')) {
                breakdown['dyn_io'] += chipBaseDynamic + chipVddaDynamic;
            } else {
                breakdown['dyn_other'] += chipBaseDynamic + chipVddaDynamic;
            }
        }

        // Fallback for demo
        if (Object.keys(socdb).length === 0) {
            finalStatic = 250 * tempStaticFactor;
            finalDynamic = 1000 * tempDynamicFactor * vFactorDynamicCore;
            breakdown['static_core'] = finalStatic;
            breakdown['dyn_other'] = finalDynamic;
            railPower['VDD_CORE'].static = finalStatic;
            railPower['VDD_CORE'].dynamic = finalDynamic;
        }

        const total = finalStatic + finalDynamic;

        // Convert railPower object to an array for display
        const rails = Object.entries(railPower).map(([name, data]) => ({
            name,
            voltage: data.voltage,
            power: Math.round((data.static + data.dynamic) * 10) / 10
        }));

        return {
            total: Math.round(total * 10) / 10,
            static: Math.round(finalStatic * 10) / 10,
            dynamic: Math.round(finalDynamic * 10) / 10,
            breakdown: [
                { id: 'static_core', label: 'Core Leakage', value: Math.round(breakdown['static_core']), type: 'leakage' },
                { id: 'static_io', label: 'I/O Leakage', value: Math.round(breakdown['static_io']), type: 'leakage' },
                { id: 'dyn_cpu', label: 'CPU Dynamic', value: Math.round(breakdown['dyn_cpu']), type: 'dynamic' },
                { id: 'dyn_gpu', label: 'GPU Dynamic', value: Math.round(breakdown['dyn_gpu']), type: 'dynamic' },
                { id: 'dyn_io', label: 'I/O Dynamic', value: Math.round(breakdown['dyn_io']), type: 'dynamic' },
                { id: 'dyn_other', label: 'Other Dynamic', value: Math.round(breakdown['dyn_other']), type: 'dynamic' }
            ],
            rails: rails
        };
    }
};

// Expose to global window object
window.TI_SOC_DATA = window.TI_SOC_DATA || {};
window.TI_SOC_DATA["am62x"] = AM62x_DATA;
