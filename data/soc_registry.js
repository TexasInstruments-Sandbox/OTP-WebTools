/**
 * data/soc_registry.js
 *
 * Central registry for all supported SoCs in the Power Estimation Tool
 * This file aggregates all device-specific data and makes it available globally
 */

// Initialize the global SOC data registry
window.TI_SOC_DATA = window.TI_SOC_DATA || {};

// Register AM62x
if (typeof AM62x_DATA !== 'undefined') {
    window.TI_SOC_DATA['am62x'] = AM62x_DATA;
}

// Register AM62P
if (typeof AM62P_DATA !== 'undefined') {
    window.TI_SOC_DATA['am62p'] = AM62P_DATA;
}

// Utility function to get active SoC
window.getActiveSoC = function() {
    const select = document.getElementById('soc-select');
    if (!select) return null;
    return window.TI_SOC_DATA[select.value] || null;
};

// Utility function to list all available SoCs
window.listAvailableSoCs = function() {
    return Object.keys(window.TI_SOC_DATA).map(id => ({
        id: id,
        name: window.TI_SOC_DATA[id].name,
        description: window.TI_SOC_DATA[id].description
    }));
};

console.log('SoC Registry loaded:', Object.keys(window.TI_SOC_DATA));
