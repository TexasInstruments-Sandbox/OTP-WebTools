// USB DFU Tool for TI K3 Devices
// Web-based bootloader upload using WebUSB API

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const USB_CONFIG = {
    // TI K3 USB VID/PID combinations
    // VID 0x0451 is Texas Instruments
    devices: [
        { vendorId: 0x0451, productId: 0x6165, name: 'TI AM62x/AM64x' },
        // Note: AM62x and AM64x use the same PID 0x6165 in DFU mode
        // Other K3 devices may use different PIDs - to be verified
    ],

    // USB configuration
    configurationValue: 1,
    interfaceNumber: 0,
    alternateInterface: 0,   // alt=0 for bootloader (tiboot3.bin), alt=1 for SocId

    // DFU Transfer parameters
    chunkSize: 4096,         // 4KB chunks (typical DFU block size)
    transferTimeout: 5000,   // 5 second timeout
    maxRetries: 3,           // Retry failed transfers up to 3 times
    statusPollInterval: 100  // Poll status every 100ms
};

// DFU Protocol Commands (USB DFU 1.1 Specification)
const DFU_COMMANDS = {
    DFU_DETACH: 0,    // Detach from DFU mode
    DFU_DNLOAD: 1,    // Download (host to device)
    DFU_UPLOAD: 2,    // Upload (device to host)
    DFU_GETSTATUS: 3, // Get device status
    DFU_CLRSTATUS: 4, // Clear error status
    DFU_GETSTATE: 5,  // Get device state
    DFU_ABORT: 6      // Abort current operation
};

// DFU States (USB DFU 1.1 Specification)
const DFU_STATE = {
    appIDLE: 0,              // Device is running app, waiting for DFU
    appDETACH: 1,            // Device is running app, will detach
    dfuIDLE: 2,              // Device is in DFU mode, idle
    dfuDNLOAD_SYNC: 3,       // Device received block, waiting for status
    dfuDNBUSY: 4,            // Device is programming
    dfuDNLOAD_IDLE: 5,       // Download complete, ready for next block
    dfuMANIFEST_SYNC: 6,     // Device received last block, waiting for manifest
    dfuMANIFEST: 7,          // Device is manifesting (programming/verifying)
    dfuMANIFEST_WAIT_RESET: 8, // Manifest complete, waiting for reset
    dfuUPLOAD_IDLE: 9,       // Device ready for upload
    dfuERROR: 10             // Error occurred
};

// DFU Status codes
const DFU_STATUS = {
    OK: 0x00,                // No error
    errTARGET: 0x01,         // File not for this device
    errFILE: 0x02,           // File is corrupt
    errWRITE: 0x03,          // Device cannot write memory
    errERASE: 0x04,          // Erase failed
    errCHECK_ERASED: 0x05,   // Erase check failed
    errPROG: 0x06,           // Program failed
    errVERIFY: 0x07,         // Verify failed
    errADDRESS: 0x08,        // Address out of range
    errNOTDONE: 0x09,        // Firmware incomplete
    errFIRMWARE: 0x0A,       // Vendor-specific error
    errVENDOR: 0x0B,         // Vendor-specific error
    errUSBR: 0x0C,           // Unexpected USB reset
    errPOR: 0x0D,            // Unexpected power-on reset
    errUNKNOWN: 0x0E,        // Something went wrong
    errSTALLEDPKT: 0x0F      // Device stalled packet
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const appState = {
    usbDevice: null,
    deviceInfo: null,
    selectedFile: null,
    isUploading: false,
    uploadProgress: {
        bytesTransferred: 0,
        totalBytes: 0,
        startTime: null
    }
};

// ============================================================================
// DOM ELEMENTS (initialized on load)
// ============================================================================

let elements = {};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    checkBrowserCompatibility();
    attachEventListeners();
    setupDragAndDrop();
});

function initializeElements() {
    elements = {
        browserWarning: document.getElementById('browser-warning'),
        connectBtn: document.getElementById('connect-btn'),
        statusIndicator: document.getElementById('status-indicator'),
        statusText: document.getElementById('status-text'),
        deviceInfo: document.getElementById('device-info'),
        deviceInfoContent: document.getElementById('device-info-content'),
        uploadSection: document.getElementById('upload-section'),
        dropZone: document.getElementById('drop-zone'),
        fileInput: document.getElementById('file-input'),
        fileInfo: document.getElementById('file-info'),
        fileInfoContent: document.getElementById('file-info-content'),
        uploadBtn: document.getElementById('upload-btn'),
        progressSection: document.getElementById('progress-section'),
        progressFill: document.getElementById('progress-fill'),
        progressPercent: document.getElementById('progress-percent'),
        progressBytes: document.getElementById('progress-bytes'),
        progressSpeed: document.getElementById('progress-speed'),
        uploadStatus: document.getElementById('upload-status'),
        resultsSection: document.getElementById('results-section'),
        resultsContent: document.getElementById('results-content')
    };
}

function checkBrowserCompatibility() {
    if (!navigator.usb) {
        elements.browserWarning.style.display = 'block';
        elements.connectBtn.disabled = true;
        elements.connectBtn.textContent = 'WebUSB Not Supported';
        return false;
    }
    return true;
}

function attachEventListeners() {
    // Device connection
    if (elements.connectBtn) {
        elements.connectBtn.addEventListener('click', handleConnectDevice);
    }

    // File upload
    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', handleFileSelect);
    }

    // Upload button
    if (elements.uploadBtn) {
        elements.uploadBtn.addEventListener('click', handleUploadClick);
    }

    // USB device events
    if (navigator.usb) {
        navigator.usb.addEventListener('connect', handleDeviceConnected);
        navigator.usb.addEventListener('disconnect', handleDeviceDisconnected);
    }
}

// ============================================================================
// USB DEVICE CONNECTION
// ============================================================================

async function handleConnectDevice() {
    try {
        const device = await navigator.usb.requestDevice({
            filters: USB_CONFIG.devices
        });

        await openDevice(device);
    } catch (error) {
        handleConnectionError(error);
    }
}

async function openDevice(device) {
    try {
        // Open device
        await device.open();

        // Select configuration
        if (device.configuration === null) {
            await device.selectConfiguration(USB_CONFIG.configurationValue);
        }

        // Claim interface
        await device.claimInterface(USB_CONFIG.interfaceNumber);

        // Select alternate interface (alt=0 for bootloader)
        await device.selectAlternateInterface(USB_CONFIG.interfaceNumber, USB_CONFIG.alternateInterface);

        // Store device reference
        appState.usbDevice = device;
        appState.deviceInfo = extractDeviceInfo(device);

        // Clear any DFU errors from previous sessions
        try {
            await dfuClearStatus(device);
        } catch (e) {
            console.warn('Could not clear DFU status (may not be in DFU mode yet):', e);
        }

        // Update UI
        updateDeviceStatus('connected');
        displayDeviceInfo(appState.deviceInfo);
        showUploadSection();

        console.log('Device connected:', appState.deviceInfo);
    } catch (error) {
        console.error('Error opening device:', error);
        displayError('Failed to open device: ' + error.message);
    }
}

function extractDeviceInfo(device) {
    const deviceName = identifyDevice(device.vendorId, device.productId);

    return {
        vendorId: device.vendorId,
        productId: device.productId,
        serialNumber: device.serialNumber || 'N/A',
        manufacturer: device.manufacturerName || 'Unknown',
        product: device.productName || 'Unknown',
        deviceName: deviceName
    };
}

function identifyDevice(vendorId, productId) {
    const device = USB_CONFIG.devices.find(
        d => d.vendorId === vendorId && d.productId === productId
    );
    return device ? device.name : `Unknown Device (0x${vendorId.toString(16)}:0x${productId.toString(16)})`;
}

function updateDeviceStatus(status) {
    if (status === 'connected') {
        elements.statusIndicator.style.backgroundColor = '#28a745'; // Green
        elements.statusText.textContent = 'Device connected';
        elements.connectBtn.textContent = 'Connected';
        elements.connectBtn.disabled = true;
    } else {
        elements.statusIndicator.style.backgroundColor = '#dc3545'; // Red
        elements.statusText.textContent = 'No device connected';
        elements.connectBtn.textContent = 'Connect Device';
        elements.connectBtn.disabled = false;
    }
}

function displayDeviceInfo(info) {
    const html = `
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
            <span style="font-weight: 500; color: #666;">Device:</span>
            <span style="font-weight: 600;">${info.deviceName}</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
            <span style="font-weight: 500; color: #666;">Vendor ID:</span>
            <span>0x${info.vendorId.toString(16).padStart(4, '0').toUpperCase()}</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
            <span style="font-weight: 500; color: #666;">Product ID:</span>
            <span>0x${info.productId.toString(16).padStart(4, '0').toUpperCase()}</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
            <span style="font-weight: 500; color: #666;">Manufacturer:</span>
            <span>${info.manufacturer}</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
            <span style="font-weight: 500; color: #666;">Serial Number:</span>
            <span>${info.serialNumber}</span>
        </div>
    `;
    elements.deviceInfoContent.innerHTML = html;
    elements.deviceInfo.style.display = 'block';
}

function showUploadSection() {
    elements.uploadSection.style.display = 'block';
    elements.uploadSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function handleConnectionError(error) {
    if (error.name === 'NotFoundError') {
        displayError('No device selected. Please connect a TI K3 device in USB boot mode and try again.');
    } else if (error.name === 'SecurityError') {
        displayError('Access denied. Please grant USB device permissions when prompted.');
    } else if (error.name === 'NetworkError') {
        displayError('Unable to access device. Please check that the device is in USB boot mode and try again.');
    } else {
        displayError('Connection failed: ' + error.message);
    }
    console.error('Connection error:', error);
}

function handleDeviceConnected(event) {
    console.log('USB device connected:', event.device);
}

async function handleDeviceDisconnected(event) {
    console.log('USB device disconnected:', event.device);

    if (appState.usbDevice && event.device === appState.usbDevice) {
        // Current device disconnected
        appState.usbDevice = null;
        appState.deviceInfo = null;

        updateDeviceStatus('disconnected');
        elements.deviceInfo.style.display = 'none';
        elements.uploadSection.style.display = 'none';

        if (appState.isUploading) {
            appState.isUploading = false;
            displayError('Device disconnected during upload!');
        }
    }
}

// ============================================================================
// FILE HANDLING
// ============================================================================

function setupDragAndDrop() {
    const dropZone = elements.dropZone;

    // Click to select
    dropZone.addEventListener('click', () => {
        elements.fileInput.click();
    });

    // Drag and drop handlers
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.style.borderColor = '#007C8C';
    event.currentTarget.style.backgroundColor = '#f0f8f9';
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.style.borderColor = '#ccc';
    event.currentTarget.style.backgroundColor = 'white';
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.style.borderColor = '#ccc';
    event.currentTarget.style.backgroundColor = 'white';

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        await processFile(file);
    }
}

async function processFile(file) {
    try {
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            displayError(validation.error);
            return;
        }

        // Read file as binary
        const arrayBuffer = await file.arrayBuffer();

        appState.selectedFile = {
            name: file.name,
            size: file.size,
            data: new Uint8Array(arrayBuffer)
        };

        displayFileInfo(appState.selectedFile);
        showUploadButton();

    } catch (error) {
        displayError('Failed to read file: ' + error.message);
        console.error('File read error:', error);
    }
}

function validateFile(file) {
    // Check file extension
    if (!file.name.endsWith('.bin')) {
        return { valid: false, error: 'File must have .bin extension' };
    }

    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        return { valid: false, error: 'File too large (maximum 10MB)' };
    }

    const minSize = 1024; // 1KB
    if (file.size < minSize) {
        return { valid: false, error: 'File too small (minimum 1KB)' };
    }

    return { valid: true };
}

function displayFileInfo(fileInfo) {
    const html = `
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
            <span style="font-weight: 500; color: #666;">Filename:</span>
            <span style="font-weight: 600;">${fileInfo.name}</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
            <span style="font-weight: 500; color: #666;">Size:</span>
            <span>${formatBytes(fileInfo.size)}</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
            <span style="font-weight: 500; color: #666;">Format:</span>
            <span>Binary (.bin)</span>
        </div>
    `;
    elements.fileInfoContent.innerHTML = html;
    elements.fileInfo.style.display = 'block';
}

function showUploadButton() {
    elements.uploadBtn.style.display = 'block';
    elements.uploadBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ============================================================================
// USB UPLOAD PROTOCOL
// ============================================================================

async function handleUploadClick() {
    if (!appState.usbDevice || !appState.selectedFile) {
        displayError('Device or file not ready');
        return;
    }

    appState.isUploading = true;
    showProgressSection();

    try {
        await uploadBootloader(appState.usbDevice, appState.selectedFile.data);
        displaySuccess('Upload completed successfully! Device should now boot with the new bootloader.');
    } catch (error) {
        displayError('Upload failed: ' + error.message);
        console.error('Upload error:', error);
    } finally {
        appState.isUploading = false;
    }
}

async function uploadBootloader(device, data) {
    const totalBytes = data.length;
    const chunkSize = USB_CONFIG.chunkSize;
    const numBlocks = Math.ceil(totalBytes / chunkSize);

    // Initialize progress
    appState.uploadProgress = {
        bytesTransferred: 0,
        totalBytes: totalBytes,
        startTime: Date.now()
    };

    console.log(`Starting DFU upload: ${totalBytes} bytes in ${numBlocks} blocks`);

    // Clear any previous DFU errors
    await dfuClearStatus(device);

    // Upload data in blocks
    let blockNum = 0;
    for (let offset = 0; offset < totalBytes; offset += chunkSize) {
        const chunk = data.slice(offset, Math.min(offset + chunkSize, totalBytes));

        // Upload block with retry logic
        let success = false;
        for (let attempt = 0; attempt < USB_CONFIG.maxRetries && !success; attempt++) {
            try {
                await dfuDownload(device, blockNum, chunk);

                // Wait for device to process the block
                await dfuWaitForIdle(device);

                success = true;
            } catch (error) {
                console.warn(`Block ${blockNum} failed (attempt ${attempt + 1}/${USB_CONFIG.maxRetries}):`, error);
                if (attempt === USB_CONFIG.maxRetries - 1) {
                    throw new Error(`Transfer failed at block ${blockNum} after ${USB_CONFIG.maxRetries} attempts: ${error.message}`);
                }
                // Clear error and retry
                await dfuClearStatus(device);
                await sleep(100);
            }
        }

        blockNum++;

        // Update progress
        appState.uploadProgress.bytesTransferred = offset + chunk.length;
        updateProgressUI();

        // Check for cancellation
        if (!appState.isUploading) {
            throw new Error('Upload cancelled by user');
        }
    }

    // Send zero-length download to signal completion
    console.log('Sending completion signal (zero-length download)');
    await dfuDownload(device, blockNum, new Uint8Array(0));

    // Wait for device to manifest (program/verify)
    console.log('Waiting for device to complete programming...');
    await dfuWaitForManifest(device);

    console.log('Upload complete! Device should reset and boot.');
}

// ============================================================================
// DFU PROTOCOL IMPLEMENTATION
// ============================================================================

async function dfuDownload(device, blockNum, data) {
    // DFU_DNLOAD control transfer
    // Send data block to device for programming
    const result = await device.controlTransferOut({
        requestType: 'class',      // Class-specific request
        recipient: 'interface',    // Target interface
        request: DFU_COMMANDS.DFU_DNLOAD,
        value: blockNum,           // Block number (wValue)
        index: USB_CONFIG.interfaceNumber // Interface number (wIndex)
    }, data);

    if (result.status !== 'ok') {
        throw new Error(`DFU_DNLOAD failed with status: ${result.status}`);
    }

    console.log(`DFU_DNLOAD block ${blockNum}: ${data.length} bytes, status: ${result.status}`);
}

async function dfuGetStatus(device) {
    // DFU_GETSTATUS control transfer
    // Request 6 bytes of status information
    const result = await device.controlTransferIn({
        requestType: 'class',
        recipient: 'interface',
        request: DFU_COMMANDS.DFU_GETSTATUS,
        value: 0,
        index: USB_CONFIG.interfaceNumber
    }, 6);

    if (result.status !== 'ok' || !result.data) {
        throw new Error(`DFU_GETSTATUS failed with status: ${result.status}`);
    }

    // Parse status response
    const view = new DataView(result.data.buffer);
    const status = {
        bStatus: view.getUint8(0),           // Status code
        bwPollTimeout: view.getUint8(1) |    // Minimum time (ms) to wait before next getStatus
                      (view.getUint8(2) << 8) |
                      (view.getUint8(3) << 16),
        bState: view.getUint8(4),            // State code
        iString: view.getUint8(5)            // String descriptor index
    };

    return status;
}

async function dfuClearStatus(device) {
    // DFU_CLRSTATUS control transfer
    // Clear error status and return device to dfuIDLE state
    const result = await device.controlTransferOut({
        requestType: 'class',
        recipient: 'interface',
        request: DFU_COMMANDS.DFU_CLRSTATUS,
        value: 0,
        index: USB_CONFIG.interfaceNumber
    });

    if (result.status !== 'ok') {
        throw new Error(`DFU_CLRSTATUS failed with status: ${result.status}`);
    }

    console.log('DFU status cleared');
}

async function dfuGetState(device) {
    // DFU_GETSTATE control transfer
    // Request current device state (1 byte)
    const result = await device.controlTransferIn({
        requestType: 'class',
        recipient: 'interface',
        request: DFU_COMMANDS.DFU_GETSTATE,
        value: 0,
        index: USB_CONFIG.interfaceNumber
    }, 1);

    if (result.status !== 'ok' || !result.data) {
        throw new Error(`DFU_GETSTATE failed with status: ${result.status}`);
    }

    const state = new DataView(result.data.buffer).getUint8(0);
    return state;
}

async function dfuWaitForIdle(device) {
    // Poll status until device returns to dfuDNLOAD_IDLE or dfuIDLE state
    let maxAttempts = 100; // Prevent infinite loop
    let attempt = 0;

    while (attempt < maxAttempts) {
        const status = await dfuGetStatus(device);

        const stateName = getDFUStateName(status.bState);
        const statusName = getDFUStatusName(status.bStatus);

        // Check for errors
        if (status.bStatus !== DFU_STATUS.OK) {
            throw new Error(`DFU error: ${statusName} in state ${stateName}`);
        }

        // Check state
        if (status.bState === DFU_STATE.dfuDNLOAD_IDLE || status.bState === DFU_STATE.dfuIDLE) {
            return; // Ready for next block
        }

        if (status.bState === DFU_STATE.dfuERROR) {
            throw new Error(`DFU device in error state: ${statusName}`);
        }

        // Wait for suggested poll timeout
        const waitTime = status.bwPollTimeout || USB_CONFIG.statusPollInterval;
        await sleep(waitTime);

        attempt++;
    }

    throw new Error('Timeout waiting for DFU idle state');
}

async function dfuWaitForManifest(device) {
    // After sending zero-length download, wait for device to manifest (program/verify)
    // Device will transition through dfuMANIFEST_SYNC -> dfuMANIFEST -> dfuMANIFEST_WAIT_RESET
    let maxAttempts = 200; // Allow more time for programming
    let attempt = 0;

    while (attempt < maxAttempts) {
        try {
            const status = await dfuGetStatus(device);

            const stateName = getDFUStateName(status.bState);
            const statusName = getDFUStatusName(status.bStatus);
            console.log(`Manifest: ${stateName}, status: ${statusName}`);

            // Check for errors
            if (status.bStatus !== DFU_STATUS.OK) {
                throw new Error(`DFU error during manifest: ${statusName} in state ${stateName}`);
            }

            // Check if manifestation complete
            if (status.bState === DFU_STATE.dfuMANIFEST_WAIT_RESET) {
                console.log('Manifest complete, device waiting for reset');
                return; // Success!
            }

            if (status.bState === DFU_STATE.dfuIDLE) {
                console.log('Device returned to idle (manifestation complete)');
                return; // Success!
            }

            if (status.bState === DFU_STATE.dfuERROR) {
                throw new Error('DFU device in error state during manifest');
            }

            // Wait before checking again
            const waitTime = status.bwPollTimeout || USB_CONFIG.statusPollInterval;
            await sleep(waitTime);

        } catch (error) {
            // Device may disconnect/reset during manifestation - this is expected
            if (error.name === 'NetworkError' || error.name === 'NotFoundError') {
                console.log('Device disconnected/reset (expected after successful upload)');
                return; // Success!
            }
            throw error;
        }

        attempt++;
    }

    throw new Error('Timeout waiting for DFU manifest completion');
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

function showProgressSection() {
    elements.progressSection.style.display = 'block';
    elements.resultsSection.style.display = 'none';
    elements.progressSection.scrollIntoView({ behavior: 'smooth' });
}

function updateProgressUI() {
    const { bytesTransferred, totalBytes, startTime } = appState.uploadProgress;

    const percent = (bytesTransferred / totalBytes) * 100;
    const elapsed = (Date.now() - startTime) / 1000; // seconds
    const speed = elapsed > 0 ? bytesTransferred / elapsed / 1024 : 0; // KB/s

    // Update progress bar
    elements.progressFill.style.width = percent.toFixed(1) + '%';
    elements.progressFill.textContent = percent.toFixed(1) + '%';

    // Update stats
    elements.progressPercent.textContent = percent.toFixed(1) + '%';
    elements.progressBytes.textContent =
        `${(bytesTransferred / 1024).toFixed(1)} / ${(totalBytes / 1024).toFixed(1)} KB`;
    elements.progressSpeed.textContent = speed.toFixed(1) + ' KB/s';
}

// ============================================================================
// UI FEEDBACK
// ============================================================================

function displayError(message) {
    elements.resultsContent.innerHTML = '';
    elements.progressSection.style.display = 'none';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'padding: 1.5rem; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px; margin-bottom: 1rem;';
    errorDiv.innerHTML = `
        <h3 style="margin: 0 0 0.5rem 0; color: #721c24; font-size: 1.1rem;">❌ Error</h3>
        <p style="margin: 0; color: #721c24;">${message}</p>
    `;

    elements.resultsContent.appendChild(errorDiv);
    elements.resultsSection.style.display = 'block';
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function displaySuccess(message) {
    elements.resultsContent.innerHTML = '';
    elements.progressSection.style.display = 'none';

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = 'padding: 1.5rem; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px; margin-bottom: 1rem;';
    successDiv.innerHTML = `
        <h3 style="margin: 0 0 0.5rem 0; color: #155724; font-size: 1.1rem;">✅ Success</h3>
        <p style="margin: 0; color: #155724;">${message}</p>
    `;

    elements.resultsContent.appendChild(successDiv);
    elements.resultsSection.style.display = 'block';
    elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDFUStateName(state) {
    const stateNames = {
        0: 'appIDLE',
        1: 'appDETACH',
        2: 'dfuIDLE',
        3: 'dfuDNLOAD_SYNC',
        4: 'dfuDNBUSY',
        5: 'dfuDNLOAD_IDLE',
        6: 'dfuMANIFEST_SYNC',
        7: 'dfuMANIFEST',
        8: 'dfuMANIFEST_WAIT_RESET',
        9: 'dfuUPLOAD_IDLE',
        10: 'dfuERROR'
    };
    return stateNames[state] || `Unknown(${state})`;
}

function getDFUStatusName(status) {
    const statusNames = {
        0x00: 'OK',
        0x01: 'errTARGET',
        0x02: 'errFILE',
        0x03: 'errWRITE',
        0x04: 'errERASE',
        0x05: 'errCHECK_ERASED',
        0x06: 'errPROG',
        0x07: 'errVERIFY',
        0x08: 'errADDRESS',
        0x09: 'errNOTDONE',
        0x0A: 'errFIRMWARE',
        0x0B: 'errVENDOR',
        0x0C: 'errUSBR',
        0x0D: 'errPOR',
        0x0E: 'errUNKNOWN',
        0x0F: 'errSTALLEDPKT'
    };
    return statusNames[status] || `Unknown(0x${status.toString(16)})`;
}
