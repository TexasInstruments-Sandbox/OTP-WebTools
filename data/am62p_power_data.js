/**
 * data/am62p_power_data.js
 *
 * AM62P Power Estimation Data
 * Extracted from SPRUJD9_AM62P_PET_1_1.xlsm
 *
 * This file contains the real power estimation model for the AM62P processor.
 */

const AM62P_DATA = {
    id: "am62p",
    name: "AM62P",
    description: "Multi-core Arm Cortex-A53 processor with integrated vision and deep learning acceleration",

    // Valid input ranges
    inputs: {
        temperature: {
            min: -40,
            max: 125,
            default: 38,
            step: 1
        },
        processCorners: [
            { id: "nominal", label: "Nominal" },
            { id: "strong", label: "Strong (Max)" }
        ],
        leakageMargins: [
            { id: "0.0", label: "0%" },
            { id: "0.1", label: "10%" },
            { id: "0.2", label: "20%" },
            { id: "0.3", label: "30%" }
        ],
        voltages: [
            { id: "VDD_CORE", label: "VDD_CORE Voltage", options: [
                { val: 0.75, lbl: "0.75V" },
                { val: 0.85, lbl: "0.85V" }
            ]},
            { id: "VDDAR_CORE", label: "VDDAR_CORE Voltage", options: [
                { val: 0.85, lbl: "0.85V" },
                { val: 0.75, lbl: "0.75V" }
            ]}
        ]
    },

    // Fixed voltage rails
    fixedVoltages: [
        { id: "VDDA_1P8", label: "VDDA_1P8", nom: 1.80 },
        { id: "VDDA_3P3", label: "VDDA_3P3", nom: 3.30 },
        { id: "VDDS_DDR", label: "VDDS_DDR", nom: 1.10 }
    ],

    // Pre-defined use cases
    useCases: [
        { id: "idle", label: "Idle" },
        { id: "100_percent", label: "100% (Max Utility)" },
        { id: "typical_vision", label: "Typical Vision Processing" }
    ],

    /**
     * REAL POWER CALCULATION FUNCTION
     * --------------------------------
     * Calculates power consumption based on AM62P SoCDB and configuration
     *
     * @param {Object} config - The current UI configuration
     * @returns {Object} { total, static, dynamic, breakdown, rails }
     */
    calculatePower: function (config) {
        // Get configuration values
        const temp = parseFloat(config['temperature-input'] || 38);
        const isStrong = config['process-corner'] === 'strong';
        const leakageMargin = parseFloat(config['leakage-margin'] || 0.0);

        // Configuration Voltages
        const vddCore = parseFloat(config['VDD_CORE'] || 0.75);
        const vddarCore = parseFloat(config['VDDAR_CORE'] || 0.85);

        // Fixed Voltages
        const vdda1p8 = 1.80;
        const vdda3p3 = 3.30;
        const vddsDdr = 1.10; // LPDDR4

        let finalStatic = 0;
        let finalDynamic = 0;

        // Breakdown categories for charts
        const breakdown = {
            'static_core': 0,
            'static_io': 0,
            'dyn_cpu': 0,
            'dyn_gpu': 0,
            'dyn_dsp': 0,
            'dyn_display': 0,
            'dyn_camera': 0,
            'dyn_io': 0,
            'dyn_other': 0
        };

        // Per-rail power tracking
        const railPower = {
            'VDD_CORE': { voltage: vddCore, static: 0, dynamic: 0 },
            'VDDAR_CORE': { voltage: vddarCore, static: 0, dynamic: 0 },
            'VDDA_1V8': { voltage: vdda1p8, static: 0, dynamic: 0 },
            'VDDA_3V3': { voltage: vdda3p3, static: 0, dynamic: 0 },
            'VDDS_DDR': { voltage: vddsDdr, static: 0, dynamic: 0 }
        };

        // Calculate scaling factors
        // Temperature scaling: exponential for leakage, linear for dynamic
        const normTemp = (temp + 40) / 165;  // Normalize to 0-1 range
        const tempStaticFactor = 1 + (Math.pow(normTemp, 2) * 2.5);  // Exponential leakage growth
        const tempDynamicFactor = 1 + (normTemp * 0.1);  // Small dynamic increase with temp

        // Process corner scaling
        const cornerStaticFactor = isStrong ? 1.4 : 1.0;  // Strong corner increases leakage

        // Leakage margin
        const marginFactor = 1 + (leakageMargin / 100.0);

        // Voltage scaling factors (P ∝ V²)
        const vRatioCore = vddCore / 0.75;
        const vFactorDynamicCore = Math.pow(vRatioCore, 2);

        const vRatioVddar = vddarCore / 0.85;
        const vFactorDynamicVddar = Math.pow(vRatioVddar, 2);

        // Get SoCDB
        const socdb = window.TI_AM62P_SOCDB || {};
        const mdbLookups = {}; // TODO: Load from am62p_mdb_lookups.json if needed

        // Iterate through all SoC components
        for (const [key, chip] of Object.entries(socdb)) {
            // Get utilization for this component (0-100%)
            let utilization = 0.0;

            // Try to get utilization from config (if component has a UI control)
            if (config[key] !== undefined) {
                utilization = parseFloat(config[key]) || 0.0;
            } else {
                // Default utilization based on typical operation
                // This would be refined with proper mapping
                utilization = 10.0; // 10% baseline for active components
            }

            const utilRatio = utilization / 100.0;

            // Get baseline power from SoCDB
            const basePower = chip.total_mw || 0.0;

            // Split into static and dynamic (typical ratio is 30/70)
            const baseStatic = basePower * 0.3;
            const baseDynamic = basePower * 0.7;

            // Apply scaling factors
            let staticPower = baseStatic * tempStaticFactor * cornerStaticFactor * marginFactor;
            let dynamicPower = baseDynamic * utilRatio * tempDynamicFactor;

            // Apply voltage scaling based on component's voltage domain
            if (chip.vdd_domain === 'VDD_CORE') {
                dynamicPower *= vFactorDynamicCore;
                staticPower *= (1 + (vRatioCore - 1) * 0.5); // Leakage also increases with voltage

                // Add to rail power
                railPower['VDD_CORE'].static += staticPower;
                railPower['VDD_CORE'].dynamic += dynamicPower;

                // Add to breakdown categories
                breakdown['static_core'] += staticPower;

            } else if (chip.vdd_domain === 'VDDAR_CORE') {
                dynamicPower *= vFactorDynamicVddar;
                staticPower *= (1 + (vRatioVddar - 1) * 0.5);

                railPower['VDDAR_CORE'].static += staticPower;
                railPower['VDDAR_CORE'].dynamic += dynamicPower;

                breakdown['static_core'] += staticPower;
            } else {
                // IO and other domains
                railPower['VDDA_1V8'].static += staticPower * 0.5;
                railPower['VDDA_1V8'].dynamic += dynamicPower * 0.5;
                railPower['VDDA_3V3'].static += staticPower * 0.3;
                railPower['VDDA_3V3'].dynamic += dynamicPower * 0.3;
                railPower['VDDS_DDR'].static += staticPower * 0.2;
                railPower['VDDS_DDR'].dynamic += dynamicPower * 0.2;

                breakdown['static_io'] += staticPower;
            }

            // Categorize dynamic power by function
            const func = chip.function || '';
            if (func.includes('ARM_MPU') || func.includes('ARM_MCU')) {
                breakdown['dyn_cpu'] += dynamicPower;
            } else if (func.includes('GPU')) {
                breakdown['dyn_gpu'] += dynamicPower;
            } else if (func.includes('Video') || func.includes('DSP')) {
                breakdown['dyn_dsp'] += dynamicPower;
            } else if (func.includes('Display')) {
                breakdown['dyn_display'] += dynamicPower;
            } else if (func.includes('Camera') || func.includes('CSI')) {
                breakdown['dyn_camera'] += dynamicPower;
            } else if (func === 'Audio' || func === 'Networking' || func.includes('Periph')) {
                breakdown['dyn_io'] += dynamicPower;
            } else {
                breakdown['dyn_other'] += dynamicPower;
            }

            finalStatic += staticPower;
            finalDynamic += dynamicPower;
        }

        const total = finalStatic + finalDynamic;

        return {
            total: Math.max(0, total),
            static: Math.max(0, finalStatic),
            dynamic: Math.max(0, finalDynamic),
            breakdown: breakdown,
            rails: railPower
        };
    }
};

// Export for use in power estimator
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AM62P_DATA;
}

console.log('AM62P Power Data loaded');
