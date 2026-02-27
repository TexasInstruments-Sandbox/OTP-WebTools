// U-Boot Toolkit for TI K3 Devices
// Configure uEnv.txt, Falcon mode, and boot logos

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
    logoImage: null,
    logoImageData: null,
    configMode: 'uenv' // 'uenv' or 'extlinux'
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

let elements = {};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    attachEventListeners();
    updatePreview();
});

function initializeElements() {
    elements = {
        // Mode selector
        modeUenv: document.getElementById('mode-uenv'),
        modeExtlinux: document.getElementById('mode-extlinux'),

        // Import
        importUenv: document.getElementById('import-uenv'),

        // Boot configuration
        bootdelay: document.getElementById('bootdelay'),
        bootcmd: document.getElementById('bootcmd'),
        bootargs: document.getElementById('bootargs'),
        fdtfile: document.getElementById('fdtfile'),
        mmcdev: document.getElementById('mmcdev'),
        bootpart: document.getElementById('bootpart'),
        bootdir: document.getElementById('bootdir'),

        // Network configuration
        ipaddr: document.getElementById('ipaddr'),
        serverip: document.getElementById('serverip'),
        netmask: document.getElementById('netmask'),

        // Falcon mode
        falconEnable: document.getElementById('falcon-enable'),
        falconConfig: document.getElementById('falcon-config'),
        falconBootpart: document.getElementById('falcon-bootpart'),
        falconArgs: document.getElementById('falcon-args'),

        // Boot logo
        logoEnable: document.getElementById('logo-enable'),
        logoConfig: document.getElementById('logo-config'),
        logoFile: document.getElementById('logo-file'),
        logoPreview: document.getElementById('logo-preview'),
        logoCanvas: document.getElementById('logo-canvas'),
        logoDimensions: document.getElementById('logo-dimensions'),

        // Preview and export
        previewHeading: document.getElementById('preview-heading'),
        uenvPreview: document.getElementById('uenv-preview'),
        copyBtn: document.getElementById('copy-btn'),
        exportBtn: document.getElementById('export-btn'),
        resetBtn: document.getElementById('reset-btn')
    };
}

function attachEventListeners() {
    // Mode selector
    if (elements.modeUenv) {
        elements.modeUenv.addEventListener('change', function() {
            state.configMode = 'uenv';
            updatePreview();
        });
    }
    if (elements.modeExtlinux) {
        elements.modeExtlinux.addEventListener('change', function() {
            state.configMode = 'extlinux';
            updatePreview();
        });
    }

    // Import existing uEnv.txt
    if (elements.importUenv) {
        elements.importUenv.addEventListener('change', handleImportUenv);
    }

    // Update preview on any input change
    const inputs = [
        elements.bootdelay, elements.bootcmd, elements.bootargs, elements.fdtfile,
        elements.mmcdev, elements.bootpart, elements.bootdir,
        elements.ipaddr, elements.serverip, elements.netmask,
        elements.falconBootpart, elements.falconArgs
    ];

    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', updatePreview);
        }
    });

    // Falcon mode toggle
    if (elements.falconEnable) {
        elements.falconEnable.addEventListener('change', function() {
            elements.falconConfig.style.display = this.checked ? 'block' : 'none';
            updatePreview();
        });
    }

    // Boot logo toggle
    if (elements.logoEnable) {
        elements.logoEnable.addEventListener('change', function() {
            elements.logoConfig.style.display = this.checked ? 'block' : 'none';
            updatePreview();
        });
    }

    // Logo file upload
    if (elements.logoFile) {
        elements.logoFile.addEventListener('change', handleLogoUpload);
    }

    // Export buttons
    if (elements.copyBtn) {
        elements.copyBtn.addEventListener('click', copyToClipboard);
    }

    if (elements.exportBtn) {
        elements.exportBtn.addEventListener('click', exportUEnv);
    }

    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', resetToDefaults);
    }
}

// ============================================================================
// PREVIEW GENERATION
// ============================================================================

function updatePreview() {
    let config = [];

    if (state.configMode === 'uenv') {
        // Generate uEnv.txt format
        config = generateUEnvPreview();
        if (elements.previewHeading) {
            elements.previewHeading.textContent = 'uEnv.txt Preview';
        }
        if (elements.exportBtn) {
            elements.exportBtn.textContent = 'Download uEnv.txt';
        }
    } else {
        // Generate extlinux.conf format
        config = generateExtlinuxPreview();
        if (elements.previewHeading) {
            elements.previewHeading.textContent = 'extlinux.conf Preview';
        }
        if (elements.exportBtn) {
            elements.exportBtn.textContent = 'Download extlinux.conf';
        }
    }

    // Update preview
    if (elements.uenvPreview) {
        elements.uenvPreview.textContent = config.join('\n');
    }
}

function generateUEnvPreview() {
    const config = [];

    // Header
    config.push('# U-Boot Environment Configuration');
    config.push('# Generated by TI Tools U-Boot Toolkit');
    config.push('');

    // Boot configuration
    config.push('# Boot Configuration');
    if (elements.bootdelay && elements.bootdelay.value) {
        config.push(`bootdelay=${elements.bootdelay.value}`);
    }
    if (elements.bootcmd && elements.bootcmd.value) {
        config.push(`bootcmd=${elements.bootcmd.value}`);
    }
    if (elements.bootargs && elements.bootargs.value) {
        config.push(`bootargs=${elements.bootargs.value}`);
    }
    if (elements.fdtfile && elements.fdtfile.value) {
        config.push(`fdtfile=${elements.fdtfile.value}`);
    }
    config.push('');

    // Boot media
    config.push('# Boot Media');
    if (elements.mmcdev && elements.mmcdev.value) {
        config.push(`mmcdev=${elements.mmcdev.value}`);
    }
    if (elements.bootpart && elements.bootpart.value) {
        config.push(`bootpart=${elements.bootpart.value}`);
    }
    if (elements.bootdir && elements.bootdir.value) {
        config.push(`bootdir=${elements.bootdir.value}`);
    }
    config.push('');

    // Network configuration (if any values present)
    const hasNetwork = (elements.ipaddr && elements.ipaddr.value) ||
                       (elements.serverip && elements.serverip.value) ||
                       (elements.netmask && elements.netmask.value);

    if (hasNetwork) {
        config.push('# Network Configuration');
        if (elements.ipaddr && elements.ipaddr.value) {
            config.push(`ipaddr=${elements.ipaddr.value}`);
        }
        if (elements.serverip && elements.serverip.value) {
            config.push(`serverip=${elements.serverip.value}`);
        }
        if (elements.netmask && elements.netmask.value) {
            config.push(`netmask=${elements.netmask.value}`);
        }
        config.push('');
    }

    // Falcon mode
    if (elements.falconEnable && elements.falconEnable.checked) {
        config.push('# Falcon Mode Configuration');
        config.push('falcon_mode=1');
        if (elements.falconBootpart && elements.falconBootpart.value) {
            config.push(`falcon_bootpart=${elements.falconBootpart.value}`);
        }
        if (elements.falconArgs && elements.falconArgs.value) {
            config.push(`falcon_args=${elements.falconArgs.value}`);
        }
        config.push('');
    }

    // Boot logo
    if (elements.logoEnable && elements.logoEnable.checked) {
        config.push('# Boot Logo Configuration');
        config.push('splashimage=0x82000000');
        config.push('splashfile=splash.bmp');
        config.push('# Add to bootcmd: fatload mmc ${mmcdev}:${bootpart} ${splashimage} ${splashfile}; bmp display ${splashimage}');
        config.push('');
    }

    return config;
}

function generateExtlinuxPreview() {
    const config = [];

    // Header
    config.push('# extlinux.conf - Boot Menu Configuration');
    config.push('# Generated by TI Tools U-Boot Toolkit');
    config.push('');

    // Timeout (convert bootdelay to deciseconds * 10)
    const timeout = elements.bootdelay && elements.bootdelay.value
        ? parseInt(elements.bootdelay.value) * 10
        : 20;
    config.push(`TIMEOUT ${timeout}`);
    config.push('');

    // Default entry
    config.push('DEFAULT Linux');
    config.push('');

    // Main boot entry
    config.push('LABEL Linux');
    config.push('    MENU LABEL Linux Kernel');

    // Kernel path
    const bootdir = elements.bootdir && elements.bootdir.value ? elements.bootdir.value : '/boot';
    config.push(`    LINUX ${bootdir}/Image`);

    // FDT (device tree)
    if (elements.fdtfile && elements.fdtfile.value) {
        config.push(`    FDT ${bootdir}/${elements.fdtfile.value}`);
    } else {
        config.push(`    FDT ${bootdir}/dtb`);
    }

    // Append (kernel arguments)
    if (elements.bootargs && elements.bootargs.value) {
        config.push(`    APPEND ${elements.bootargs.value}`);
    } else {
        config.push('    APPEND console=ttyS2,115200n8 root=/dev/mmcblk1p2 rootwait');
    }

    config.push('');

    // Add Falcon mode as alternative boot entry if enabled
    if (elements.falconEnable && elements.falconEnable.checked) {
        config.push('LABEL Falcon');
        config.push('    MENU LABEL Linux Kernel (Falcon Mode)');
        config.push(`    LINUX ${bootdir}/Image`);
        if (elements.fdtfile && elements.fdtfile.value) {
            config.push(`    FDT ${bootdir}/${elements.fdtfile.value}`);
        }
        if (elements.falconArgs && elements.falconArgs.value) {
            config.push(`    APPEND ${elements.falconArgs.value}`);
        }
        config.push('');
    }

    // Boot logo note
    if (elements.logoEnable && elements.logoEnable.checked) {
        config.push('# Boot Logo: Place splash.bmp in boot partition');
        config.push('# U-Boot will display if splashimage is configured');
        config.push('');
    }

    return config;
}

// ============================================================================
// IMPORT HANDLING
// ============================================================================

async function handleImportUenv(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        // Read file as text
        const text = await file.text();

        // Parse key=value pairs
        const lines = text.split('\n');

        for (const line of lines) {
            // Skip comments and empty lines
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Parse key=value
            const match = trimmed.match(/^(\w+)=(.*)$/);
            if (!match) continue;

            const key = match[1];
            const value = match[2];

            // Populate form fields based on key
            switch(key) {
                case 'bootdelay':
                    if (elements.bootdelay) elements.bootdelay.value = value;
                    break;
                case 'bootcmd':
                    if (elements.bootcmd) elements.bootcmd.value = value;
                    break;
                case 'bootargs':
                    if (elements.bootargs) elements.bootargs.value = value;
                    break;
                case 'fdtfile':
                    if (elements.fdtfile) elements.fdtfile.value = value;
                    break;
                case 'mmcdev':
                    if (elements.mmcdev) elements.mmcdev.value = value;
                    break;
                case 'bootpart':
                    if (elements.bootpart) elements.bootpart.value = value;
                    break;
                case 'bootdir':
                    if (elements.bootdir) elements.bootdir.value = value;
                    break;
                case 'ipaddr':
                    if (elements.ipaddr) elements.ipaddr.value = value;
                    break;
                case 'serverip':
                    if (elements.serverip) elements.serverip.value = value;
                    break;
                case 'netmask':
                    if (elements.netmask) elements.netmask.value = value;
                    break;
                case 'falcon_mode':
                    if (elements.falconEnable && (value === '1' || value === 'true')) {
                        elements.falconEnable.checked = true;
                        elements.falconConfig.style.display = 'block';
                    }
                    break;
                case 'falcon_bootpart':
                    if (elements.falconBootpart) elements.falconBootpart.value = value;
                    break;
                case 'falcon_args':
                    if (elements.falconArgs) elements.falconArgs.value = value;
                    break;
                case 'splashimage':
                case 'splashfile':
                    // Enable logo section if splash variables found
                    if (elements.logoEnable) {
                        elements.logoEnable.checked = true;
                        elements.logoConfig.style.display = 'block';
                    }
                    break;
            }
        }

        // Update preview with imported values
        updatePreview();

        // Show success message
        alert('Successfully imported uEnv.txt configuration');

    } catch (error) {
        console.error('Error importing uEnv.txt:', error);
        alert('Failed to import uEnv.txt: ' + error.message);
    }
}

// ============================================================================
// LOGO HANDLING
// ============================================================================

async function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    try {
        // Read image
        const img = await loadImage(file);
        state.logoImage = img;

        // Display preview
        displayLogoPreview(img);

        // Show preview section
        elements.logoPreview.style.display = 'block';

    } catch (error) {
        console.error('Error loading image:', error);
        alert('Failed to load image: ' + error.message);
    }
}

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                resolve(img);
            };
            img.onerror = function() {
                reject(new Error('Failed to decode image'));
            };
            img.src = e.target.result;
        };
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
    });
}

function displayLogoPreview(img) {
    const canvas = elements.logoCanvas;
    const ctx = canvas.getContext('2d');

    // Set canvas size (max 800px width for preview)
    const maxWidth = 800;
    const scale = Math.min(1, maxWidth / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Display dimensions
    elements.logoDimensions.textContent =
        `Original size: ${img.width} × ${img.height} pixels | ` +
        `File size: ${formatBytes((elements.logoFile.files[0].size))}`;
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

function copyToClipboard() {
    const text = elements.uenvPreview.textContent;

    navigator.clipboard.writeText(text).then(() => {
        // Visual feedback
        const originalText = elements.copyBtn.textContent;
        elements.copyBtn.textContent = 'Copied!';
        elements.copyBtn.style.backgroundColor = '#28a745';
        elements.copyBtn.style.color = 'white';

        setTimeout(() => {
            elements.copyBtn.textContent = originalText;
            elements.copyBtn.style.backgroundColor = '';
            elements.copyBtn.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

function exportUEnv() {
    const text = elements.uenvPreview.textContent;

    // Determine filename based on mode
    const filename = state.configMode === 'uenv' ? 'uEnv.txt' : 'extlinux.conf';

    // Create blob
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetToDefaults() {
    if (!confirm('Reset all settings to defaults? This will clear all your custom configuration.')) {
        return;
    }

    // Reset all inputs to defaults
    elements.bootdelay.value = '2';
    elements.bootcmd.value = 'run findfdt; run envboot; bootflow scan -lb';
    elements.bootargs.value = 'console=ttyS2,115200n8 earlycon=ns16550a,mmio32,0x02800000';
    elements.fdtfile.value = '';
    elements.mmcdev.value = '1';
    elements.bootpart.value = '1:2';
    elements.bootdir.value = '/boot';

    elements.ipaddr.value = '';
    elements.serverip.value = '';
    elements.netmask.value = '';

    elements.falconEnable.checked = false;
    elements.falconConfig.style.display = 'none';
    elements.falconBootpart.value = '1:2';
    elements.falconArgs.value = '';

    elements.logoEnable.checked = false;
    elements.logoConfig.style.display = 'none';
    elements.logoFile.value = '';
    elements.logoPreview.style.display = 'none';

    state.logoImage = null;
    state.logoImageData = null;

    updatePreview();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
