/**
 * Bootstrap Configuration Tool for TI K3 SoCs
 *
 * This tool helps configure the 16-bit boot mode configuration for TI K3 devices.
 * Boot Mode Bits (0-15):
 *   Bits 0-2:   PLL Configuration
 *   Bits 3-6:   Primary Boot Mode
 *   Bits 7-9:   Primary Boot Mode Config
 *   Bits 10-12: Backup Boot Mode
 *   Bit 13:     Backup Boot Mode Config
 *   Bits 14-15: Reserved (00 for most devices) or Pincount Mode (AM62Lx only)
 */

// Application state
const appState = {
    pllConfig: '010',
    primaryBootMode: '0001',
    primaryBootConfig: '000',
    backupBootMode: '000',
    backupBootConfig: '0',
    reserved: '00',
    pincountMode: 'full', // 'full' or 'reduced' (AM62Lx only)
    reducedPincountOption: '1001' // Only used when pincountMode is 'reduced'
};

// DOM element references
let elements = {};

// Current device configuration
let currentDevice = 'am62x';

// Boot mode descriptions for AM62x primary boot modes
const am62xPrimaryBootModeDescriptions = {
    '0000': {
        name: 'Serial NAND',
        configs: [
            'Read Mode 1',
            'Read Mode 2, Read Mode 1',
            'Reserved, Read Mode 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0001': {
        name: 'OSPI',
        configs: [
            'Csel 0, No Iclk',
            'Csel 1, No Iclk',
            'Csel 0, Iclk',
            'Csel 1, Iclk',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0010': {
        name: 'QSPI',
        configs: [
            'Csel 0, No Iclk',
            'Csel 1, No Iclk',
            'Csel 0, Iclk',
            'Csel 1, Iclk',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0011': {
        name: 'SPI',
        configs: [
            'Mode 0, Csel 0',
            'Mode 0, Csel 1',
            'Mode 1, Csel 0',
            'Mode 1, Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0100': {
        name: 'Ethernet RGMII',
        configs: [
            'Link Info 0, No Clkout',
            'Link Info 1, No Clkout',
            'Link Info 0, Clkout',
            'Link Info 1, Clkout',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0101': {
        name: 'Ethernet RMII',
        configs: [
            'Clk src 0, No Clkout',
            'Clk src 0, Clkout',
            'Clk src 1, No Clkout',
            'Clk src 1, Clkout',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0110': {
        name: 'I2C',
        configs: [
            'Addr 0, No bus reset',
            'Addr 0, Bus reset',
            'Addr 1, No bus reset',
            'Addr 1, Bus reset',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0111': {
        name: 'UART',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1000': {
        name: 'MMCSD Boot',
        configs: [
            'Raw, Port 0',
            'FS, Port 0',
            'Raw, Port 1',
            'FS, Port 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1001': {
        name: 'eMMC Boot',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1010': {
        name: 'USB',
        configs: [
            'Mode 0, No lane swap, Core Volt 0',
            'Mode 0, Lane swap, Core Volt 0',
            'Mode 1, No lane swap, Core Volt 0',
            'Mode 1, Lane swap, Core Volt 0',
            'Mode 0, No lane swap, Core Volt 1',
            'Mode 0, Lane swap, Core Volt 1',
            'Mode 1, No lane swap, Core Volt 1',
            'Mode 1, Lane swap, Core Volt 1'
        ]
    },
    '1011': {
        name: 'GPMC NAND',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1100': {
        name: 'GPMC NOR',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1101': {
        name: 'Reserved',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1110': {
        name: 'xSPI',
        configs: [
            'Mode 0, Read Cmd 0, No SFDP',
            'Mode 0, Read Cmd 0, SFDP',
            'Mode 0, Read Cmd 1, No SFDP',
            'Mode 0, Read Cmd 1, SFDP',
            'Mode 1, Read Cmd 0, No SFDP',
            'Mode 1, Read Cmd 0, SFDP',
            'Mode 1, Read Cmd 1, No SFDP',
            'Mode 1, Read Cmd 1, SFDP'
        ]
    },
    '1111': {
        name: 'No-boot/Dev boot',
        configs: [
            'No-boot, ARM',
            'No-boot, Thumb',
            'Dev boot, ARM',
            'Dev boot, Thumb',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    }
};

// Boot mode descriptions for AM62Px primary boot modes
const am62pxPrimaryBootModeDescriptions = {
    '0000': {
        name: 'Serial NAND',
        configs: [
            'Read Mode 1',
            'Read Mode 2, Read Mode 1',
            'Reserved, Read Mode 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0001': {
        name: 'OSPI',
        configs: [
            'Csel 0',
            'Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0010': {
        name: 'QSPI',
        configs: [
            'Csel 0',
            'Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0011': {
        name: 'SPI',
        configs: [
            'Mode 0, Csel 0',
            'Mode 0, Csel 1',
            'Mode 1, Csel 0',
            'Mode 1, Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0100': {
        name: 'Ethernet RGMII',
        configs: [
            'Link Info 0',
            'Link Info 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0101': {
        name: 'Ethernet RMII',
        configs: [
            'Clk src 0, No Clkout',
            'Clk src 0, Clkout',
            'Clk src 1, No Clkout',
            'Clk src 1, Clkout',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0110': {
        name: 'I2C',
        configs: [
            'Addr 0, No bus reset',
            'Addr 0, Bus reset',
            'Addr 1, No bus reset',
            'Addr 1, Bus reset',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0111': {
        name: 'UART',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1000': {
        name: 'MMCSD Boot',
        configs: [
            'Raw, Port 0',
            'FS, Port 0',
            'Raw, Port 1',
            'FS, Port 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1001': {
        name: 'eMMC Boot',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1010': {
        name: 'USB',
        configs: [
            'Mode 0, No lane swap, Core Volt 0',
            'Mode 0, Lane swap, Core Volt 0',
            'Mode 1, No lane swap, Core Volt 0',
            'Mode 1, Lane swap, Core Volt 0',
            'Mode 0, No lane swap, Core Volt 1',
            'Mode 0, Lane swap, Core Volt 1',
            'Mode 1, No lane swap, Core Volt 1',
            'Mode 1, Lane swap, Core Volt 1'
        ]
    },
    '1011': {
        name: 'GPMC NAND',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1100': {
        name: 'GPMC NOR',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1101': {
        name: 'Reserved',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1110': {
        name: 'xSPI',
        configs: [
            'Mode 0, Read Cmd 0, No SFDP',
            'Mode 0, Read Cmd 0, SFDP',
            'Mode 0, Read Cmd 1, No SFDP',
            'Mode 0, Read Cmd 1, SFDP',
            'Mode 1, Read Cmd 0, No SFDP',
            'Mode 1, Read Cmd 0, SFDP',
            'Mode 1, Read Cmd 1, No SFDP',
            'Mode 1, Read Cmd 1, SFDP'
        ]
    },
    '1111': {
        name: 'No-boot/Dev boot',
        configs: [
            'No-boot, ARM',
            'No-boot, Thumb',
            'Dev boot, ARM',
            'Dev boot, Thumb',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    }
};

// Boot mode descriptions for J722S / AM67x primary boot modes
const j722sPrimaryBootModeDescriptions = {
    '0000': {
        name: 'Serial NAND',
        configs: [
            'Reserved',
            'Read Mode 1',
            'Read Mode 2',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0001': {
        name: 'OSPI',
        configs: [
            'Csel 0',
            'Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0010': {
        name: 'QSPI',
        configs: [
            'Csel 0',
            'Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0011': {
        name: 'SPI',
        configs: [
            'Mode 0, Csel 0',
            'Mode 0, Csel 1',
            'Mode 1, Csel 0',
            'Mode 1, Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0100': {
        name: 'Ethernet RGMII',
        configs: [
            'Link Info 0',
            'Link Info 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0101': {
        name: 'Ethernet RMII',
        configs: [
            'Clk src 0, No Clkout',
            'Clk src 0, Clkout',
            'Clk src 1, No Clkout',
            'Clk src 1, Clkout',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0110': {
        name: 'I2C',
        configs: [
            'Addr 0, No bus reset',
            'Addr 0, Bus reset',
            'Addr 1, No bus reset',
            'Addr 1, Bus reset',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0111': {
        name: 'UART',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1000': {
        name: 'MMCSD Boot',
        configs: [
            'Raw, No FS',
            'FS enabled',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1001': {
        name: 'eMMC Boot',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1010': {
        name: 'USB',
        configs: [
            'Mode 0, No lane swap',
            'Mode 0, Lane swap',
            'Mode 1, No lane swap',
            'Mode 1, Lane swap',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1011': {
        name: 'GPMC NAND',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1100': {
        name: 'GPMC NOR',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1101': {
        name: 'Fast-xSPI',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1110': {
        name: 'xSPI',
        configs: [
            'Mode 0, Read Cmd 0, No SFDP',
            'Mode 0, Read Cmd 0, SFDP',
            'Mode 0, Read Cmd 1, No SFDP',
            'Mode 0, Read Cmd 1, SFDP',
            'Mode 1, Read Cmd 0, No SFDP',
            'Mode 1, Read Cmd 0, SFDP',
            'Mode 1, Read Cmd 1, No SFDP',
            'Mode 1, Read Cmd 1, SFDP'
        ]
    },
    '1111': {
        name: 'No-boot/Dev boot',
        configs: [
            'No-boot, ARM',
            'No-boot, Thumb',
            'Dev boot, ARM',
            'Dev boot, Thumb',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    }
};

// Boot mode descriptions for AM62Lx primary boot modes
const am62lxPrimaryBootModeDescriptions = {
    '0000': {
        name: 'Serial NAND',
        configs: [
            'Read Mode 1',
            'Read Mode 2, Read Mode 1',
            'Reserved, Read Mode 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0001': {
        name: 'OSPI',
        configs: [
            'Csel 0',
            'Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0010': {
        name: 'QSPI',
        configs: [
            'Csel 0',
            'Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0011': {
        name: 'SPI',
        configs: [
            'Mode 0, Csel 0',
            'Mode 0, Csel 1',
            'Mode 1, Csel 0',
            'Mode 1, Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0100': {
        name: 'Reserved',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0101': {
        name: 'Reserved',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0110': {
        name: 'Reserved',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0111': {
        name: 'UART',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1000': {
        name: 'MMCSD Boot',
        configs: [
            'Raw, Port 0',
            'FS, Port 0',
            'Raw, Port 1',
            'FS, Port 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1001': {
        name: 'eMMC Boot',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1010': {
        name: 'USB',
        configs: [
            'Mode 0, No lane swap',
            'Mode 0, Lane swap',
            'Mode 1, No lane swap',
            'Mode 1, Lane swap',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1011': {
        name: 'GPMC NAND',
        configs: [
            'Timing 0',
            'Timing 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1100': {
        name: 'Reserved',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1101': {
        name: 'Reserved',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1110': {
        name: 'xSPI',
        configs: [
            'Mode 0, Read Cmd 0, No SFDP',
            'Mode 0, Read Cmd 0, SFDP',
            'Mode 0, Read Cmd 1, No SFDP',
            'Mode 0, Read Cmd 1, SFDP',
            'Mode 1, Read Cmd 0, No SFDP',
            'Mode 1, Read Cmd 0, SFDP',
            'Mode 1, Read Cmd 1, No SFDP',
            'Mode 1, Read Cmd 1, SFDP'
        ]
    },
    '1111': {
        name: 'No-boot/Dev boot',
        configs: [
            'No-boot',
            'Dev boot',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    }
};

// AM62Lx Reduced Pincount Mode options (BOOTMODE[15:12] mapping)
const am62lxReducedPincountModes = {
    '0100': { name: 'Reserved', value: 0x0000, description: 'Do Not Use', disabled: true },
    '0101': { name: 'Reserved', value: 0x0000, description: 'Do Not Use', disabled: true },
    '0110': { name: 'Efuse Bootmode1', value: 0x007B, description: 'DEVBOOT, None, 25 MHz (Default/Programmable)' },
    '0111': { name: 'Efuse Bootmode2', value: 0x0D53, description: 'USB0 Host MSC, UART, 25 MHz (Default/Programmable)' },
    '1000': { name: 'Fixed 1', value: 0x044B, description: 'MMC0 eMMC Boot, USB DFU, 25 MHz' },
    '1001': { name: 'Fixed 2', value: 0x0C13, description: 'FSS0 QSPI CS0, UART, 25 MHz' },
    '1010': { name: 'Fixed 3', value: 0x0E43, description: 'MMC1 4 BIT UDA FS, UART, 25 MHz' },
    '1011': { name: 'Fixed 4', value: 0x344B, description: 'MMC0 eMMC Boot, MMC1, 25 MHz' },
    '1100': { name: 'Fixed 5', value: 0x0C83, description: 'FSS0 Serial NAND OSPI, UART, 25 MHz' },
    '1101': { name: 'Fixed 6', value: 0x0E73, description: 'FSS0 xSPI SFDP, UART, 25 MHz' },
    '1110': { name: 'Fixed 7', value: 0x343B, description: 'EXT. HOST UART0, MMC1, 25 MHz' },
    '1111': { name: 'Fixed 8', value: 0x3453, description: 'EXT. HOST USB0 DFU, MMC1, 25 MHz' }
};

// Backup boot mode descriptions
const backupBootModeDescriptions = {
    '000': { name: 'None', config0: 'Reserved', config1: 'Reserved' },
    '001': { name: 'USB', config0: 'Mode 0', config1: 'Mode 1' },
    '010': { name: 'Reserved', config0: 'Reserved', config1: 'Reserved' },
    '011': { name: 'UART', config0: 'Config 0', config1: 'Config 1' },
    '100': { name: 'Ethernet', config0: 'IF 0', config1: 'IF 1' },
    '101': { name: 'MMCSD Boot', config0: 'Port 0', config1: 'Port 1' },
    '110': { name: 'SPI', config0: 'Reserved', config1: 'Reserved' },
    '111': { name: 'I2C', config0: 'Reserved', config1: 'Reserved' }
};

// AM62Lx Backup boot mode descriptions (slightly different from other devices)
const am62lxBackupBootModeDescriptions = {
    '000': { name: 'None', config0: 'Reserved', config1: 'Reserved' },
    '001': { name: 'USB', config0: 'No lane swap', config1: 'Mode 1' },
    '010': { name: 'Reserved', config0: 'Reserved', config1: 'Reserved' },
    '011': { name: 'UART', config0: 'Config 0', config1: 'Reserved' },
    '100': { name: 'Reserved', config0: 'Reserved', config1: 'Reserved' },
    '101': { name: 'MMCSD Boot', config0: 'Port 0', config1: 'Port 1' },
    '110': { name: 'SPI', config0: 'Csel 0, Mode 0', config1: 'Reserved' },
    '111': { name: 'Reserved', config0: 'Reserved', config1: 'Reserved' }
};

// Boot mode descriptions for AM62Ax primary boot modes
const am62axPrimaryBootModeDescriptions = {
    '0000': {
        name: 'Serial NAND',
        configs: [
            'Read Mode 1',
            'Read Mode 2, Read Mode 1',
            'Reserved, Read Mode 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0001': {
        name: 'OSPI',
        configs: [
            'Csel 0',
            'Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0010': {
        name: 'QSPI',
        configs: [
            'Csel 0',
            'Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0011': {
        name: 'SPI',
        configs: [
            'Mode 0, Csel 0',
            'Mode 0, Csel 1',
            'Mode 1, Csel 0',
            'Mode 1, Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0100': {
        name: 'Ethernet RGMII',
        configs: [
            'Link Info 0',
            'Link Info 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0101': {
        name: 'Ethernet RMII',
        configs: [
            'Clk src 0, No Clkout',
            'Clk src 1, No Clkout',
            'Clk src 0, Clkout',
            'Clk src 1, Clkout',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0110': {
        name: 'I2C',
        configs: [
            'Addr 0, No bus reset',
            'Addr 1, No bus reset',
            'Addr 0, Bus reset',
            'Addr 1, Bus reset',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0111': {
        name: 'UART',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1000': {
        name: 'MMCSD Boot',
        configs: [
            'Raw, Port 0',
            'FS, Port 0',
            'Raw, Port 1',
            'FS, Port 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1001': {
        name: 'eMMC Boot',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1010': {
        name: 'USB',
        configs: [
            'Mode 0, No lane swap, Core Volt 0',
            'Mode 0, Lane swap, Core Volt 0',
            'Mode 1, No lane swap, Core Volt 0',
            'Mode 1, Lane swap, Core Volt 0',
            'Mode 0, No lane swap, Core Volt 1',
            'Mode 0, Lane swap, Core Volt 1',
            'Mode 1, No lane swap, Core Volt 1',
            'Mode 1, Lane swap, Core Volt 1'
        ]
    },
    '1011': {
        name: 'GPMC NAND',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1100': {
        name: 'GPMC NOR',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1101': {
        name: 'Reserved',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1110': {
        name: 'xSPI',
        configs: [
            'Mode 0, Read Cmd 0, No SFDP',
            'Mode 0, Read Cmd 1, No SFDP',
            'Mode 1, Read Cmd 0, No SFDP',
            'Mode 1, Read Cmd 1, No SFDP',
            'Mode 0, Read Cmd 0, SFDP',
            'Mode 0, Read Cmd 1, SFDP',
            'Mode 1, Read Cmd 0, SFDP',
            'Mode 1, Read Cmd 1, SFDP'
        ]
    },
    '1111': {
        name: 'No-boot/Dev boot',
        configs: [
            'No-boot, ARM',
            'No-boot, Thumb',
            'Dev boot, ARM',
            'Dev boot, Thumb',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    }
};

// AM62Ax Backup boot mode descriptions (slightly different from other devices)
const am62axBackupBootModeDescriptions = {
    '000': { name: 'None', config0: 'Reserved', config1: 'Reserved' },
    '001': { name: 'USB', config0: 'Mode 0', config1: 'Mode 1' },
    '010': { name: 'Reserved', config0: 'Reserved', config1: 'Reserved' },
    '011': { name: 'UART', config0: 'Reserved', config1: 'Reserved' },
    '100': { name: 'Ethernet', config0: 'IF 0', config1: 'IF 1' },
    '101': { name: 'MMCSD Boot', config0: 'Port 0', config1: 'Port 1' },
    '110': { name: 'SPI', config0: 'Reserved', config1: 'Reserved' },
    '111': { name: 'I2C', config0: 'Reserved', config1: 'Reserved' }
};

// Boot mode descriptions for AM64x/AM243x primary boot modes
const am64xPrimaryBootModeDescriptions = {
    '0000': {
        name: 'Reserved',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0001': {
        name: 'OSPI',
        configs: [
            'Csel 0, No Iclk',
            'Csel 1, No Iclk',
            'Csel 0, Iclk',
            'Csel 1, Iclk',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0010': {
        name: 'QSPI',
        configs: [
            'Csel 0, No Iclk',
            'Csel 1, No Iclk',
            'Csel 0, Iclk',
            'Csel 1, Iclk',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0011': {
        name: 'SPI',
        configs: [
            'Mode 0, Csel 0',
            'Mode 0, Csel 1',
            'Mode 1, Csel 0',
            'Mode 1, Csel 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0100': {
        name: 'Ethernet RGMII',
        configs: [
            'Link Info 0, No Clkout',
            'Link Info 1, No Clkout',
            'Link Info 0, Clkout',
            'Link Info 1, Clkout',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0101': {
        name: 'Ethernet RMII',
        configs: [
            'Clk src 0, No Clkout',
            'Clk src 1, No Clkout',
            'Clk src 0, Clkout',
            'Clk src 1, Clkout',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0110': {
        name: 'I2C',
        configs: [
            'Addr 0, No bus reset',
            'Addr 1, No bus reset',
            'Addr 0, Bus reset',
            'Addr 1, Bus reset',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '0111': {
        name: 'UART',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1000': {
        name: 'MMCSD Boot',
        configs: [
            'Raw, Port 0',
            'FS, Port 0',
            'Raw, Port 1',
            'FS, Port 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1001': {
        name: 'eMMC Boot',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1010': {
        name: 'USB',
        configs: [
            'Mode 0, No lane swap',
            'Mode 0, Lane swap',
            'Mode 1, No lane swap',
            'Mode 1, Lane swap',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1011': {
        name: 'GPMC NAND',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1100': {
        name: 'GPMC NOR',
        configs: [
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1101': {
        name: 'PCIe',
        configs: [
            'Clocking 0',
            'Clocking 1',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    },
    '1110': {
        name: 'xSPI',
        configs: [
            'Mode 0, Read Cmd 0, No SFDP',
            'Mode 0, Read Cmd 1, No SFDP',
            'Mode 1, Read Cmd 0, No SFDP',
            'Mode 1, Read Cmd 1, No SFDP',
            'Mode 0, Read Cmd 0, SFDP',
            'Mode 0, Read Cmd 1, SFDP',
            'Mode 1, Read Cmd 0, SFDP',
            'Mode 1, Read Cmd 1, SFDP'
        ]
    },
    '1111': {
        name: 'No-boot/Dev boot',
        configs: [
            'No-boot',
            'Dev boot',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved',
            'Reserved'
        ]
    }
};

// AM64x/AM243x Backup boot mode descriptions
const am64xBackupBootModeDescriptions = {
    '000': { name: 'None', config0: 'Reserved', config1: 'Reserved' },
    '001': { name: 'USB', config0: 'Mode 0', config1: 'Mode 1' },
    '010': { name: 'Reserved', config0: 'Reserved', config1: 'Reserved' },
    '011': { name: 'UART', config0: 'Reserved', config1: 'Reserved' },
    '100': { name: 'Ethernet', config0: 'IF 0', config1: 'IF 1' },
    '101': { name: 'MMCSD Boot', config0: 'Port 0', config1: 'Port 1' },
    '110': { name: 'SPI', config0: 'Reserved', config1: 'Reserved' },
    '111': { name: 'I2C', config0: 'Reserved', config1: 'Reserved' }
};

/**
 * Get primary boot mode descriptions for the current device
 */
function getPrimaryBootModeDescriptions() {
    if (currentDevice === 'am62x') {
        return am62xPrimaryBootModeDescriptions;
    } else if (currentDevice === 'am62px') {
        return am62pxPrimaryBootModeDescriptions;
    } else if (currentDevice === 'j722s') {
        return j722sPrimaryBootModeDescriptions;
    } else if (currentDevice === 'am62lx') {
        return am62lxPrimaryBootModeDescriptions;
    } else if (currentDevice === 'am62ax') {
        return am62axPrimaryBootModeDescriptions;
    } else if (currentDevice === 'am64x') {
        return am64xPrimaryBootModeDescriptions;
    }
    // Default to AM62x
    return am62xPrimaryBootModeDescriptions;
}

/**
 * Get backup boot mode descriptions for the current device
 */
function getBackupBootModeDescriptions() {
    if (currentDevice === 'am62lx') {
        return am62lxBackupBootModeDescriptions;
    } else if (currentDevice === 'am62ax') {
        return am62axBackupBootModeDescriptions;
    } else if (currentDevice === 'am64x') {
        return am64xBackupBootModeDescriptions;
    }
    return backupBootModeDescriptions;
}

// Use case presets
const useCasePresets = {
    'sd_uart': {
        pllConfig: '010',
        primaryBootMode: '1000',
        primaryBootConfig: '000',
        backupBootMode: '011',
        backupBootConfig: '0'
    },
    'ospi_uart': {
        pllConfig: '010',
        primaryBootMode: '0001',
        primaryBootConfig: '000',
        backupBootMode: '011',
        backupBootConfig: '0'
    },
    'emmc_uart': {
        pllConfig: '010',
        primaryBootMode: '1001',
        primaryBootConfig: '000',
        backupBootMode: '011',
        backupBootConfig: '0'
    },
    'usb_uart': {
        pllConfig: '010',
        primaryBootMode: '1010',
        primaryBootConfig: '000',
        backupBootMode: '011',
        backupBootConfig: '0'
    },
    'ospi_usb': {
        pllConfig: '010',
        primaryBootMode: '0001',
        primaryBootConfig: '000',
        backupBootMode: '001',
        backupBootConfig: '0'
    },
    'sd_usb': {
        pllConfig: '010',
        primaryBootMode: '1000',
        primaryBootConfig: '000',
        backupBootMode: '001',
        backupBootConfig: '0'
    },
    'uart_only': {
        pllConfig: '010',
        primaryBootMode: '0111',
        primaryBootConfig: '000',
        backupBootMode: '000',
        backupBootConfig: '0'
    },
    'usb_only': {
        pllConfig: '010',
        primaryBootMode: '1010',
        primaryBootConfig: '000',
        backupBootMode: '000',
        backupBootConfig: '0'
    }
};

/**
 * Initialize DOM element references
 */
function initializeElements() {
    elements = {
        // Input elements
        deviceSelect: document.getElementById('deviceSelect'),
        useCaseSelect: document.getElementById('useCaseSelect'),
        pllConfig: document.getElementById('pllConfig'),
        primaryBootMode: document.getElementById('primaryBootMode'),
        primaryBootConfig: document.getElementById('primaryBootConfig'),
        backupBootMode: document.getElementById('backupBootMode'),
        backupBootConfig: document.getElementById('backupBootConfig'),

        // AM62Lx specific elements
        pincountModeSection: document.getElementById('pincountModeSection'),
        pincountModeSelect: document.getElementById('pincountModeSelect'),
        reducedPincountSelect: document.getElementById('reducedPincountSelect'),
        fullPincountConfig: document.getElementById('fullPincountConfig'),
        reducedPincountConfig: document.getElementById('reducedPincountConfig'),

        // Display elements - bit diagram
        reservedBits: document.getElementById('reservedBits'),
        reservedLabel: document.getElementById('reservedLabel'),
        backupConfigBits: document.getElementById('backupConfigBits'),
        backupModeBits: document.getElementById('backupModeBits'),
        primaryConfigBits: document.getElementById('primaryConfigBits'),
        primaryModeBits: document.getElementById('primaryModeBits'),
        pllConfigBits: document.getElementById('pllConfigBits'),

        // Display elements - results
        hexValue: document.getElementById('hexValue'),
        binaryValue: document.getElementById('binaryValue'),
        decimalValue: document.getElementById('decimalValue'),
        simplifiedView: document.getElementById('simplifiedView'),

        // Description elements
        primaryBootConfigDesc: document.getElementById('primaryBootConfigDesc'),
        backupBootConfigDesc: document.getElementById('backupBootConfigDesc'),

        // Button elements
        copyHexBtn: document.getElementById('copyHexBtn'),
        copyBinaryBtn: document.getElementById('copyBinaryBtn'),
        exportConfigBtn: document.getElementById('exportConfigBtn'),
        resetBtn: document.getElementById('resetBtn')
    };
}

/**
 * Attach event listeners to all interactive elements
 */
function attachEventListeners() {
    // Configuration change listeners
    elements.deviceSelect.addEventListener('change', handleDeviceChange);
    elements.useCaseSelect.addEventListener('change', handleUseCaseChange);
    elements.pllConfig.addEventListener('change', handleManualConfigChange);
    elements.primaryBootMode.addEventListener('change', handlePrimaryBootModeChange);
    elements.primaryBootConfig.addEventListener('change', handleManualConfigChange);
    elements.backupBootMode.addEventListener('change', handleBackupBootModeChange);
    elements.backupBootConfig.addEventListener('change', handleManualConfigChange);

    // AM62Lx specific listeners
    if (elements.pincountModeSelect) {
        elements.pincountModeSelect.addEventListener('change', handlePincountModeChange);
    }
    if (elements.reducedPincountSelect) {
        elements.reducedPincountSelect.addEventListener('change', handleReducedPincountChange);
    }

    // Button listeners
    elements.copyHexBtn.addEventListener('click', copyHexValue);
    elements.copyBinaryBtn.addEventListener('click', copyBinaryValue);
    elements.exportConfigBtn.addEventListener('click', exportConfiguration);
    elements.resetBtn.addEventListener('click', resetToDefaults);
}

/**
 * Handle device selection change
 */
function handleDeviceChange() {
    const device = elements.deviceSelect.value;
    currentDevice = device;

    // Show/hide AM62Lx specific UI
    toggleAM62LxUI();

    // Update PLL config options based on device
    updatePllConfigOptions();

    // Update the Fast-xSPI/Reserved option for AM62x/AM62Px vs J722S
    updatePrimaryBootModeOptions();

    // Update primary boot config options based on new device
    updatePrimaryBootConfigOptions();

    // Update backup boot mode descriptions
    updateBackupBootConfigDescription();

    // Update display
    updateDisplay();
}

/**
 * Toggle AM62Lx specific UI elements
 */
function toggleAM62LxUI() {
    const isAM62Lx = currentDevice === 'am62lx';

    if (elements.pincountModeSection) {
        elements.pincountModeSection.style.display = isAM62Lx ? 'block' : 'none';
    }

    // Hide reduced pincount config when switching away from AM62Lx
    if (!isAM62Lx && elements.reducedPincountConfig) {
        elements.reducedPincountConfig.style.display = 'none';
        // Reset to full pincount mode
        if (elements.pincountModeSelect) {
            elements.pincountModeSelect.value = 'full';
        }
        appState.pincountMode = 'full';
        // Show full config section
        if (elements.fullPincountConfig) {
            elements.fullPincountConfig.style.display = 'block';
        }
    }

    // Update the Reserved bits label for AM62Lx
    if (elements.reservedLabel) {
        if (isAM62Lx) {
            elements.reservedLabel.textContent = 'Pincount Mode';
        } else {
            elements.reservedLabel.textContent = 'Reserved';
        }
    }
}

/**
 * Handle pincount mode change (AM62Lx only)
 */
function handlePincountModeChange() {
    const mode = elements.pincountModeSelect.value;
    appState.pincountMode = mode;

    // Show/hide appropriate configuration sections
    if (elements.fullPincountConfig && elements.reducedPincountConfig) {
        if (mode === 'full') {
            elements.fullPincountConfig.style.display = 'block';
            elements.reducedPincountConfig.style.display = 'none';
            appState.reserved = '00';
        } else {
            elements.fullPincountConfig.style.display = 'none';
            elements.reducedPincountConfig.style.display = 'block';
            // Set reserved bits based on reduced pincount selection
            appState.reserved = elements.reducedPincountSelect.value.substring(0, 2);
        }
    }

    // Set use case to custom
    elements.useCaseSelect.value = 'custom';

    // Update display
    updateDisplay();
}

/**
 * Handle reduced pincount selection change (AM62Lx only)
 */
function handleReducedPincountChange() {
    const option = elements.reducedPincountSelect.value;
    appState.reducedPincountOption = option;

    // Update reserved bits to match the first 2 bits of the reduced option
    appState.reserved = option.substring(0, 2);

    // Set use case to custom
    elements.useCaseSelect.value = 'custom';

    // Update display
    updateDisplay();
}

/**
 * Update primary boot mode dropdown options based on device
 */
function updatePrimaryBootModeOptions() {
    // Find the option for boot mode 1101 (Fast-xSPI vs Reserved vs PCIe)
    const option1101 = Array.from(elements.primaryBootMode.options).find(
        opt => opt.value === '1101'
    );

    if (option1101) {
        if (currentDevice === 'am62x' || currentDevice === 'am62px' || currentDevice === 'am62lx' || currentDevice === 'am62ax') {
            option1101.textContent = 'Reserved';
        } else if (currentDevice === 'am64x') {
            option1101.textContent = 'PCIe';
        } else {
            option1101.textContent = 'Fast-xSPI';
        }
    }
}

/**
 * Update PLL config dropdown options based on device
 */
function updatePllConfigOptions() {
    // Clear existing options
    elements.pllConfig.innerHTML = '';

    if (currentDevice === 'am62px' || currentDevice === 'am62lx' || currentDevice === 'am62ax' || currentDevice === 'am64x') {
        // AM62Px, AM62Lx, AM62Ax, and AM64x/AM243x have 25 MHz at 011
        const option010 = document.createElement('option');
        option010.value = '010';
        option010.textContent = 'Reserved (010)';
        elements.pllConfig.appendChild(option010);

        const option011 = document.createElement('option');
        option011.value = '011';
        option011.textContent = '25 MHz (011)';
        elements.pllConfig.appendChild(option011);

        const option100 = document.createElement('option');
        option100.value = '100';
        option100.textContent = 'Reserved (100)';
        elements.pllConfig.appendChild(option100);

        // Set default to 25 MHz
        elements.pllConfig.value = '011';
    } else {
        // AM62x and J722S have 25 MHz at 010
        const option010 = document.createElement('option');
        option010.value = '010';
        option010.textContent = '25 MHz (010)';
        elements.pllConfig.appendChild(option010);

        const option011 = document.createElement('option');
        option011.value = '011';
        option011.textContent = 'Reserved (011)';
        elements.pllConfig.appendChild(option011);

        const option100 = document.createElement('option');
        option100.value = '100';
        option100.textContent = 'Reserved (100)';
        elements.pllConfig.appendChild(option100);

        // Set default to 25 MHz
        elements.pllConfig.value = '010';
    }
}

/**
 * Handle use case selection change
 */
function handleUseCaseChange() {
    const useCase = elements.useCaseSelect.value;

    if (useCase === 'custom') {
        // Don't apply preset, just update display
        handleConfigChange();
        return;
    }

    // Apply preset configuration
    const preset = useCasePresets[useCase];
    if (preset) {
        // Set PLL config based on device (AM62Px, AM62Lx, AM62Ax, and AM64x use 011 for 25 MHz, others use 010)
        if (currentDevice === 'am62px' || currentDevice === 'am62lx' || currentDevice === 'am62ax' || currentDevice === 'am64x') {
            elements.pllConfig.value = '011'; // 25 MHz for AM62Px, AM62Lx, AM62Ax, and AM64x
        } else {
            elements.pllConfig.value = preset.pllConfig; // 010 for AM62x and J722S
        }

        elements.primaryBootMode.value = preset.primaryBootMode;
        elements.backupBootMode.value = preset.backupBootMode;
        elements.backupBootConfig.value = preset.backupBootConfig;

        // Update primary boot config options first
        updatePrimaryBootConfigOptions();

        // Then set the preset value
        elements.primaryBootConfig.value = preset.primaryBootConfig;

        // Update all displays
        updateBackupBootConfigDescription();
        handleConfigChange();
    }
}

/**
 * Handle primary boot mode change
 */
function handlePrimaryBootModeChange() {
    // Set use case to custom when manually changing boot mode
    elements.useCaseSelect.value = 'custom';
    updatePrimaryBootConfigOptions();
    handleConfigChange();
}

/**
 * Handle backup boot mode change
 */
function handleBackupBootModeChange() {
    // Set use case to custom when manually changing boot mode
    elements.useCaseSelect.value = 'custom';
    updateBackupBootConfigDescription();
    handleConfigChange();
}

/**
 * Update primary boot config dropdown options based on selected boot mode
 */
function updatePrimaryBootConfigOptions() {
    const bootMode = elements.primaryBootMode.value;
    const configDropdown = elements.primaryBootConfig;
    const modeInfo = getPrimaryBootModeDescriptions()[bootMode];

    if (modeInfo && modeInfo.configs) {
        // Clear existing options
        configDropdown.innerHTML = '';

        // Add new options
        modeInfo.configs.forEach((description, index) => {
            const option = document.createElement('option');
            const binaryValue = index.toString(2).padStart(3, '0');
            option.value = binaryValue;
            option.textContent = `${description} (${binaryValue})`;
            configDropdown.appendChild(option);
        });

        // Update description
        updatePrimaryBootConfigDescription();
    }
}

/**
 * Update primary boot config description
 */
function updatePrimaryBootConfigDescription() {
    const bootMode = elements.primaryBootMode.value;
    const modeInfo = getPrimaryBootModeDescriptions()[bootMode];

    if (modeInfo) {
        elements.primaryBootConfigDesc.textContent = `Configuration options for ${modeInfo.name}`;
    }
}

/**
 * Update backup boot config description
 */
function updateBackupBootConfigDescription() {
    const backupMode = elements.backupBootMode.value;
    const modeInfo = getBackupBootModeDescriptions()[backupMode];

    if (modeInfo) {
        const configValue = elements.backupBootConfig.value;
        const description = configValue === '0' ? modeInfo.config0 : modeInfo.config1;
        elements.backupBootConfigDesc.textContent = `${modeInfo.name}: ${description}`;
    }
}

/**
 * Handle any configuration change
 */
function handleConfigChange() {
    captureCurrentConfig();
    updateDisplay();
}

/**
 * Handle manual configuration change (sets use case to custom)
 */
function handleManualConfigChange() {
    elements.useCaseSelect.value = 'custom';
    handleConfigChange();
}

/**
 * Capture current configuration from UI
 */
function captureCurrentConfig() {
    // For AM62Lx in reduced pincount mode, use the predefined value
    if (currentDevice === 'am62lx' && appState.pincountMode === 'reduced') {
        // Don't capture regular config, it will use the reduced pincount value
        return;
    }

    appState.pllConfig = elements.pllConfig.value;
    appState.primaryBootMode = elements.primaryBootMode.value;
    appState.primaryBootConfig = elements.primaryBootConfig.value;
    appState.backupBootMode = elements.backupBootMode.value;
    appState.backupBootConfig = elements.backupBootConfig.value;

    // For AM62Lx, reserved bits depend on pincount mode
    if (currentDevice === 'am62lx') {
        if (appState.pincountMode === 'full') {
            appState.reserved = '00';
        } else {
            // Reduced mode - first 2 bits come from the selection
            appState.reserved = appState.reducedPincountOption.substring(0, 2);
        }
    } else {
        appState.reserved = '00'; // Always 00 for other devices
    }
}

/**
 * Calculate the 16-bit boot mode value from current configuration
 */
function calculateBootModeValue() {
    // For AM62Lx in reduced pincount mode, return the predefined value directly
    if (currentDevice === 'am62lx' && appState.pincountMode === 'reduced') {
        const reducedMode = am62lxReducedPincountModes[appState.reducedPincountOption];
        if (reducedMode) {
            return reducedMode.value;
        }
    }

    // Build 16-bit value from MSB to LSB
    // Bits 15-14: Reserved (00) or Pincount Mode (AM62Lx)
    // Bit 13: Backup Boot Config
    // Bits 12-10: Backup Boot Mode
    // Bits 9-7: Primary Boot Config
    // Bits 6-3: Primary Boot Mode
    // Bits 2-0: PLL Config

    const binaryString =
        appState.reserved +                    // Bits 15-14
        appState.backupBootConfig +            // Bit 13
        appState.backupBootMode +              // Bits 12-10
        appState.primaryBootConfig +           // Bits 9-7
        appState.primaryBootMode +             // Bits 6-3
        appState.pllConfig;                    // Bits 2-0

    return parseInt(binaryString, 2);
}

/**
 * Update all display elements with current configuration
 */
function updateDisplay() {
    // Calculate and display values
    const value = calculateBootModeValue();
    const hexValue = '0x' + value.toString(16).toUpperCase().padStart(4, '0');
    const binaryValue = value.toString(2).padStart(16, '0');

    // For AM62Lx in reduced pincount mode, decompose the value to show all bit fields
    if (currentDevice === 'am62lx' && appState.pincountMode === 'reduced') {
        // Decompose the 16-bit value into its components
        elements.reservedBits.textContent = binaryValue.substring(0, 2);           // Bits 15-14
        elements.backupConfigBits.textContent = binaryValue.substring(2, 3);       // Bit 13
        elements.backupModeBits.textContent = binaryValue.substring(3, 6);         // Bits 12-10
        elements.primaryConfigBits.textContent = binaryValue.substring(6, 9);      // Bits 9-7
        elements.primaryModeBits.textContent = binaryValue.substring(9, 13);       // Bits 6-3
        elements.pllConfigBits.textContent = binaryValue.substring(13, 16);        // Bits 2-0
    } else {
        // Normal mode - use appState values
        elements.reservedBits.textContent = appState.reserved;
        elements.backupConfigBits.textContent = appState.backupBootConfig;
        elements.backupModeBits.textContent = appState.backupBootMode;
        elements.primaryConfigBits.textContent = appState.primaryBootConfig;
        elements.primaryModeBits.textContent = appState.primaryBootMode;
        elements.pllConfigBits.textContent = appState.pllConfig;
    }

    // Format binary value with spaces for readability
    const formattedBinary = binaryValue.match(/.{1,4}/g).join(' ');

    elements.hexValue.textContent = hexValue;
    elements.binaryValue.textContent = formattedBinary;
    elements.decimalValue.textContent = value;

    // Update simplified view
    updateSimplifiedView();
}

/**
 * Update the simplified view with human-readable boot configuration
 */
function updateSimplifiedView() {
    const arrow = '<span class="arrow">→</span>';

    // For AM62Lx in reduced pincount mode, show the preset description
    if (currentDevice === 'am62lx' && appState.pincountMode === 'reduced') {
        const reducedMode = am62lxReducedPincountModes[appState.reducedPincountOption];
        if (reducedMode) {
            elements.simplifiedView.innerHTML = `<strong>Reduced Pincount:</strong> ${reducedMode.description}`;
            return;
        }
    }

    // Get PLL description
    const pllOption = elements.pllConfig.options[elements.pllConfig.selectedIndex];
    const pllText = pllOption ? pllOption.text.split(' (')[0] : '25 MHz';

    // Get primary boot mode name
    const primaryModeInfo = getPrimaryBootModeDescriptions()[appState.primaryBootMode];
    const primaryText = primaryModeInfo ? primaryModeInfo.name : 'Unknown';

    // Get backup boot mode name
    const backupModeInfo = getBackupBootModeDescriptions()[appState.backupBootMode];
    const backupText = backupModeInfo ? backupModeInfo.name : 'None';

    // Build simplified view
    elements.simplifiedView.innerHTML =
        `${pllText} PLL ${arrow} ${primaryText} Primary ${arrow} ${backupText} Backup`;
}

/**
 * Copy hex value to clipboard
 */
function copyHexValue() {
    const hexValue = elements.hexValue.textContent;
    navigator.clipboard.writeText(hexValue).then(() => {
        showCopyFeedback(elements.copyHexBtn, 'Copied!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showCopyFeedback(elements.copyHexBtn, 'Failed');
    });
}

/**
 * Copy binary value to clipboard
 */
function copyBinaryValue() {
    const binaryValue = elements.binaryValue.textContent.replace(/\s/g, '');
    const formattedValue = '0b' + binaryValue;
    navigator.clipboard.writeText(formattedValue).then(() => {
        showCopyFeedback(elements.copyBinaryBtn, 'Copied!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showCopyFeedback(elements.copyBinaryBtn, 'Failed');
    });
}

/**
 * Show temporary feedback on button after copy
 */
function showCopyFeedback(button, message) {
    const originalText = button.textContent;
    button.textContent = message;
    button.disabled = true;

    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 1500);
}

/**
 * Export configuration as JSON
 */
function exportConfiguration() {
    const value = calculateBootModeValue();
    const config = {
        device: elements.deviceSelect.value,
        bootModeValue: {
            hex: '0x' + value.toString(16).toUpperCase().padStart(4, '0'),
            binary: '0b' + value.toString(2).padStart(16, '0'),
            decimal: value
        },
        configuration: {
            pllConfig: {
                value: appState.pllConfig,
                description: elements.pllConfig.options[elements.pllConfig.selectedIndex].text
            },
            primaryBootMode: {
                value: appState.primaryBootMode,
                description: elements.primaryBootMode.options[elements.primaryBootMode.selectedIndex].text
            },
            primaryBootConfig: {
                value: appState.primaryBootConfig,
                description: elements.primaryBootConfig.options[elements.primaryBootConfig.selectedIndex].text
            },
            backupBootMode: {
                value: appState.backupBootMode,
                description: elements.backupBootMode.options[elements.backupBootMode.selectedIndex].text
            },
            backupBootConfig: {
                value: appState.backupBootConfig,
                description: elements.backupBootConfig.options[elements.backupBootConfig.selectedIndex].text
            }
        },
        timestamp: new Date().toISOString()
    };

    // Create download link
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'bootstrap_config.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showCopyFeedback(elements.exportConfigBtn, 'Exported!');
}

/**
 * Reset configuration to defaults
 */
function resetToDefaults() {
    // Reset to defaults (AM62x, SD Card + UART backup use case)
    elements.deviceSelect.value = 'am62x';
    elements.useCaseSelect.value = 'sd_uart';

    // Update device-specific options
    handleDeviceChange();

    showCopyFeedback(elements.resetBtn, 'Reset!');
}

/**
 * Initialize the application
 */
function init() {
    initializeElements();
    attachEventListeners();

    // Set default device
    currentDevice = elements.deviceSelect.value;

    // Show/hide AM62Lx UI based on selected device
    toggleAM62LxUI();

    // Update PLL config options for selected device
    updatePllConfigOptions();

    // Update primary boot mode options for selected device
    updatePrimaryBootModeOptions();

    // Apply default use case preset (SD Card + UART)
    handleUseCaseChange();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
