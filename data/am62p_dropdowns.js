/**
 * AM62P Dropdown Options
 * Extracted from SPRUJD9_AM62P_PET_1_1.xlsm - MDB and Use Case sheets
 * Contains peripheral configuration options for AM62P
 */

window.TI_AM62P_DROPDOWNS = {
    "uart_modes": [
        {
            "id": "off",
            "label": "Off / Powered Down",
            "description": "UART disabled"
        },
        {
            "id": "115200",
            "label": "115.2 kbps",
            "description": "Standard baud rate"
        },
        {
            "id": "230400",
            "label": "230.4 kbps",
            "description": "High speed"
        },
        {
            "id": "460800",
            "label": "460.8 kbps",
            "description": "Very high speed"
        }
    ],
    "spi_modes": [
        {
            "id": "off",
            "label": "Off / Powered Down",
            "description": "SPI disabled"
        },
        {
            "id": "10mhz",
            "label": "10 MHz",
            "description": "Standard speed"
        },
        {
            "id": "25mhz",
            "label": "25 MHz",
            "description": "High speed"
        },
        {
            "id": "48mhz",
            "label": "48 MHz",
            "description": "Maximum speed"
        }
    ],
    "i2c_modes": [
        {
            "id": "off",
            "label": "Off / Powered Down",
            "description": "I2C disabled"
        },
        {
            "id": "100khz",
            "label": "100 kHz (Standard)",
            "description": "Standard I2C"
        },
        {
            "id": "400khz",
            "label": "400 kHz (Fast)",
            "description": "Fast I2C"
        },
        {
            "id": "1mhz",
            "label": "1 MHz (Fast Plus)",
            "description": "Very fast I2C"
        }
    ],
    "canfd_modes": [
        {
            "id": "12mbs_1p8v",
            "label": "12 Mb.S 1.8V",
            "description": "CAN-FD at 12 Mb.S 1.8V"
        },
        {
            "id": "12mbs_3p3v",
            "label": "12 Mb.S 3.3V",
            "description": "CAN-FD at 12 Mb.S 3.3V"
        },
        {
            "id": "1mbs_1p8v",
            "label": "1 Mb.S 1.8V",
            "description": "CAN-FD at 1 Mb.S 1.8V"
        },
        {
            "id": "1mbs_3p3v",
            "label": "1 Mb.S 3.3V",
            "description": "CAN-FD at 1 Mb.S 3.3V"
        },
        {
            "id": "1mbs_8p8v",
            "label": "1 Mb.S 8.8V",
            "description": "CAN-FD at 1 Mb.S 8.8V"
        },
        {
            "id": "250kbs_1p8v",
            "label": "250 Kb.S 1.8V",
            "description": "CAN-FD at 250 Kb.S 1.8V"
        },
        {
            "id": "250kbs_3p3v",
            "label": "250 Kb.S 3.3V",
            "description": "CAN-FD at 250 Kb.S 3.3V"
        },
        {
            "id": "5mbs_1p8v",
            "label": "5 Mb.S 1.8V",
            "description": "CAN-FD at 5 Mb.S 1.8V"
        },
        {
            "id": "5mbs_3p3v",
            "label": "5 Mb.S 3.3V",
            "description": "CAN-FD at 5 Mb.S 3.3V"
        },
        {
            "id": "8mbs_1p8v",
            "label": "8 Mb.S 1.8V",
            "description": "CAN-FD at 8 Mb.S 1.8V"
        },
        {
            "id": "8mbs_3p3v",
            "label": "8 Mb.S 3.3V",
            "description": "CAN-FD at 8 Mb.S 3.3V"
        },
        {
            "id": "off",
            "label": "Off / Powered Down",
            "description": "CAN-FD disabled"
        }
    ],
    "ddr_modes": [
        {
            "id": "sleep",
            "label": "Sleep / Self-Refresh",
            "description": "DDR in low power mode"
        },
        {
            "id": "lpddr4_1600",
            "label": "LPDDR4-1600",
            "description": "1600 MT/s"
        },
        {
            "id": "lpddr4_2133",
            "label": "LPDDR4-2133",
            "description": "2133 MT/s"
        },
        {
            "id": "lpddr4_2667",
            "label": "LPDDR4-2667",
            "description": "2667 MT/s"
        },
        {
            "id": "lpddr4_3200",
            "label": "LPDDR4-3200",
            "description": "3200 MT/s"
        },
        {
            "id": "lpddr4_3733",
            "label": "LPDDR4-3733",
            "description": "3733 MT/s"
        },
        {
            "id": "lpddr4_4000",
            "label": "LPDDR4-4000",
            "description": "4000 MT/s"
        },
        {
            "id": "lpddr4_4267",
            "label": "LPDDR4-4267",
            "description": "4267 MT/s"
        }
    ],
    "display_modes": [
        {
            "id": "off",
            "label": "Off / Powered Down",
            "description": "Display disabled"
        },
        {
            "id": "640x480_60",
            "label": "SD - 640x480 @ 60fps",
            "description": "Standard definition"
        },
        {
            "id": "800x600_60",
            "label": "SVGA - 800x600 @ 60fps",
            "description": "SVGA resolution"
        },
        {
            "id": "1280x720_30",
            "label": "HD - 1280x720 @ 30fps",
            "description": "HD 720p low refresh"
        },
        {
            "id": "1280x720_60",
            "label": "HD - 1280x720 @ 60fps",
            "description": "HD 720p high refresh"
        },
        {
            "id": "1920x1080_30",
            "label": "Full HD - 1920x1080 @ 30fps",
            "description": "Full HD low refresh"
        },
        {
            "id": "1920x1080_60",
            "label": "Full HD - 1920x1080 @ 60fps",
            "description": "Full HD high refresh"
        },
        {
            "id": "2048x1080_30",
            "label": "2K - 2048x1080 @ 30fps",
            "description": "2K resolution low refresh"
        },
        {
            "id": "2048x1080_60",
            "label": "2K - 2048x1080 @ 60fps",
            "description": "2K resolution high refresh"
        }
    ],
    "ethernet_modes": [
        {
            "id": "off",
            "label": "Off / Powered Down",
            "description": "Ethernet disabled"
        },
        {
            "id": "10mbps",
            "label": "10 Mbps",
            "description": "10BASE-T"
        },
        {
            "id": "100mbps",
            "label": "100 Mbps",
            "description": "100BASE-TX"
        },
        {
            "id": "1000mbps",
            "label": "1000 Mbps (1 Gbps)",
            "description": "1000BASE-T / Gigabit"
        }
    ],
    "usb_modes": [
        {
            "id": "off",
            "label": "Off / Powered Down",
            "description": "USB disabled"
        },
        {
            "id": "usb2_480",
            "label": "USB 2.0 (480 Mbps)",
            "description": "High-speed USB"
        },
        {
            "id": "usb3_5000",
            "label": "USB 3.0 (5 Gbps)",
            "description": "SuperSpeed USB"
        }
    ],
    "mcasp_modes": [
        {
            "id": "off",
            "label": "Off / Powered Down",
            "description": "McASP disabled"
        },
        {
            "id": "i2s_16_48k",
            "label": "I2S 16-bit @ 48kHz",
            "description": "Standard audio"
        },
        {
            "id": "i2s_24_48k",
            "label": "I2S 24-bit @ 48kHz",
            "description": "High quality audio"
        },
        {
            "id": "tdm",
            "label": "TDM Mode",
            "description": "Time Division Multiplexed"
        }
    ],
    "csi_modes": [
        {
            "id": "off",
            "label": "Off / Powered Down",
            "description": "CSI disabled"
        },
        {
            "id": "1lane_720p_30",
            "label": "1-Lane 720p @ 30fps",
            "description": "Single lane camera"
        },
        {
            "id": "2lane_1080p_30",
            "label": "2-Lane 1080p @ 30fps",
            "description": "Dual lane camera"
        },
        {
            "id": "4lane_4k_30",
            "label": "4-Lane 4K @ 30fps",
            "description": "Quad lane camera"
        }
    ],
    "mmc_modes": [
        {
            "id": "off",
            "label": "Off / Powered Down",
            "description": "MMC/SD disabled"
        },
        {
            "id": "sd_25mhz",
            "label": "SD 25 MHz (Default Speed)",
            "description": "Standard SD"
        },
        {
            "id": "sd_50mhz",
            "label": "SD 50 MHz (High Speed)",
            "description": "High speed SD"
        },
        {
            "id": "emmc_200mhz",
            "label": "eMMC 200 MHz (HS200)",
            "description": "High speed eMMC"
        }
    ],
    "gpio_modes": [
        {
            "id": "low",
            "label": "Low Power / Minimal Activity",
            "description": "GPIO mostly idle"
        },
        {
            "id": "moderate",
            "label": "Moderate Activity",
            "description": "Some GPIO toggling"
        },
        {
            "id": "high",
            "label": "High Activity",
            "description": "Frequent GPIO toggling"
        }
    ]
};

console.log('AM62P Dropdowns loaded: 12 categories');
