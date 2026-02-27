// Boot Mode Configuration Tool for TI Devices
// Reference: AM62x SK Evaluation Modules User Guide (SPRUJ40E)

document.addEventListener('DOMContentLoaded', function() {
    const deviceSelect = document.getElementById('deviceSelect');
    const deviceInfo = document.getElementById('deviceInfo');
    const deviceDocLink = document.getElementById('deviceDocLink');
    const pllClockSelect = document.getElementById('pllClock');
    const primaryBootSelect = document.getElementById('primaryBoot');
    const backupBootSelect = document.getElementById('backupBoot');
    const primaryMediaConfigDiv = document.getElementById('primaryMediaConfig');
    const backupMediaConfigDiv = document.getElementById('backupMediaConfig');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const configSummarySection = document.getElementById('configSummarySection');

    // Device information
    const deviceData = {
        'am62x': {
            name: 'AM62x (AM625, AM623, AM621)',
            reference: 'AM62x SK Evaluation Modules - Reference: SPRUJ40E',
            docUrl: 'https://www.ti.com/lit/ug/spruj40e/spruj40e.pdf',
            docLabel: 'AM62x EVM User Guide (SPRUJ40E)'
        },
        'am62ax': {
            name: 'AM62Ax',
            reference: 'Coming Soon',
            docUrl: null,
            docLabel: null
        },
        'am64x': {
            name: 'AM64x',
            reference: 'Coming Soon',
            docUrl: null,
            docLabel: null
        },
        'am62px': {
            name: 'AM62Px',
            reference: 'Coming Soon',
            docUrl: null,
            docLabel: null
        }
    };

    // Primary boot media configuration options for each boot device
    const primaryMediaConfigs = {
        '0000': { // Serial NAND
            label: 'Read Mode Configuration',
            options: [
                { bits: '000', label: 'Read Mode 1=OFF, Read Mode 2=OFF' },
                { bits: '001', label: 'Read Mode 1=ON, Read Mode 2=OFF' },
                { bits: '010', label: 'Read Mode 1=OFF, Read Mode 2=ON' },
                { bits: '011', label: 'Read Mode 1=ON, Read Mode 2=ON' }
            ]
        },
        '0001': { // OSPI
            label: 'OSPI Configuration',
            options: [
                { bits: '000', label: 'Csel=OFF, Iclk=OFF, Speed=OFF' },
                { bits: '001', label: 'Csel=ON, Iclk=OFF, Speed=OFF' },
                { bits: '010', label: 'Csel=OFF, Iclk=ON, Speed=OFF' },
                { bits: '011', label: 'Csel=ON, Iclk=ON, Speed=OFF' },
                { bits: '100', label: 'Csel=OFF, Iclk=OFF, Speed=ON' },
                { bits: '101', label: 'Csel=ON, Iclk=OFF, Speed=ON' },
                { bits: '110', label: 'Csel=OFF, Iclk=ON, Speed=ON' },
                { bits: '111', label: 'Csel=ON, Iclk=ON, Speed=ON' }
            ]
        },
        '0010': { // QSPI
            label: 'QSPI Configuration',
            options: [
                { bits: '000', label: 'Csel=OFF, Iclk=OFF' },
                { bits: '001', label: 'Csel=ON, Iclk=OFF' },
                { bits: '010', label: 'Csel=OFF, Iclk=ON' },
                { bits: '011', label: 'Csel=ON, Iclk=ON' }
            ]
        },
        '0011': { // SPI
            label: 'SPI Configuration',
            options: [
                { bits: '000', label: 'Csel=OFF, Mode=OFF' },
                { bits: '001', label: 'Csel=ON, Mode=OFF' },
                { bits: '010', label: 'Csel=OFF, Mode=ON' },
                { bits: '011', label: 'Csel=ON, Mode=ON' }
            ]
        },
        '0100': { // Ethernet RGMII1
            label: 'Ethernet RGMII Configuration',
            options: [
                { bits: '000', label: 'Link stat=OFF, Clkout Delay=OFF' },
                { bits: '001', label: 'Link stat=ON, Clkout Delay=OFF' },
                { bits: '010', label: 'Link stat=OFF, Clkout Delay=ON' },
                { bits: '011', label: 'Link stat=ON, Clkout Delay=ON' }
            ]
        },
        '0101': { // Ethernet RMII1
            label: 'Ethernet RMII Configuration',
            options: [
                { bits: '000', label: 'Clk src=OFF, Clkout=OFF' },
                { bits: '001', label: 'Clk src=ON, Clkout=OFF' },
                { bits: '010', label: 'Clk src=OFF, Clkout=ON' },
                { bits: '011', label: 'Clk src=ON, Clkout=ON' }
            ]
        },
        '0110': { // I2C
            label: 'I2C Configuration',
            options: [
                { bits: '000', label: 'Addr=0x00, Bus Reset=OFF' },
                { bits: '001', label: 'Addr=0x01, Bus Reset=OFF' },
                { bits: '010', label: 'Addr=0x02, Bus Reset=OFF' },
                { bits: '011', label: 'Addr=0x03, Bus Reset=OFF' },
                { bits: '100', label: 'Addr=0x00, Bus Reset=ON' },
                { bits: '101', label: 'Addr=0x01, Bus Reset=ON' },
                { bits: '110', label: 'Addr=0x02, Bus Reset=ON' },
                { bits: '111', label: 'Addr=0x03, Bus Reset=ON' }
            ]
        },
        '0111': { // UART
            label: 'UART Configuration',
            options: [
                { bits: '000', label: 'Default Configuration' }
            ]
        },
        '1000': { // MMC/SD card
            label: 'MMC/SD Configuration',
            options: [
                { bits: '000', label: 'Fs/raw=OFF, Port=OFF' },
                { bits: '001', label: 'Fs/raw=ON, Port=OFF' },
                { bits: '010', label: 'Fs/raw=OFF, Port=ON' },
                { bits: '011', label: 'Fs/raw=ON, Port=ON' }
            ]
        },
        '1001': { // eMMC
            label: 'eMMC Configuration',
            options: [
                { bits: '000', label: 'Voltage=OFF' },
                { bits: '001', label: 'Voltage=ON' }
            ]
        },
        '1010': { // USB0
            label: 'USB Configuration',
            options: [
                { bits: '000', label: 'Lane swap=OFF, Mode=OFF' },
                { bits: '001', label: 'Lane swap=ON, Mode=OFF' },
                { bits: '010', label: 'Lane swap=OFF, Mode=ON' },
                { bits: '011', label: 'Lane swap=ON, Mode=ON' }
            ]
        },
        '1011': { // GPMC NAND
            label: 'GPMC NAND Configuration',
            options: [
                { bits: '000', label: 'Default Configuration' }
            ]
        },
        '1100': { // GPMC NOR
            label: 'GPMC NOR Configuration',
            options: [
                { bits: '000', label: 'Default Configuration' }
            ]
        },
        '1101': { // Reserved
            label: 'Reserved',
            options: [
                { bits: '000', label: 'Reserved' }
            ]
        },
        '1110': { // xSPI
            label: 'xSPI Configuration',
            options: [
                { bits: '000', label: 'Mode=OFF, Read Cmd=OFF, SFDP=OFF' },
                { bits: '001', label: 'Mode=ON, Read Cmd=OFF, SFDP=OFF' },
                { bits: '010', label: 'Mode=OFF, Read Cmd=ON, SFDP=OFF' },
                { bits: '011', label: 'Mode=ON, Read Cmd=ON, SFDP=OFF' },
                { bits: '100', label: 'Mode=OFF, Read Cmd=OFF, SFDP=ON' },
                { bits: '101', label: 'Mode=ON, Read Cmd=OFF, SFDP=ON' },
                { bits: '110', label: 'Mode=OFF, Read Cmd=ON, SFDP=ON' },
                { bits: '111', label: 'Mode=ON, Read Cmd=ON, SFDP=ON' }
            ]
        },
        '1111': { // No boot/Dev Boot
            label: 'No Boot Configuration',
            options: [
                { bits: '000', label: 'Default' }
            ]
        }
    };

    // Backup boot media configuration options
    const backupMediaConfigs = {
        '000': { label: 'None', options: [{ bits: '0', label: 'No backup' }] },
        '001': { label: 'USB Mode', options: [{ bits: '0', label: 'Mode=OFF' }, { bits: '1', label: 'Mode=ON' }] },
        '010': { label: 'Reserved', options: [{ bits: '0', label: 'Reserved' }] },
        '011': { label: 'UART', options: [{ bits: '0', label: 'Default' }] },
        '100': { label: 'Ethernet IF', options: [{ bits: '0', label: 'IF=OFF' }, { bits: '1', label: 'IF=ON' }] },
        '101': { label: 'MMC/SD Port', options: [{ bits: '0', label: 'Port=OFF' }, { bits: '1', label: 'Port=ON' }] },
        '110': { label: 'SPI', options: [{ bits: '0', label: 'Default' }] },
        '111': { label: 'I2C', options: [{ bits: '0', label: 'Default' }] }
    };

    // Device selection handler
    deviceSelect.addEventListener('change', function() {
        const device = deviceSelect.value;
        const info = deviceData[device];
        if (info) {
            deviceInfo.textContent = info.reference;

            // Update documentation link
            if (info.docUrl && info.docLabel) {
                deviceDocLink.innerHTML = `
                    <a href="${info.docUrl}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="doc-link">
                        ${info.docLabel} →
                    </a>
                `;
                deviceDocLink.style.display = 'block';
            } else {
                deviceDocLink.style.display = 'none';
            }
        }
        updateConfigSummary();
    });

    // Update primary media configuration options when primary boot device changes
    primaryBootSelect.addEventListener('change', function() {
        updatePrimaryMediaConfig();
        updateConfigSummary();
    });

    backupBootSelect.addEventListener('change', function() {
        updateBackupMediaConfig();
        updateConfigSummary();
    });

    pllClockSelect.addEventListener('change', updateConfigSummary);

    function updatePrimaryMediaConfig() {
        const primaryBoot = primaryBootSelect.value;
        const config = primaryMediaConfigs[primaryBoot];

        if (config) {
            primaryMediaConfigDiv.innerHTML = `
                <label for="primaryMedia">${config.label}:</label>
                <select id="primaryMedia">
                    ${config.options.map(opt =>
                        `<option value="${opt.bits}">${opt.label}</option>`
                    ).join('')}
                </select>
            `;
            // Add event listener to the newly created select
            document.getElementById('primaryMedia').addEventListener('change', updateConfigSummary);
        }
        updateConfigSummary();
    }

    function updateBackupMediaConfig() {
        const backupBoot = backupBootSelect.value;
        const config = backupMediaConfigs[backupBoot];

        if (config) {
            backupMediaConfigDiv.innerHTML = `
                <label for="backupMedia">${config.label}:</label>
                <select id="backupMedia">
                    ${config.options.map(opt =>
                        `<option value="${opt.bits}">${opt.label}</option>`
                    ).join('')}
                </select>
            `;
            // Add event listener to the newly created select
            document.getElementById('backupMedia').addEventListener('change', updateConfigSummary);
        }
        updateConfigSummary();
    }

    // Update configuration summary table
    function updateConfigSummary() {
        // Get all configuration values
        const device = deviceSelect.value;
        const pllClock = pllClockSelect.value;
        const primaryBoot = primaryBootSelect.value;

        const primaryMediaSelect = document.getElementById('primaryMedia');
        const backupMediaSelect = document.getElementById('backupMedia');

        if (!primaryMediaSelect || !backupMediaSelect) {
            return; // Not fully initialized yet
        }

        const primaryMedia = primaryMediaSelect.value;
        const backupBoot = backupBootSelect.value;
        const backupMedia = backupMediaSelect.value;
        const reserved = '00'; // Bits 14-15

        // Build the 16-bit configuration
        const bootModeConfig = reserved + backupMedia + backupBoot + primaryMedia + primaryBoot + pllClock;

        // Convert to different formats
        const decimal = parseInt(bootModeConfig, 2);
        const hexadecimal = '0x' + decimal.toString(16).toUpperCase().padStart(4, '0');
        const binary = '0b' + bootModeConfig;

        // Get human-readable descriptions
        const deviceName = deviceData[device].name;
        const pllDesc = pllClockSelect.options[pllClockSelect.selectedIndex].text;
        const primaryBootDesc = primaryBootSelect.options[primaryBootSelect.selectedIndex].text;
        const backupBootDesc = backupBootSelect.options[backupBootSelect.selectedIndex].text;
        const primaryMediaDesc = primaryMediaSelect.options[primaryMediaSelect.selectedIndex].text;
        const backupMediaDesc = backupMediaSelect.options[backupMediaSelect.selectedIndex].text;

        // Update summary table
        document.getElementById('summaryDevice').textContent = deviceName;
        document.getElementById('summaryPLL').textContent = pllDesc;
        document.getElementById('summaryPLLBits').textContent = `[2:0] = ${pllClock}`;
        document.getElementById('summaryPrimaryBoot').textContent = primaryBootDesc;
        document.getElementById('summaryPrimaryBootBits').textContent = `[6:3] = ${primaryBoot}`;
        document.getElementById('summaryPrimaryMedia').textContent = primaryMediaDesc;
        document.getElementById('summaryPrimaryMediaBits').textContent = `[9:7] = ${primaryMedia}`;
        document.getElementById('summaryBackupBoot').textContent = backupBootDesc;
        document.getElementById('summaryBackupBootBits').textContent = `[12:10] = ${backupBoot}`;
        document.getElementById('summaryBackupMedia').textContent = backupMediaDesc;
        document.getElementById('summaryBackupMediaBits').textContent = `[13] = ${backupMedia}`;
        document.getElementById('summaryBinary').textContent = binary;
        document.getElementById('summaryHex').textContent = hexadecimal;
        document.getElementById('summaryDecimal').textContent = decimal;

        // Show the summary section
        configSummarySection.style.display = 'block';
    }

    // Initialize media configuration displays
    updatePrimaryMediaConfig();
    updateBackupMediaConfig();

    // Generate button handler
    generateBtn.addEventListener('click', generateConfiguration);

    // Clear button handler
    clearBtn.addEventListener('click', function() {
        deviceSelect.value = 'am62x';

        // Update device info and doc link
        const info = deviceData['am62x'];
        if (info) {
            deviceInfo.textContent = info.reference;
            if (info.docUrl && info.docLabel) {
                deviceDocLink.innerHTML = `
                    <a href="${info.docUrl}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="doc-link">
                        ${info.docLabel} →
                    </a>
                `;
                deviceDocLink.style.display = 'block';
            }
        }

        pllClockSelect.value = '011'; // Reset to default 25 MHz
        primaryBootSelect.value = '0000';
        backupBootSelect.value = '000';
        updatePrimaryMediaConfig();
        updateBackupMediaConfig();
        resultsSection.style.display = 'none';
        resultsContainer.innerHTML = '';
        updateConfigSummary();
    });

    function generateConfiguration() {
        // Get all configuration values
        const pllClock = pllClockSelect.value;
        const primaryBoot = primaryBootSelect.value;
        const primaryMedia = document.getElementById('primaryMedia').value;
        const backupBoot = backupBootSelect.value;
        const backupMedia = document.getElementById('backupMedia').value;
        const reserved = '00'; // Bits 14-15

        // Build the 16-bit configuration
        // Bit order: [15:14] Reserved, [13] Backup Media, [12:10] Backup Boot, [9:7] Primary Media, [6:3] Primary Boot, [2:0] PLL
        const bootModeConfig = reserved + backupMedia + backupBoot + primaryMedia + primaryBoot + pllClock;

        // Convert to different formats
        const decimal = parseInt(bootModeConfig, 2);
        const hexadecimal = '0x' + decimal.toString(16).toUpperCase().padStart(4, '0');
        const binary = '0b' + bootModeConfig;

        // Get human-readable descriptions
        const pllDesc = pllClockSelect.options[pllClockSelect.selectedIndex].text;
        const primaryBootDesc = primaryBootSelect.options[primaryBootSelect.selectedIndex].text;
        const backupBootDesc = backupBootSelect.options[backupBootSelect.selectedIndex].text;
        const primaryMediaDesc = document.getElementById('primaryMedia').options[document.getElementById('primaryMedia').selectedIndex].text;
        const backupMediaDesc = document.getElementById('backupMedia').options[document.getElementById('backupMedia').selectedIndex].text;

        // Create bit field visualization
        const bitFieldHtml = createBitFieldVisualization(bootModeConfig);

        // Display results
        resultsContainer.innerHTML = `
            <div class="result-card">
                <h3>Boot Mode Configuration Values</h3>

                <div style="background: var(--ti-grey-light); padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
                    <p style="margin: 0.5rem 0;"><strong>Binary:</strong> <code style="font-size: 1.1em; color: var(--ti-red);">${binary}</code></p>
                    <p style="margin: 0.5rem 0;"><strong>Hexadecimal:</strong> <code style="font-size: 1.1em; color: var(--ti-red);">${hexadecimal}</code></p>
                    <p style="margin: 0.5rem 0;"><strong>Decimal:</strong> <code style="font-size: 1.1em; color: var(--ti-red);">${decimal}</code></p>
                </div>

                <h4>Bit Field Breakdown</h4>
                ${bitFieldHtml}

                <h4>Configuration Summary</h4>
                <div style="background: white; border: 2px solid var(--ti-teal); border-radius: 6px; padding: 1rem; margin-top: 1rem;">
                    <p style="margin: 0.5rem 0;"><strong>PLL Reference Clock [2:0]:</strong> ${pllDesc}</p>
                    <p style="margin: 0.5rem 0;"><strong>Primary Boot Device [6:3]:</strong> ${primaryBootDesc}</p>
                    <p style="margin: 0.5rem 0;"><strong>Primary Media Config [9:7]:</strong> ${primaryMediaDesc}</p>
                    <p style="margin: 0.5rem 0;"><strong>Backup Boot Device [12:10]:</strong> ${backupBootDesc}</p>
                    <p style="margin: 0.5rem 0;"><strong>Backup Media Config [13]:</strong> ${backupMediaDesc}</p>
                    <p style="margin: 0.5rem 0;"><strong>Reserved [15:14]:</strong> 00</p>
                </div>

                <div style="background: #E3F2FD; border-left: 4px solid var(--ti-teal); padding: 1rem; border-radius: 6px; margin-top: 1.5rem;">
                    <p style="margin: 0; color: var(--ti-blue-dark);"><strong>Note:</strong> Configure your hardware boot mode switches according to the binary value shown above. Each bit corresponds to a physical switch or pin configuration on your AM62x device.</p>
                </div>
            </div>
        `;

        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function createBitFieldVisualization(bootModeConfig) {
        // bootModeConfig is a 16-bit binary string
        const bits = bootModeConfig.split('');

        return `
            <div style="overflow-x: auto; margin: 1rem 0;">
                <table style="width: 100%; border-collapse: collapse; font-family: 'Courier New', monospace;">
                    <thead>
                        <tr style="background: var(--ti-red); color: white;">
                            <th style="padding: 0.5rem; border: 1px solid var(--border-color);">Bit Position</th>
                            ${[15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0].map(i =>
                                `<th style="padding: 0.5rem; border: 1px solid var(--border-color); font-size: 0.85rem;">${i}</th>`
                            ).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 0.5rem; border: 1px solid var(--border-color); background: var(--ti-grey-light); font-weight: 600;">Value</td>
                            ${bits.map((bit, idx) => {
                                let bgColor = 'white';
                                if (idx < 2) bgColor = '#EEEEEE'; // Reserved
                                else if (idx === 2) bgColor = '#E1BEE7'; // Backup media
                                else if (idx >= 3 && idx <= 5) bgColor = '#FFE0B2'; // Backup boot
                                else if (idx >= 6 && idx <= 8) bgColor = '#B3E5FC'; // Primary media
                                else if (idx >= 9 && idx <= 12) bgColor = '#C5E1A5'; // Primary boot
                                else if (idx >= 13) bgColor = '#FFF9C4'; // PLL

                                return `<td style="padding: 0.5rem; border: 1px solid var(--border-color); text-align: center; background: ${bgColor}; font-weight: 700; font-size: 1.1em;">${bit}</td>`;
                            }).join('')}
                        </tr>
                        <tr>
                            <td style="padding: 0.5rem; border: 1px solid var(--border-color); background: var(--ti-grey-light); font-weight: 600;">Field</td>
                            <td colspan="2" style="padding: 0.5rem; border: 1px solid var(--border-color); text-align: center; font-size: 0.75rem; background: #EEEEEE;">Rsvd</td>
                            <td colspan="1" style="padding: 0.5rem; border: 1px solid var(--border-color); text-align: center; font-size: 0.75rem; background: #E1BEE7;">Bkup<br>Media</td>
                            <td colspan="3" style="padding: 0.5rem; border: 1px solid var(--border-color); text-align: center; font-size: 0.75rem; background: #FFE0B2;">Backup<br>Boot</td>
                            <td colspan="3" style="padding: 0.5rem; border: 1px solid var(--border-color); text-align: center; font-size: 0.75rem; background: #B3E5FC;">Primary<br>Media</td>
                            <td colspan="4" style="padding: 0.5rem; border: 1px solid var(--border-color); text-align: center; font-size: 0.75rem; background: #C5E1A5;">Primary<br>Boot</td>
                            <td colspan="3" style="padding: 0.5rem; border: 1px solid var(--border-color); text-align: center; font-size: 0.75rem; background: #FFF9C4;">PLL</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
});
