// Key Configuration Tool JavaScript
// Exact implementation matching TI's Python keywriter-lite tool

// Command ID to value mapping
const KEYWR_LITE_CMD_MAP = {
    "one-shot": 0,
    "multi-shot": 1,
    "smpkh": 2,
    "bmpkh": 3,
    "key-cnt": 4,
    "key-rev": 5,
    "sbl-swrev": 6,
    "sysfw-swrev": 7,
    "brdcfg-swrev": 8,
    "msv": 9,
    "jtag-disable": 10,
    "boot-mode": 11,
    "ext-otp": 12
};

// Field header magic numbers (exact from Python implementation)
const FIELD_HEADERS = {
    mpkOpts: 0x4a7e,
    smpkh: 0x1234,
    bmpkh: 0x9ffc,
    keyCnt: 0x5678,
    keyRev: 0x62c8,
    sblSwrev: 0x8bad,
    sysfwSwrev: 0x45a9,
    brdcfgSwrev: 0x98dc,
    msv: 0x1337,
    jtagDisable: 0x7421,
    bootMode: 0xa1b2,
    extOtp: 0xd0e5
};

// Field visibility mapping based on command ID
const FIELD_VISIBILITY = {
    "one-shot": ["mpkOpts", "smpkh", "bmpkh", "keyCnt", "keyRev", "sblSwrev", "sysfwSwrev", "brdcfgSwrev", "msv", "jtagDisable", "bootMode", "extOtp"],
    "multi-shot": ["mpkOpts", "smpkh", "bmpkh", "keyCnt", "keyRev", "sblSwrev", "sysfwSwrev", "brdcfgSwrev", "msv", "jtagDisable", "bootMode", "extOtp"],
    "smpkh": ["smpkh"],
    "bmpkh": ["bmpkh"],
    "key-cnt": ["keyCnt"],
    "key-rev": ["keyRev"],
    "sbl-swrev": ["sblSwrev"],
    "sysfw-swrev": ["sysfwSwrev"],
    "brdcfg-swrev": ["brdcfgSwrev"],
    "msv": ["msv"],
    "jtag-disable": ["jtagDisable"],
    "boot-mode": ["bootMode"],
    "ext-otp": ["extOtp"]
};

// DOM Elements
let cmdIdSelect, deviceSelect;
let resultsSection, resultsContainer;

// Helper functions for binary data manipulation
function writeUint8(value) {
    return [value & 0xFF];
}

function writeUint16LE(value) {
    return [
        value & 0xFF,
        (value >> 8) & 0xFF
    ];
}

function writeUint32LE(value) {
    return [
        value & 0xFF,
        (value >> 8) & 0xFF,
        (value >> 16) & 0xFF,
        (value >> 24) & 0xFF
    ];
}

function writeUint64LE(value) {
    // JavaScript bitwise operations work on 32-bit integers
    // For 64-bit, we need to handle it carefully
    const low = value & 0xFFFFFFFF;
    const high = Math.floor(value / 0x100000000) & 0xFFFFFFFF;
    return [
        low & 0xFF,
        (low >> 8) & 0xFF,
        (low >> 16) & 0xFF,
        (low >> 24) & 0xFF,
        high & 0xFF,
        (high >> 8) & 0xFF,
        (high >> 16) & 0xFF,
        (high >> 24) & 0xFF
    ];
}

function createActionFlags(enable, override, readProtect, writeProtect) {
    // Action flags format (4 bytes):
    // Byte 0: enable - 0x5a if true, 0xa5 if false
    // Byte 1: override - 0x5a if true, 0xa5 if false
    // Byte 2: read_protect - 0x5a if true, 0xa5 if false
    // Byte 3: write_protect - 0x5a if true, 0xa5 if false
    let flags = 0;
    flags |= (enable ? 0x5a : 0xa5);
    flags |= (override ? 0x5a : 0xa5) << 8;
    flags |= (readProtect ? 0x5a : 0xa5) << 16;
    flags |= (writeProtect ? 0x5a : 0xa5) << 24;
    return flags;
}

// Initialize the page
function init() {
    cmdIdSelect = document.getElementById('cmdIdSelect');
    deviceSelect = document.getElementById('deviceSelect');
    resultsSection = document.getElementById('resultsSection');
    resultsContainer = document.getElementById('resultsContainer');

    // Event listeners
    cmdIdSelect.addEventListener('change', updateFieldVisibility);
    document.getElementById('generateBtn').addEventListener('click', generateBlob);
    document.getElementById('generateCBtn').addEventListener('click', generateCFile);
    document.getElementById('saveConfigBtn').addEventListener('click', saveConfiguration);
    document.getElementById('loadConfigBtn').addEventListener('click', () => {
        document.getElementById('configFileInput').click();
    });
    document.getElementById('configFileInput').addEventListener('change', loadConfiguration);

    // File input handlers for SMPKH and BMPKH
    document.getElementById('loadSmpkhBtn').addEventListener('click', () => {
        document.getElementById('smpkhFileInput').click();
    });
    document.getElementById('smpkhFileInput').addEventListener('change', (e) => {
        loadPublicKeyHash(e, 'smpkhValue');
    });

    document.getElementById('loadBmpkhBtn').addEventListener('click', () => {
        document.getElementById('bmpkhFileInput').click();
    });
    document.getElementById('bmpkhFileInput').addEventListener('change', (e) => {
        loadPublicKeyHash(e, 'bmpkhValue');
    });

    // Initialize field visibility
    updateFieldVisibility();
}

// Update field visibility based on selected command ID
function updateFieldVisibility() {
    const selectedCmd = cmdIdSelect.value;
    const visibleFields = FIELD_VISIBILITY[selectedCmd] || [];

    // Hide all optional groups first
    const allGroups = ['mpkOptsGroup', 'smpkhGroup', 'bmpkhGroup', 'keyCntGroup', 'keyRevGroup',
                       'sblSwrevGroup', 'sysfwSwrevGroup', 'brdcfgSwrevGroup', 'msvGroup',
                       'jtagDisableGroup', 'bootModeGroup', 'extOtpGroup'];

    allGroups.forEach(groupId => {
        document.getElementById(groupId).style.display = 'none';
    });

    // Show MPK Options for one-shot and multi-shot
    if (selectedCmd === 'one-shot' || selectedCmd === 'multi-shot') {
        document.getElementById('mpkOptsGroup').style.display = 'block';
    }

    // Show relevant fields
    visibleFields.forEach(field => {
        const groupId = field + 'Group';
        const element = document.getElementById(groupId);
        if (element) {
            element.style.display = 'block';
        }
    });

    // Handle enable checkbox behavior for multi-shot vs single-shot
    const isMultiShot = (selectedCmd === 'multi-shot');
    document.querySelectorAll('[id$="Enable"]').forEach(checkbox => {
        checkbox.disabled = false;
        if (!isMultiShot && checkbox.id !== 'extOtpEnable') {
            checkbox.checked = true;
            checkbox.disabled = true;
        }
    });
}

// Validate hex string
function validateHex(str, expectedLength = null) {
    const cleaned = str.replace(/^0x/i, '').trim();
    const hexPattern = /^[0-9a-fA-F]+$/;

    if (!hexPattern.test(cleaned)) {
        return { valid: false, error: 'Invalid hex characters' };
    }

    if (expectedLength && cleaned.length !== expectedLength) {
        return { valid: false, error: `Expected ${expectedLength} hex characters, got ${cleaned.length}` };
    }

    return { valid: true, value: cleaned };
}

// Load public key hash from file
async function loadPublicKeyHash(event, targetElementId) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const arrayBuffer = await file.arrayBuffer();
        const hash = await crypto.subtle.digest('SHA-512', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        document.getElementById(targetElementId).value = hashHex;
        displaySuccess(`Hash loaded successfully from ${file.name}`);
    } catch (error) {
        displayError(`Error loading file: ${error.message}`);
    }
}

// Generate blob
function generateBlob() {
    try {
        const config = collectConfiguration();
        const blob = buildBlobExact(config);

        // Create download link
        const uint8Array = new Uint8Array(blob);
        const blobObj = new Blob([uint8Array], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blobObj);

        displayBlobResult(url, uint8Array.length, config);
    } catch (error) {
        displayError(error.message);
    }
}

// Collect configuration from form
function collectConfiguration() {
    const config = {
        device: deviceSelect.value,
        cmdId: cmdIdSelect.value,
        cmdIdValue: KEYWR_LITE_CMD_MAP[cmdIdSelect.value],
        fields: {}
    };

    const selectedCmd = cmdIdSelect.value;
    const visibleFields = FIELD_VISIBILITY[selectedCmd] || [];

    // Collect MPK Options
    if (selectedCmd === 'one-shot' || selectedCmd === 'multi-shot') {
        const mpkOptsValue = document.getElementById('mpkOpts').value;
        const validation = validateHex(mpkOptsValue);
        if (!validation.valid) {
            throw new Error(`MPK Options: ${validation.error}`);
        }
        config.fields.mpkOpts = {
            value: validation.value,
            rawValue: mpkOptsValue
        };
    }

    // Collect SMPKH
    if (visibleFields.includes('smpkh')) {
        const smpkhValue = document.getElementById('smpkhValue').value.trim();
        if (smpkhValue) {
            const validation = validateHex(smpkhValue, 128);
            if (!validation.valid) {
                throw new Error(`SMPKH: ${validation.error}`);
            }
            config.fields.smpkh = {
                value: validation.value,
                enable: document.getElementById('smpkhEnable').checked,
                write: document.getElementById('smpkhWrite').checked,
                writeProt: document.getElementById('smpkhWriteProt').checked,
                override: document.getElementById('smpkhOverride').checked
            };
        }
    }

    // Collect BMPKH
    if (visibleFields.includes('bmpkh')) {
        const bmpkhValue = document.getElementById('bmpkhValue').value.trim();
        if (bmpkhValue) {
            const validation = validateHex(bmpkhValue, 128);
            if (!validation.valid) {
                throw new Error(`BMPKH: ${validation.error}`);
            }
            config.fields.bmpkh = {
                value: validation.value,
                enable: document.getElementById('bmpkhEnable').checked,
                write: document.getElementById('bmpkhWrite').checked,
                writeProt: document.getElementById('bmpkhWriteProt').checked,
                override: document.getElementById('bmpkhOverride').checked
            };
        }
    }

    // Collect numeric fields with flags
    const numericFields = [
        { name: 'keyCnt', id: 'keyCnt', max: 255 },
        { name: 'keyRev', id: 'keyRev', max: 255 },
        { name: 'sblSwrev', id: 'sblSwrev', max: 255 },
        { name: 'sysfwSwrev', id: 'sysfwSwrev', max: 255 },
        { name: 'brdcfgSwrev', id: 'brdcfgSwrev', max: 255 }
    ];

    numericFields.forEach(field => {
        if (visibleFields.includes(field.name)) {
            const value = parseInt(document.getElementById(field.id + 'Value').value);
            if (isNaN(value) || value < 0 || value > field.max) {
                throw new Error(`${field.name}: Value must be between 0 and ${field.max}`);
            }
            config.fields[field.name] = {
                value: value,
                enable: document.getElementById(field.id + 'Enable').checked,
                write: document.getElementById(field.id + 'Write').checked,
                writeProt: document.getElementById(field.id + 'WriteProt').checked,
                override: document.getElementById(field.id + 'Override').checked
            };
        }
    });

    // Collect MSV
    if (visibleFields.includes('msv')) {
        const msvValue = document.getElementById('msvValue').value.trim();
        if (msvValue) {
            const validation = validateHex(msvValue);
            if (!validation.valid) {
                throw new Error(`MSV: ${validation.error}`);
            }
            config.fields.msv = {
                value: validation.value,
                enable: document.getElementById('msvEnable').checked,
                write: document.getElementById('msvWrite').checked,
                writeProt: document.getElementById('msvWriteProt').checked,
                override: document.getElementById('msvOverride').checked
            };
        }
    }

    // Collect JTAG Disable
    if (visibleFields.includes('jtagDisable')) {
        config.fields.jtagDisable = {
            enable: document.getElementById('jtagDisableEnable').checked,
            write: document.getElementById('jtagDisableWrite').checked,
            writeProt: document.getElementById('jtagDisableWriteProt').checked,
            override: document.getElementById('jtagDisableOverride').checked
        };
    }

    // Collect Boot Mode
    if (visibleFields.includes('bootMode')) {
        const fuseIdx = parseInt(document.getElementById('bootModeFuseIdx').value);
        const bootModeValue = document.getElementById('bootModeValue').value.trim();

        if (isNaN(fuseIdx) || fuseIdx < 0 || fuseIdx > 31) {
            throw new Error('Boot Mode: Fuse index must be between 0 and 31');
        }

        if (bootModeValue) {
            const validation = validateHex(bootModeValue);
            if (!validation.valid) {
                throw new Error(`Boot Mode: ${validation.error}`);
            }
            config.fields.bootMode = {
                fuseIdx: fuseIdx,
                value: validation.value,
                enable: document.getElementById('bootModeEnable').checked,
                write: document.getElementById('bootModeWrite').checked,
                writeProt: document.getElementById('bootModeWriteProt').checked,
                override: document.getElementById('bootModeOverride').checked
            };
        }
    }

    // Collect Extended OTP
    if (visibleFields.includes('extOtp')) {
        const offset = parseInt(document.getElementById('extOtpOffset').value);
        const size = parseInt(document.getElementById('extOtpSize').value);
        const data = document.getElementById('extOtpData').value.trim();
        const wpFlags = document.getElementById('extOtpWpFlags').value.trim();
        const rpFlags = document.getElementById('extOtpRpFlags').value.trim();

        if (data) {
            const validation = validateHex(data);
            if (!validation.valid) {
                throw new Error(`Extended OTP Data: ${validation.error}`);
            }

            const wpValidation = validateHex(wpFlags || '0x0');
            const rpValidation = validateHex(rpFlags || '0x0');

            if (!wpValidation.valid) {
                throw new Error(`Extended OTP WP Flags: ${wpValidation.error}`);
            }
            if (!rpValidation.valid) {
                throw new Error(`Extended OTP RP Flags: ${rpValidation.error}`);
            }

            config.fields.extOtp = {
                offset: offset,
                size: size,
                data: validation.value,
                wpFlags: wpValidation.value,
                rpFlags: rpValidation.value,
                enable: document.getElementById('extOtpEnable').checked,
                write: document.getElementById('extOtpWrite').checked,
                override: document.getElementById('extOtpOverride').checked
            };
        }
    }

    return config;
}

// Build binary blob with exact Python implementation format
function buildBlobExact(config) {
    const blob = [];

    // Calculate body size first (we'll update header later)
    const bodyBlob = buildBodyBlob(config);
    const totalSize = 20 + bodyBlob.length; // 20 bytes for header

    // Header: struct keywriter_lite_header
    blob.push(...writeUint16LE(0x9012));        // magic
    blob.push(...writeUint16LE(totalSize));     // size
    blob.push(...writeUint8(0));                // abi_major
    blob.push(...writeUint8(1));                // abi_minor
    blob.push(...writeUint16LE(0));             // reserved0
    blob.push(...writeUint32LE(config.cmdIdValue)); // cmd_id
    blob.push(...writeUint32LE(0));             // reserved1[0]
    blob.push(...writeUint32LE(0));             // reserved1[1]

    // Add body
    blob.push(...bodyBlob);

    return blob;
}

function buildBodyBlob(config) {
    const blob = [];

    // Add MPK Options if present
    if (config.fields.mpkOpts) {
        blob.push(...buildMpkOpts(config.fields.mpkOpts));
    }

    // Add SMPKH if present
    if (config.fields.smpkh) {
        blob.push(...buildMpkh(config.fields.smpkh, true));
    }

    // Add BMPKH if present
    if (config.fields.bmpkh) {
        blob.push(...buildMpkh(config.fields.bmpkh, false));
    }

    // Add Key Count if present
    if (config.fields.keyCnt) {
        blob.push(...buildKeyCnt(config.fields.keyCnt));
    }

    // Add Key Revision if present
    if (config.fields.keyRev) {
        blob.push(...buildKeyRev(config.fields.keyRev));
    }

    // Add SBL Software Revision if present
    if (config.fields.sblSwrev) {
        blob.push(...buildSblSwrev(config.fields.sblSwrev));
    }

    // Add SYSFW Software Revision if present
    if (config.fields.sysfwSwrev) {
        blob.push(...buildSysfwSwrev(config.fields.sysfwSwrev));
    }

    // Add BoardConfig Software Revision if present
    if (config.fields.brdcfgSwrev) {
        blob.push(...buildBrdcfgSwrev(config.fields.brdcfgSwrev));
    }

    // Add MSV if present
    if (config.fields.msv) {
        blob.push(...buildMsv(config.fields.msv));
    }

    // Add JTAG Disable if present
    if (config.fields.jtagDisable) {
        blob.push(...buildJtagDisable(config.fields.jtagDisable));
    }

    // Add Boot Mode if present
    if (config.fields.bootMode) {
        blob.push(...buildBootMode(config.fields.bootMode));
    }

    // Add Extended OTP if present
    if (config.fields.extOtp) {
        blob.push(...buildExtOtp(config.fields.extOtp));
    }

    return blob;
}

// Build individual field structures (exact format from Python)
function buildMpkOpts(field) {
    const blob = [];
    const opts = parseInt(field.value, 16);

    blob.push(...writeUint32LE(FIELD_HEADERS.mpkOpts));  // field_header
    blob.push(...writeUint32LE(createActionFlags(false, false, false, false))); // action_flags (always inactive for mpk_opts)
    blob.push(...writeUint16LE(opts));                   // options
    blob.push(...writeUint16LE(0));                      // reserved_field
    blob.push(...writeUint32LE(0));                      // reserved[0]
    blob.push(...writeUint32LE(0));                      // reserved[1]

    return blob;
}

function buildMpkh(field, isSmpkh) {
    const blob = [];

    blob.push(...writeUint32LE(isSmpkh ? FIELD_HEADERS.smpkh : FIELD_HEADERS.bmpkh)); // field_header
    blob.push(...writeUint32LE(createActionFlags(field.enable, field.override, false, field.writeProt))); // action_flags

    // mpkh[64] - 512 bits = 64 bytes
    const hashBytes = field.value.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
    blob.push(...hashBytes);

    blob.push(...writeUint32LE(0));  // reserved[0]
    blob.push(...writeUint32LE(0));  // reserved[1]

    return blob;
}

function buildKeyCnt(field) {
    const blob = [];
    const count = (1 << field.value) - 1; // Bitmask formula

    blob.push(...writeUint32LE(FIELD_HEADERS.keyCnt));  // field_header
    blob.push(...writeUint32LE(createActionFlags(field.enable, field.override, false, field.writeProt))); // action_flags
    blob.push(...writeUint32LE(count));                 // count
    blob.push(...writeUint32LE(0));                     // reserved[0]
    blob.push(...writeUint32LE(0));                     // reserved[1]

    return blob;
}

function buildKeyRev(field) {
    const blob = [];
    const revision = (1 << field.value) - 1; // Bitmask formula

    blob.push(...writeUint32LE(FIELD_HEADERS.keyRev));  // field_header
    blob.push(...writeUint32LE(createActionFlags(field.enable, field.override, false, field.writeProt))); // action_flags
    blob.push(...writeUint32LE(revision));              // revision
    blob.push(...writeUint32LE(0));                     // reserved[0]
    blob.push(...writeUint32LE(0));                     // reserved[1]

    return blob;
}

function buildSblSwrev(field) {
    const blob = [];
    const swrev = (1 << field.value) - 1; // Bitmask formula

    blob.push(...writeUint32LE(FIELD_HEADERS.sblSwrev)); // field_header
    blob.push(...writeUint32LE(createActionFlags(field.enable, field.override, false, field.writeProt))); // action_flags
    blob.push(...writeUint64LE(swrev));                  // swrev (64-bit)
    blob.push(...writeUint32LE(0));                      // reserved[0]
    blob.push(...writeUint32LE(0));                      // reserved[1]
    blob.push(...writeUint32LE(0));                      // reserved[2]

    return blob;
}

function buildSysfwSwrev(field) {
    const blob = [];
    const swrev = (1 << field.value) - 1; // Bitmask formula

    blob.push(...writeUint32LE(FIELD_HEADERS.sysfwSwrev)); // field_header
    blob.push(...writeUint32LE(createActionFlags(field.enable, field.override, false, field.writeProt))); // action_flags
    blob.push(...writeUint64LE(swrev));                    // swrev (64-bit)
    blob.push(...writeUint32LE(0));                        // reserved[0]
    blob.push(...writeUint32LE(0));                        // reserved[1]
    blob.push(...writeUint32LE(0));                        // reserved[2]

    return blob;
}

function buildBrdcfgSwrev(field) {
    const blob = [];
    const swrev = (1 << field.value) - 1; // Bitmask formula

    blob.push(...writeUint32LE(FIELD_HEADERS.brdcfgSwrev)); // field_header
    blob.push(...writeUint32LE(createActionFlags(field.enable, field.override, false, field.writeProt))); // action_flags
    blob.push(...writeUint64LE(swrev));                     // swrev (64-bit)
    blob.push(...writeUint32LE(0));                         // reserved[0]
    blob.push(...writeUint32LE(0));                         // reserved[1]
    blob.push(...writeUint32LE(0));                         // reserved[2]
    blob.push(...writeUint32LE(0));                         // reserved[3]

    return blob;
}

function buildMsv(field) {
    const blob = [];
    const msv = parseInt(field.value, 16);

    blob.push(...writeUint32LE(FIELD_HEADERS.msv));     // field_header
    blob.push(...writeUint32LE(createActionFlags(field.enable, field.override, false, field.writeProt))); // action_flags
    blob.push(...writeUint32LE(msv));                   // msv
    blob.push(...writeUint32LE(0));                     // reserved[0]
    blob.push(...writeUint32LE(0));                     // reserved[1]

    return blob;
}

function buildJtagDisable(field) {
    const blob = [];
    const disable = field.enable ? 15 : 0;

    blob.push(...writeUint32LE(FIELD_HEADERS.jtagDisable)); // field_header
    blob.push(...writeUint32LE(createActionFlags(field.enable, field.override, false, field.writeProt))); // action_flags
    blob.push(...writeUint32LE(disable));                   // jtag_disable
    blob.push(...writeUint32LE(0));                         // reserved[0]
    blob.push(...writeUint32LE(0));                         // reserved[1]

    return blob;
}

function buildBootMode(field) {
    const blob = [];
    const bootMode = parseInt(field.value, 16) & 0x1ffffff; // Mask to 25 bits

    blob.push(...writeUint32LE(FIELD_HEADERS.bootMode)); // field_header
    blob.push(...writeUint32LE(createActionFlags(field.enable, field.override, false, field.writeProt))); // action_flags
    blob.push(...writeUint32LE(field.fuseIdx));          // fuse_id
    blob.push(...writeUint32LE(bootMode));               // boot_mode
    blob.push(...writeUint32LE(0));                      // reserved[0]
    blob.push(...writeUint32LE(0));                      // reserved[1]

    return blob;
}

function buildExtOtp(field) {
    const blob = [];

    blob.push(...writeUint32LE(FIELD_HEADERS.extOtp));  // field_header
    blob.push(...writeUint32LE(createActionFlags(field.enable, field.override, false, false))); // action_flags (no WP for ext_otp)
    blob.push(...writeUint16LE(field.size));             // ext_otp_size
    blob.push(...writeUint16LE(field.offset));           // ext_otp_index

    // ext_otp_rpwp[16] - 128 bits for read/write protect flags
    const wpBytes = field.wpFlags.padStart(32, '0').match(/.{1,2}/g).map(b => parseInt(b, 16));
    const rpBytes = field.rpFlags.padStart(32, '0').match(/.{1,2}/g).map(b => parseInt(b, 16));
    // Interleave WP and RP bytes (first 8 bytes WP, next 8 bytes RP)
    blob.push(...wpBytes.slice(0, 8));
    blob.push(...rpBytes.slice(0, 8));

    // ext_otp[128] - OTP data
    const dataBytes = field.data.padEnd(256, '0').match(/.{1,2}/g).map(b => parseInt(b, 16));
    blob.push(...dataBytes.slice(0, 128));

    // reserved[4]
    blob.push(...writeUint32LE(0));
    blob.push(...writeUint32LE(0));
    blob.push(...writeUint32LE(0));
    blob.push(...writeUint32LE(0));

    return blob;
}

// Generate C file
function generateCFile() {
    try {
        const config = collectConfiguration();
        const cContent = buildCFile(config);

        // Create download link
        const blob = new Blob([cContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        displayCFileResult(url, cContent);
    } catch (error) {
        displayError(error.message);
    }
}

// Build C file content
function buildCFile(config) {
    let c = `/* Key Configuration C File\n`;
    c += ` * Generated by TI SCI Web Tools - Key Configuration Tool\n`;
    c += ` * Device: ${config.device}\n`;
    c += ` * Command ID: ${config.cmdId} (${config.cmdIdValue})\n`;
    c += ` * \n`;
    c += ` * WARNING: This is a reference implementation.\n`;
    c += ` * For production use, please use the official Python tool:\n`;
    c += ` * https://github.com/TexasInstruments/security-utils/tree/release\n`;
    c += ` */\n\n`;
    c += `#include <stdint.h>\n\n`;

    // Add header structure
    c += `struct keywriter_lite_header {\n`;
    c += `    uint16_t magic;\n`;
    c += `    uint16_t size;\n`;
    c += `    uint8_t abi_major;\n`;
    c += `    uint8_t abi_minor;\n`;
    c += `    uint16_t reserved0;\n`;
    c += `    uint32_t cmd_id;\n`;
    c += `    uint32_t reserved1[2];\n`;
    c += `} __attribute__((packed));\n\n`;

    // Add field structures
    Object.keys(config.fields).forEach(fieldName => {
        const field = config.fields[fieldName];

        if (fieldName === 'smpkh' || fieldName === 'bmpkh') {
            c += `struct mpkh {\n`;
            c += `    uint32_t field_header;\n`;
            c += `    uint32_t action_flags;\n`;
            c += `    uint8_t mpkh[64];\n`;
            c += `    uint32_t reserved[2];\n`;
            c += `} __attribute__((packed));\n\n`;
        }
        // Add other structures as needed...
    });

    c += `// Configuration data\n`;
    c += `// Please review and validate all values before use\n`;

    return c;
}

// Save configuration to JSON
function saveConfiguration() {
    try {
        const config = collectConfiguration();
        const json = JSON.stringify(config, null, 2);

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `keywriter_config_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        displaySuccess('Configuration saved successfully');
    } catch (error) {
        displayError(error.message);
    }
}

// Load configuration from JSON
function loadConfiguration(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const config = JSON.parse(e.target.result);
            applyConfiguration(config);
            displaySuccess(`Configuration loaded from ${file.name}`);
        } catch (error) {
            displayError(`Error loading configuration: ${error.message}`);
        }
    };
    reader.readAsText(file);
}

// Apply configuration to form
function applyConfiguration(config) {
    // Set device and command ID
    document.getElementById('deviceSelect').value = config.device;
    document.getElementById('cmdIdSelect').value = config.cmdId;
    updateFieldVisibility();

    // Apply field values
    Object.keys(config.fields).forEach(fieldName => {
        const field = config.fields[fieldName];

        if (fieldName === 'mpkOpts') {
            document.getElementById('mpkOpts').value = field.rawValue || `0x${field.value}`;
        } else if (fieldName === 'smpkh' || fieldName === 'bmpkh') {
            document.getElementById(fieldName + 'Value').value = field.value;
            document.getElementById(fieldName + 'Enable').checked = field.enable;
            document.getElementById(fieldName + 'Write').checked = field.write;
            document.getElementById(fieldName + 'WriteProt').checked = field.writeProt;
            document.getElementById(fieldName + 'Override').checked = field.override;
        } else if (fieldName === 'bootMode') {
            document.getElementById('bootModeFuseIdx').value = field.fuseIdx;
            document.getElementById('bootModeValue').value = field.value;
            document.getElementById('bootModeEnable').checked = field.enable;
            document.getElementById('bootModeWrite').checked = field.write;
            document.getElementById('bootModeWriteProt').checked = field.writeProt;
            document.getElementById('bootModeOverride').checked = field.override;
        } else if (fieldName === 'extOtp') {
            document.getElementById('extOtpOffset').value = field.offset;
            document.getElementById('extOtpSize').value = field.size;
            document.getElementById('extOtpData').value = field.data;
            document.getElementById('extOtpWpFlags').value = field.wpFlags;
            document.getElementById('extOtpRpFlags').value = field.rpFlags;
            document.getElementById('extOtpEnable').checked = field.enable;
            document.getElementById('extOtpWrite').checked = field.write;
            document.getElementById('extOtpOverride').checked = field.override;
        } else if (fieldName !== 'jtagDisable') {
            const fieldId = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
            document.getElementById(fieldId + 'Value').value = field.value;
            document.getElementById(fieldId + 'Enable').checked = field.enable;
            document.getElementById(fieldId + 'Write').checked = field.write;
            document.getElementById(fieldId + 'WriteProt').checked = field.writeProt;
            document.getElementById(fieldId + 'Override').checked = field.override;
        } else {
            document.getElementById('jtagDisableEnable').checked = field.enable;
            document.getElementById('jtagDisableWrite').checked = field.write;
            document.getElementById('jtagDisableWriteProt').checked = field.writeProt;
            document.getElementById('jtagDisableOverride').checked = field.override;
        }
    });
}

// Display blob result
function displayBlobResult(url, size, config) {
    resultsContainer.innerHTML = '';

    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-card';
    resultDiv.innerHTML = `
        <h3>Binary Blob Generated</h3>
        <p><strong>Size:</strong> ${size} bytes</p>
        <p><strong>Command ID:</strong> ${config.cmdId} (${config.cmdIdValue})</p>
        <p><strong>Device:</strong> ${config.device}</p>
        <div class="button-group">
            <a href="${url}" download="keywriter_blob_${Date.now()}.bin" class="download-btn">Download Binary Blob</a>
        </div>
        <p class="info-text">This blob uses the exact binary format from TI's Python keywriter-lite tool.</p>
        <p class="info-text">Use this binary file with the U-Boot keywriter-lite feature.</p>
    `;

    resultsContainer.appendChild(resultDiv);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Display C file result
function displayCFileResult(url, content) {
    resultsContainer.innerHTML = '';

    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-card';
    resultDiv.innerHTML = `
        <h3>C File Generated</h3>
        <div class="button-group">
            <a href="${url}" download="keywriter_config_${Date.now()}.c" class="download-btn">Download C File</a>
        </div>
        <h4>Preview:</h4>
        <pre class="code-preview">${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}</pre>
    `;

    resultsContainer.appendChild(resultDiv);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Display success message
function displaySuccess(message) {
    resultsContainer.innerHTML = '';

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    resultsContainer.appendChild(successDiv);

    resultsSection.style.display = 'block';

    setTimeout(() => {
        resultsSection.style.display = 'none';
    }, 3000);
}

// Display error message
function displayError(message) {
    resultsContainer.innerHTML = '';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    resultsContainer.appendChild(errorDiv);

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
