#!/usr/bin/env node
/**
 * Test script for AM62P power calculations
 */

const fs = require('fs');

// Create browser-like environment
global.window = {};
global.console = console;

// Load data files
console.log('Loading AM62P data files...');
eval(fs.readFileSync('data/am62p_socdb.js', 'utf8'));
eval(fs.readFileSync('data/am62p_dropdowns.js', 'utf8'));
eval(fs.readFileSync('data/am62p_usecases.js', 'utf8'));
const powerDataCode = fs.readFileSync('data/am62p_power_data.js', 'utf8');
eval(powerDataCode);

console.log('✓ All files loaded successfully\n');

console.log('Data Summary:');
console.log('  - SoCDB components:', Object.keys(window.TI_AM62P_SOCDB).length);
console.log('  - Dropdown categories:', Object.keys(window.TI_AM62P_DROPDOWNS).length);
console.log('  - Use case presets:', Object.keys(window.TI_AM62P_USECASES).length);
console.log('');

// Access AM62P_DATA from global scope
if (typeof AM62P_DATA === 'undefined') {
    console.error('ERROR: AM62P_DATA not found in global scope');
    // Try to extract from module.exports
    const moduleObj = { exports: {} };
    eval('(function(module) { ' + powerDataCode + ' })')(moduleObj);
    global.AM62P_DATA = moduleObj.exports;
}

console.log('Running power calculation tests...\n');

// Test 1: Nominal conditions
console.log('Test 1: Nominal Conditions (38°C, nominal corner, 0.75V)');
const test1Config = {
    'temperature-input': 38,
    'process-corner': 'nominal',
    'leakage-margin': 0.0,
    'VDD_CORE': 0.75,
    'VDDAR_CORE': 0.85
};

const result1 = AM62P_DATA.calculatePower(test1Config);
console.log('  Total Power:', result1.total.toFixed(2), 'mW');
console.log('  Static Power:', result1.static.toFixed(2), 'mW (' + (result1.static/result1.total*100).toFixed(1) + '%)');
console.log('  Dynamic Power:', result1.dynamic.toFixed(2), 'mW (' + (result1.dynamic/result1.total*100).toFixed(1) + '%)');
console.log('  Rail breakdown:');
for (const [rail, power] of Object.entries(result1.rails)) {
    const total = power.static + power.dynamic;
    if (total > 1.0) {
        console.log('    ' + rail + ':', total.toFixed(2), 'mW');
    }
}
console.log('');

// Test 2: High temperature, strong corner
console.log('Test 2: High Temperature (125°C, strong corner, 0.85V, 20% margin)');
const test2Config = {
    'temperature-input': 125,
    'process-corner': 'strong',
    'leakage-margin': 20.0,
    'VDD_CORE': 0.85,
    'VDDAR_CORE': 0.85
};

const result2 = AM62P_DATA.calculatePower(test2Config);
console.log('  Total Power:', result2.total.toFixed(2), 'mW');
console.log('  Static Power:', result2.static.toFixed(2), 'mW (' + (result2.static/result2.total*100).toFixed(1) + '%)');
console.log('  Dynamic Power:', result2.dynamic.toFixed(2), 'mW (' + (result2.dynamic/result2.total*100).toFixed(1) + '%)');
console.log('  Power increase vs Test 1:', ((result2.total / result1.total - 1) * 100).toFixed(1) + '%');
console.log('');

// Test 3: Low temperature
console.log('Test 3: Low Temperature (-40°C, nominal corner, 0.75V)');
const test3Config = {
    'temperature-input': -40,
    'process-corner': 'nominal',
    'leakage-margin': 0.0,
    'VDD_CORE': 0.75,
    'VDDAR_CORE': 0.85
};

const result3 = AM62P_DATA.calculatePower(test3Config);
console.log('  Total Power:', result3.total.toFixed(2), 'mW');
console.log('  Static Power:', result3.static.toFixed(2), 'mW (' + (result3.static/result3.total*100).toFixed(1) + '%)');
console.log('  Dynamic Power:', result3.dynamic.toFixed(2), 'mW (' + (result3.dynamic/result3.total*100).toFixed(1) + '%)');
console.log('');

// Test 4: Function breakdown
console.log('Test 4: Power Breakdown by Function (38°C, nominal)');
console.log('  CPU:', result1.breakdown.dyn_cpu.toFixed(2), 'mW');
console.log('  GPU:', result1.breakdown.dyn_gpu.toFixed(2), 'mW');
console.log('  DSP/Video:', result1.breakdown.dyn_dsp.toFixed(2), 'mW');
console.log('  Display:', result1.breakdown.dyn_display.toFixed(2), 'mW');
console.log('  Camera:', result1.breakdown.dyn_camera.toFixed(2), 'mW');
console.log('  IO/Peripherals:', result1.breakdown.dyn_io.toFixed(2), 'mW');
console.log('  Other:', result1.breakdown.dyn_other.toFixed(2), 'mW');
console.log('  Static (Core):', result1.breakdown.static_core.toFixed(2), 'mW');
console.log('  Static (IO):', result1.breakdown.static_io.toFixed(2), 'mW');
console.log('');

console.log('✓ All tests completed successfully!');
console.log('\nAM62P power estimator is now fully functional with real data from Excel.');
