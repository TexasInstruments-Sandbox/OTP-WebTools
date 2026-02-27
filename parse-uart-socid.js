// UART SoC ID Parser JavaScript Implementation
// Converts Python parse_uart_socid.py functionality to web-based tool

// DOM Elements
let hexInput, fileInput, fileButton, fileName, parseButton, clearButton, exportButton;
let resultsSection, resultsContent;
let inputMethodRadios;

// Parsed data storage
let parsedData = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    attachEventListeners();
    setupInputMethods();
});

function initializeElements() {
    hexInput = document.getElementById('hexInput');
    fileInput = document.getElementById('fileInput');
    fileButton = document.getElementById('fileButton');
    fileName = document.getElementById('fileName');
    parseButton = document.getElementById('parseButton');
    clearButton = document.getElementById('clearButton');
    exportButton = document.getElementById('exportButton');
    resultsSection = document.getElementById('resultsSection');
    resultsContent = document.getElementById('resultsContent');
    inputMethodRadios = document.querySelectorAll('input[name="inputMethod"]');
}

function attachEventListeners() {
    parseButton.addEventListener('click', handleParse);
    clearButton.addEventListener('click', handleClear);
    exportButton.addEventListener('click', handleExport);
    fileButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    hexInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleParse();
        }
    });

    inputMethodRadios.forEach(radio => {
        radio.addEventListener('change', handleInputMethodChange);
    });
}

function setupInputMethods() {
    handleInputMethodChange();
}

function handleInputMethodChange() {
    const selectedMethod = document.querySelector('input[name="inputMethod"]:checked').value;
    const pasteMethod = document.getElementById('pasteMethod');
    const fileMethod = document.getElementById('fileMethod');

    if (selectedMethod === 'paste') {
        pasteMethod.classList.add('active');
        fileMethod.classList.remove('active');
    } else {
        pasteMethod.classList.remove('active');
        fileMethod.classList.add('active');
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        fileName.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function(e) {
            hexInput.value = e.target.result;
        };
        reader.readAsText(file);
    } else {
        fileName.textContent = '';
    }
}

function handleParse() {
    try {
        const inputData = hexInput.value.trim();
        if (!inputData) {
            displayError('Please provide hex data to parse.');
            return;
        }

        const binaryData = parseHexInput(inputData);
        const parsed = parseSocIdData(binaryData);

        parsedData = parsed;
        displayResults(parsed);
        resultsSection.style.display = 'block';
    } catch (error) {
        displayError('Parse error: ' + error.message);
        console.error('Parse error:', error);
    }
}

function handleClear() {
    hexInput.value = '';
    fileName.textContent = '';
    fileInput.value = '';
    resultsSection.style.display = 'none';
    parsedData = null;
    clearError();
}

function handleExport() {
    if (!parsedData) {
        displayError('No data to export. Please parse SoC ID data first.');
        return;
    }

    const jsonData = JSON.stringify(parsedData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'socid-parsed-data.json';
    a.click();

    URL.revokeObjectURL(url);
}

function parseHexInput(input) {
    // Remove whitespace, newlines, and common prefixes
    let cleanHex = input.replace(/\s+/g, '');

    // Handle 0x prefixed hex values
    cleanHex = cleanHex.replace(/0x/g, '');

    // Validate hex characters
    if (!/^[0-9A-Fa-f]*$/.test(cleanHex)) {
        throw new Error('Invalid hex characters found. Please ensure input contains only hex digits (0-9, A-F).');
    }

    if (cleanHex.length === 0) {
        throw new Error('No valid hex data found.');
    }

    if (cleanHex.length % 2 !== 0) {
        throw new Error('Hex data length must be even (each byte requires 2 hex digits).');
    }

    // Convert to byte array
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }

    return new Uint8Array(bytes);
}

function parseSocIdData(binaryData) {
    if (binaryData.length < 32) {
        throw new Error('Insufficient data. SoC ID requires at least 32 bytes.');
    }

    const result = {
        header: {},
        publicRomInfo: {},
        secureRomInfo: null
    };

    // Parse header (4 bytes)
    const numBlocks = readUint32LE(binaryData, 0);
    result.header.numBlocks = numBlocks;

    // Parse public ROM info (28 bytes, starting at offset 4)
    if (binaryData.length < 32) {
        throw new Error('Insufficient data for public ROM info.');
    }

    result.publicRomInfo = parsePublicRomInfo(binaryData, 4);

    // Parse secure ROM info if present (numBlocks > 1)
    if (numBlocks > 1) {
        if (binaryData.length < 200) {
            throw new Error('Insufficient data for secure ROM info. Expected at least 200 bytes.');
        }
        result.secureRomInfo = parseSecureRomInfo(binaryData, 32);
    }

    return result;
}

function parsePublicRomInfo(data, offset) {
    const info = {};

    // struct SOCID_PubInfo_t
    // uint8_t subBlockId;
    info.subBlockId = data[offset];

    // uint8_t size;
    info.subBlockSize = data[offset + 1];

    // uint8_t fixed[2]; - skip

    // uint8_t devName[12];
    const deviceNameBytes = data.slice(offset + 4, offset + 16);
    info.deviceName = bytesToString(deviceNameBytes);

    // uint32_t devType;
    const deviceTypeBytes = data.slice(offset + 16, offset + 20);
    info.deviceType = bytesToString(deviceTypeBytes);

    // uint32_t dmscVersion;
    const dmscVersionBytes = Array.from(data.slice(offset + 20, offset + 24));
    dmscVersionBytes.reverse(); // Convert from little-endian
    info.dmscRomVersion = dmscVersionBytes;

    // uint32_t r5Version;
    const r5VersionBytes = Array.from(data.slice(offset + 24, offset + 28));
    r5VersionBytes.reverse(); // Convert from little-endian
    info.r5RomVersion = r5VersionBytes;

    return info;
}

function parseSecureRomInfo(data, offset) {
    const info = {};

    // struct SOCID_SecInfo_t
    // uint8_t subBlockId;
    info.secSubBlockId = data[offset];

    // uint8_t size;
    info.secSubBlockSize = data[offset + 1];

    // uint16_t secPrime;
    info.secPrime = readUint16LE(data, offset + 2);

    // uint16_t keyRevision;
    info.secKeyRevision = readUint16LE(data, offset + 4);

    // uint16_t keyCount;
    info.secKeyCount = readUint16LE(data, offset + 6);

    // uint32_t tiRootKeyHash[16]; // 64 bytes
    const tiMpkHashBytes = data.slice(offset + 8, offset + 72);
    info.secTiMpkHash = bytesToHexString(tiMpkHashBytes);

    // uint32_t custRootKeyHash[16]; // 64 bytes
    const custMpkHashBytes = data.slice(offset + 72, offset + 136);
    info.secCustMpkHash = bytesToHexString(custMpkHashBytes);

    // uint32_t uniqueID[8]; // 32 bytes
    const uniqueIdBytes = data.slice(offset + 136, offset + 168);
    info.secUniqueId = bytesToHexString(uniqueIdBytes);

    return info;
}

function readUint32LE(data, offset) {
    return data[offset] |
           (data[offset + 1] << 8) |
           (data[offset + 2] << 16) |
           (data[offset + 3] << 24);
}

function readUint16LE(data, offset) {
    return data[offset] | (data[offset + 1] << 8);
}

function bytesToString(bytes) {
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0) break; // Stop at null terminator
        if (bytes[i] >= 32 && bytes[i] <= 126) { // Printable ASCII
            result += String.fromCharCode(bytes[i]);
        }
    }
    return result;
}

function bytesToHexString(bytes) {
    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

function displayResults(data) {
    let html = '';

    // Header Information
    html += `
        <div class="result-group">
            <h3>SoC ID Header Info</h3>
            <div class="info-table">
                <div class="info-row">
                    <span class="info-label">NumBlocks:</span>
                    <span class="info-value">${data.header.numBlocks}</span>
                </div>
            </div>
        </div>
    `;

    // Public ROM Information
    html += `
        <div class="result-group">
            <h3>SoC ID Public ROM Info</h3>
            <div class="info-table">
                <div class="info-row">
                    <span class="info-label">SubBlockId:</span>
                    <span class="info-value">${data.publicRomInfo.subBlockId}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">SubBlockSize:</span>
                    <span class="info-value">${data.publicRomInfo.subBlockSize}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">DeviceName:</span>
                    <span class="info-value device-name">${data.publicRomInfo.deviceName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">DeviceType:</span>
                    <span class="info-value device-type">${data.publicRomInfo.deviceType}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">DMSC ROM Version:</span>
                    <span class="info-value version">[${data.publicRomInfo.dmscRomVersion.join(', ')}]</span>
                </div>
                <div class="info-row">
                    <span class="info-label">R5 ROM Version:</span>
                    <span class="info-value version">[${data.publicRomInfo.r5RomVersion.join(', ')}]</span>
                </div>
            </div>
        </div>
    `;

    // Secure ROM Information (if present)
    if (data.secureRomInfo) {
        html += `
            <div class="result-group">
                <h3>SoC ID Secure ROM Info</h3>
                <div class="info-table">
                    <div class="info-row">
                        <span class="info-label">Sec SubBlockId:</span>
                        <span class="info-value">${data.secureRomInfo.secSubBlockId}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Sec SubBlockSize:</span>
                        <span class="info-value">${data.secureRomInfo.secSubBlockSize}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Sec Prime:</span>
                        <span class="info-value">${data.secureRomInfo.secPrime}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Sec Key Revision:</span>
                        <span class="info-value">${data.secureRomInfo.secKeyRevision}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Sec Key Count:</span>
                        <span class="info-value">${data.secureRomInfo.secKeyCount}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Sec TI MPK Hash:</span>
                        <span class="info-value hash-value">${data.secureRomInfo.secTiMpkHash}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Sec Cust MPK Hash:</span>
                        <span class="info-value hash-value">${data.secureRomInfo.secCustMpkHash}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Sec Unique ID:</span>
                        <span class="info-value hash-value">${data.secureRomInfo.secUniqueId}</span>
                    </div>
                </div>
            </div>
        `;
    }

    resultsContent.innerHTML = html;
    clearError();
}

function displayError(message) {
    resultsContent.innerHTML = `
        <div class="error-message">
            <h3>❌ Error</h3>
            <p>${message}</p>
        </div>
    `;
    resultsSection.style.display = 'block';
}

function clearError() {
    const errorMessages = resultsContent.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
}